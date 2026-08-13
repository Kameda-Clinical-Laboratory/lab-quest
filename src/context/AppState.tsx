import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  CBT_QUESTIONS,
  INITIAL_STUDENTS,
  STAFF_USERS,
  STAGES,
  emptyProgress,
  getStage,
  isStageCleared,
} from '../mocks/data'
import {
  buildCbtPaper,
  ensureDayPlans,
  getRealTodayJstIso,
  getTodayQueue,
  sortDates,
} from '../mocks/schedule'
import type { CbtQuestion, DayPlan, Stage, StaffRole, StaffUser, Student } from '../mocks/types'
import { isUnitCleared } from '../mocks/learning'
import { backendMode } from '../lib/backendMode'
import { fetchCurriculum } from '../lib/curriculumApi'
import { loginStaffApi, loginStudentApi } from '../lib/authApi'
import {
  clearStaffSession,
  clearStudentSession,
  loadStaffSession,
  loadStudentSession,
  saveStaffSession,
  saveStudentSession,
  type StudentSession,
} from '../lib/session'
import {
  completeBeatApi,
  completeCaseApi,
  completeChapterApi,
  completeProcedureApi,
  getActiveCbtQuestionsApi,
  getStudentState,
  recordConsentApi,
  recordLoginStampApi,
  setUnitCursorApi,
  startCbtApi,
  submitCbtApi,
  type LoginStampResult,
  type ServerStudentState,
} from '../lib/studentProgressApi'
import {
  listStudentConsentApi,
  resetStudentPasswordApi,
  upsertStudentApi,
} from '../lib/contentAdminApi'

interface AppStateValue {
  students: Student[]
  stages: Stage[]
  /** Supabaseモード時、カリキュラム取得が完了しているか(初回ロード判定用) */
  stagesLoaded: boolean
  /**
   * Supabaseモード時、ログイン中学生の本物の状態(get_state)取得が完了しているか。
   * 同意ゲート(StudentShell)がこれを見て、非同期フェッチ中の一瞬だけ
   * currentStudent.consentAt が未確定のまま誤って/consentへ弾かないようにする。
   */
  studentStateLoaded: boolean
  /**
   * 今回のセッションでログインスタンプを記録した結果(Supabaseモードのみ)。
   * isNew=trueのときだけホーム画面がポップアップ演出を出す。
   */
  loginStampResult: LoginStampResult | null
  cbtQuestionBank: typeof CBT_QUESTIONS
  mockToday: string
  setMockToday: (date: string) => void
  currentStudentId: string | null
  currentStaff: StaffUser | null
  loginStudent: (nameOrCode: string, password: string) => Promise<string | null>
  logoutStudent: () => void
  loginStaff: (password: string) => Promise<string | null>
  logoutStaff: () => void
  currentStudent: Student | null
  todayQueue: ReturnType<typeof getTodayQueue> | null
  completeChapter: (chapterId: string, xp: number) => void
  completeCase: (stageId: string) => void
  completeProcedure: (stageId: string) => void
  maybeClearStage: (stageId: string) => void
  /** Clear a learning-loop beat; grants clue and XP once */
  completeBeat: (opts: {
    beatId: string
    xp?: number
    clueId?: string
    unitId?: string
    nextBeatIndex?: number
    stageId?: string
  }) => void
  setUnitCursor: (unitId: string, beatIndex: number) => void
  startCbt: () => Promise<CbtQuestion[]>
  getActiveCbtQuestions: () => CbtQuestion[]
  submitCbt: (answers: Record<string, number>) => Promise<number>
  recordConsent: (consentVersion: string) => Promise<void>
  allowCbtRetake: (studentId: string) => void
  resetStudentPassword: (studentId: string, password: string) => Promise<void>
  upsertStudent: (input: {
    id?: string
    name: string
    password: string
    visitDates: string[]
    dayPlans: DayPlan[]
    schoolName?: string | null
  }) => Promise<void>
  updateDayPlan: (studentId: string, plan: DayPlan) => void
  setVisitDates: (studentId: string, dates: string[]) => void
  setPublished: (stageId: string, published: boolean) => void
  publishedStageIds: string[]
  staffRole: StaffRole | null
}

const AppStateContext = createContext<AppStateValue | null>(null)

/** stages の空配列フォールバック用。毎レンダー新しい配列を作って参照を揺らさないための定数。 */
const EMPTY_STAGES: Stage[] = []

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS)

  // Phase 2/3: supabaseモードでは sessionStorage のJWTからログイン状態を復元する。
  // 進捗の実データはPhase 3からDB(student_progress等)由来になるが、
  // 「実習日程・スタッフ管理画面のキー」としては引き続きモック配列のidを使うため、
  // codeが一致するモック学生に橋渡しする(idはモックのまま、中身はDB由来に差し替える)。
  const initialStudentSession = backendMode === 'supabase' ? loadStudentSession() : null
  const [studentSession, setStudentSessionState] = useState<StudentSession | null>(
    initialStudentSession,
  )
  const [currentStudentId, setCurrentStudentId] = useState<string | null>(() => {
    if (!initialStudentSession) return null
    const matched = INITIAL_STUDENTS.find(
      (s) => s.code.toUpperCase() === initialStudentSession.student.code.toUpperCase(),
    )
    return matched?.id ?? null
  })
  const [currentStaff, setCurrentStaff] = useState<StaffUser | null>(() => {
    if (backendMode !== 'supabase') return null
    const session = loadStaffSession()
    if (!session) return null
    return { id: session.staff.id, name: session.staff.name, role: session.staff.role, password: '' }
  })
  const [publishedStageIds, setPublishedStageIds] = useState<string[]>(STAGES.map((s) => s.id))
  // 既定は実際の「今日」(JST)。スタッフの「モック今日」上書き(setMockToday)は
  // プレビュー用途としてそのまま使える。
  const [mockToday, setMockToday] = useState(getRealTodayJstIso)

  // Phase 1: バックエンドモードが 'supabase' のときだけ、学生向け(公開分のみ)の
  // カリキュラムをRPC(get_curriculum)経由で取得する。'mock' のときは従来どおり
  // 静的な STAGES を使う。
  const curriculumQuery = useQuery({
    queryKey: ['curriculum', 'student'],
    queryFn: () => fetchCurriculum(true),
    enabled: backendMode === 'supabase',
    staleTime: 60_000,
  })
  const curriculumData = curriculumQuery.data
  const stages: Stage[] = useMemo(
    () => (backendMode === 'supabase' ? (curriculumData ?? EMPTY_STAGES) : STAGES),
    [curriculumData],
  )
  const stagesLoaded = backendMode === 'supabase' ? curriculumQuery.isSuccess : true

  const currentStudent = students.find((s) => s.id === currentStudentId) ?? null
  const todayQueue = currentStudent ? getTodayQueue(currentStudent, mockToday) : null

  const patchStudent = useCallback((id: string, fn: (s: Student) => Student) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? fn(s) : s)))
  }, [])

  // Phase 3: サーバーから返ってきた本物のStudent状態を、橋渡し先のモック学生のidに
  // 差し替えて反映する。id/passwordはモック側のまま(このアプリ内での参照キーのため)、
  // それ以外(name/code/visitDates/dayPlans/progress)は丸ごとサーバー値に置き換える。
  const syncServerStudent = useCallback(
    (server: ServerStudentState) => {
      if (!currentStudentId) return
      patchStudent(currentStudentId, (s) => ({
        ...s,
        name: server.name,
        code: server.code,
        schoolName: server.schoolName,
        consentAt: server.consentAt,
        visitDates: server.visitDates,
        dayPlans: server.dayPlans,
        stampDates: server.stampDates,
        progress: server.progress,
      }))
    },
    [currentStudentId, patchStudent],
  )

  // Phase 3: ログイン中(supabaseモード)は本物の進捗を取得し、モック配列側に同期する。
  const studentStateQuery = useQuery({
    queryKey: ['studentState', studentSession?.student.id],
    queryFn: () => getStudentState(studentSession!.token),
    enabled: backendMode === 'supabase' && !!studentSession,
    staleTime: 10_000,
  })

  useEffect(() => {
    if (backendMode !== 'supabase') return
    if (!studentStateQuery.data) return
    syncServerStudent(studentStateQuery.data.student)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentStateQuery.data])

  // ログインボーナス: セッションごとに1回、今日のログインスタンプを記録しに行く。
  // サーバー側(fn_record_login_stamp)が「今日はまだか」を判定するので、
  // 同じ日に何度呼んでも2回目以降はisNew=falseが返るだけで安全。
  const [loginStampResult, setLoginStampResult] = useState<LoginStampResult | null>(null)
  useEffect(() => {
    if (backendMode !== 'supabase' || !studentSession) return
    let cancelled = false
    recordLoginStampApi(studentSession.token)
      .then(({ stamp, student }) => {
        if (cancelled) return
        setLoginStampResult(stamp)
        syncServerStudent(student)
      })
      .catch((err) => console.error('[recordLoginStamp]', err))
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentSession?.token])

  // Phase 3: CBT出題は全問題プールをクライアントに配布しない設計のため、
  // 「今出題されている問題」だけを別途取得してキャッシュする(リロード後の再開にも対応)。
  const drawnIdsKey = currentStudent?.progress.cbtDrawnIds.join(',') ?? ''
  const activeCbtQuery = useQuery({
    queryKey: ['activeCbtQuestions', studentSession?.student.id, drawnIdsKey],
    queryFn: () => getActiveCbtQuestionsApi(studentSession!.token),
    enabled: backendMode === 'supabase' && !!studentSession && drawnIdsKey.length > 0,
    staleTime: 60_000,
  })

  const loginStudent = useCallback(
    async (nameOrCode: string, password: string): Promise<string | null> => {
      if (backendMode === 'supabase') {
        let session
        try {
          session = await loginStudentApi(nameOrCode.trim(), password)
        } catch (err) {
          return err instanceof Error ? err.message : '受講者コードまたはパスワードが違います'
        }
        // 進捗の実体はDBだが、実習日程・スタッフ管理画面のキーはモック配列のidを使い続けるため、
        // 認証で確認できたcodeを手がかりにモック学生へ橋渡しする。
        const matched = students.find(
          (s) => s.code.toUpperCase() === session.student.code.toUpperCase(),
        )
        if (!matched) {
          return 'ログインは成功しましたが、対応する実習生データが見つかりません(開発中)'
        }
        saveStudentSession(session)
        clearStaffSession()
        setStudentSessionState(session)
        setCurrentStudentId(matched.id)
        setCurrentStaff(null)
        return null
      }

      const key = nameOrCode.trim()
      const keyUpper = key.toUpperCase()
      const found = students.find(
        (s) =>
          s.password === password.trim() &&
          (s.code.toUpperCase() === keyUpper ||
            s.name === key ||
            s.name.replace(/\s+/g, '') === key.replace(/\s+/g, '')),
      )
      if (!found) return '受講者コードまたはパスワードが違います'
      setCurrentStudentId(found.id)
      setCurrentStaff(null)
      return null
    },
    [students],
  )

  const logoutStudent = useCallback(() => {
    setCurrentStudentId(null)
    setStudentSessionState(null)
    clearStudentSession()
  }, [])

  const loginStaff = useCallback(async (password: string): Promise<string | null> => {
    if (backendMode === 'supabase') {
      let session
      try {
        session = await loginStaffApi(password)
      } catch (err) {
        return err instanceof Error ? err.message : 'パスワードが違います'
      }
      saveStaffSession(session)
      clearStudentSession()
      setStudentSessionState(null)
      setCurrentStaff({
        id: session.staff.id,
        name: session.staff.name,
        role: session.staff.role,
        password: '',
      })
      setCurrentStudentId(null)
      return null
    }

    const found = STAFF_USERS.find((s) => s.password === password.trim())
    if (!found) return 'パスワードが違います（モック: full / ops）'
    setCurrentStaff(found)
    setCurrentStudentId(null)
    return null
  }, [])

  const logoutStaff = useCallback(() => {
    setCurrentStaff(null)
    clearStaffSession()
  }, [])

  const refreshStageClear = useCallback(
    (studentId: string, stageId: string) => {
      patchStudent(studentId, (s) => {
        const stage = getStage(stages, stageId)
        if (!stage) return s
        if (!isStageCleared(stage, s.progress)) return s
        if (s.progress.clearedStageIds.includes(stageId)) return s
        return {
          ...s,
          progress: {
            ...s.progress,
            clearedStageIds: [...s.progress.clearedStageIds, stageId],
          },
        }
      })
    },
    [patchStudent, stages],
  )

  const completeChapter = useCallback(
    (chapterId: string, xp: number) => {
      if (backendMode === 'supabase') {
        if (!studentSession) return
        completeChapterApi(studentSession.token, chapterId, xp)
          .then(({ student }) => syncServerStudent(student))
          .catch((err) => console.error('[completeChapter]', err))
        return
      }
      if (!currentStudentId) return
      patchStudent(currentStudentId, (s) => {
        if (s.progress.clearedChapterIds.includes(chapterId)) return s
        return {
          ...s,
          progress: {
            ...s.progress,
            clearedChapterIds: [...s.progress.clearedChapterIds, chapterId],
            xp: s.progress.xp + xp,
          },
        }
      })
    },
    [currentStudentId, patchStudent, studentSession, syncServerStudent],
  )

  const completeCase = useCallback(
    (stageId: string) => {
      if (backendMode === 'supabase') {
        if (!studentSession) return
        completeCaseApi(studentSession.token, stageId)
          .then(({ student }) => syncServerStudent(student))
          .catch((err) => console.error('[completeCase]', err))
        return
      }
      if (!currentStudentId) return
      patchStudent(currentStudentId, (s) => {
        if (s.progress.clearedCaseStageIds.includes(stageId)) return s
        return {
          ...s,
          progress: {
            ...s.progress,
            clearedCaseStageIds: [...s.progress.clearedCaseStageIds, stageId],
            xp: s.progress.xp + 30,
          },
        }
      })
      refreshStageClear(currentStudentId, stageId)
    },
    [currentStudentId, patchStudent, refreshStageClear, studentSession, syncServerStudent],
  )

  const completeProcedure = useCallback(
    (stageId: string) => {
      if (backendMode === 'supabase') {
        if (!studentSession) return
        completeProcedureApi(studentSession.token, stageId)
          .then(({ student }) => syncServerStudent(student))
          .catch((err) => console.error('[completeProcedure]', err))
        return
      }
      if (!currentStudentId) return
      patchStudent(currentStudentId, (s) => {
        if (s.progress.clearedProcedureStageIds.includes(stageId)) return s
        return {
          ...s,
          progress: {
            ...s.progress,
            clearedProcedureStageIds: [...s.progress.clearedProcedureStageIds, stageId],
            xp: s.progress.xp + 40,
          },
        }
      })
      refreshStageClear(currentStudentId, stageId)
    },
    [currentStudentId, patchStudent, refreshStageClear, studentSession, syncServerStudent],
  )

  const maybeClearStage = useCallback(
    (stageId: string) => {
      // supabaseモードでは complete_beat/complete_case/complete_procedure の各RPCが
      // 実行のたびに fn_refresh_stage_clear をサーバー側で呼んでいるため、
      // ここでの追加チェックは不要(ページマウント時の保険的呼び出しを無視するだけ)。
      if (backendMode === 'supabase') return
      if (!currentStudentId) return
      refreshStageClear(currentStudentId, stageId)
    },
    [currentStudentId, refreshStageClear],
  )

  const completeBeat = useCallback(
    (opts: {
      beatId: string
      xp?: number
      clueId?: string
      unitId?: string
      nextBeatIndex?: number
      stageId?: string
    }) => {
      if (backendMode === 'supabase') {
        if (!studentSession || !opts.unitId || opts.nextBeatIndex == null || !opts.stageId) return
        completeBeatApi(studentSession.token, {
          beatId: opts.beatId,
          unitId: opts.unitId,
          nextBeatIndex: opts.nextBeatIndex,
          xp: opts.xp,
          clueId: opts.clueId,
          stageId: opts.stageId,
        })
          .then(({ student }) => syncServerStudent(student))
          .catch((err) => console.error('[completeBeat]', err))
        return
      }

      if (!currentStudentId) return
      patchStudent(currentStudentId, (s) => {
        const already = s.progress.clearedBeatIds.includes(opts.beatId)
        const owned = new Set(s.progress.ownedClueIds)
        if (opts.clueId) owned.add(opts.clueId)
        const unitCursors = { ...s.progress.unitCursors }
        if (opts.unitId != null && opts.nextBeatIndex != null) {
          unitCursors[opts.unitId] = opts.nextBeatIndex
        }
        const nextClearedBeatIds = already
          ? s.progress.clearedBeatIds
          : [...s.progress.clearedBeatIds, opts.beatId]

        // XPは幕クリアのたびではなく、クエスト(unit)が新たに完全クリアになった
        // 瞬間にそのunit配下の幕XP合計をまとめて加算する(supabaseモードの
        // fn_complete_beatと同じルール)。
        let xpGain = 0
        if (!already && opts.unitId) {
          const stage = opts.stageId ? getStage(stages, opts.stageId) : undefined
          const unit = stage?.units?.find((u) => u.id === opts.unitId)
          if (unit) {
            const wasCleared = isUnitCleared(unit, { clearedBeatIds: s.progress.clearedBeatIds })
            const nowCleared = isUnitCleared(unit, { clearedBeatIds: nextClearedBeatIds })
            if (!wasCleared && nowCleared) {
              xpGain = unit.beats.reduce((sum, b) => sum + (b.xp ?? 0), 0)
            }
          }
        }

        return {
          ...s,
          progress: {
            ...s.progress,
            clearedBeatIds: nextClearedBeatIds,
            ownedClueIds: Array.from(owned),
            unitCursors,
            xp: s.progress.xp + xpGain,
          },
        }
      })
      if (opts.stageId) refreshStageClear(currentStudentId, opts.stageId)
    },
    [currentStudentId, patchStudent, refreshStageClear, stages, studentSession, syncServerStudent],
  )

  const setUnitCursor = useCallback(
    (unitId: string, beatIndex: number) => {
      if (backendMode === 'supabase') {
        if (!studentSession) return
        setUnitCursorApi(studentSession.token, unitId, beatIndex)
          .then(({ student }) => syncServerStudent(student))
          .catch((err) => console.error('[setUnitCursor]', err))
        return
      }
      if (!currentStudentId) return
      patchStudent(currentStudentId, (s) => ({
        ...s,
        progress: {
          ...s.progress,
          unitCursors: { ...s.progress.unitCursors, [unitId]: beatIndex },
        },
      }))
    },
    [currentStudentId, patchStudent, studentSession, syncServerStudent],
  )

  const startCbt = useCallback(async (): Promise<CbtQuestion[]> => {
    if (backendMode === 'supabase') {
      if (!studentSession) return []
      const { questions, student } = await startCbtApi(studentSession.token)
      syncServerStudent(student)
      return questions
    }

    if (!currentStudent) return []
    if (
      currentStudent.progress.cbtDrawnIds.length > 0 &&
      !currentStudent.progress.cbtRetakeAllowed
    ) {
      return currentStudent.progress.cbtDrawnIds
        .map((id) => CBT_QUESTIONS.find((q) => q.id === id))
        .filter((q): q is CbtQuestion => Boolean(q))
    }
    const { questions, scopeStageIds } = buildCbtPaper(
      currentStudent.progress.clearedStageIds,
      CBT_QUESTIONS,
    )
    patchStudent(currentStudent.id, (s) => ({
      ...s,
      progress: {
        ...s.progress,
        cbtDrawnIds: questions.map((q) => q.id),
        cbtScopeStageIds: scopeStageIds,
        cbtRetakeAllowed: false,
      },
    }))
    return questions
  }, [currentStudent, patchStudent, studentSession, syncServerStudent])

  const getActiveCbtQuestions = useCallback((): CbtQuestion[] => {
    if (backendMode === 'supabase') {
      return activeCbtQuery.data?.questions ?? []
    }
    if (!currentStudent) return []
    const ids = currentStudent.progress.cbtDrawnIds
    if (ids.length === 0) return []
    return ids
      .map((id) => CBT_QUESTIONS.find((q) => q.id === id))
      .filter((q): q is CbtQuestion => Boolean(q))
  }, [currentStudent, activeCbtQuery.data])

  const submitCbt = useCallback(
    async (answers: Record<string, number>): Promise<number> => {
      if (backendMode === 'supabase') {
        if (!studentSession) return 0
        const { score, student } = await submitCbtApi(studentSession.token, answers)
        syncServerStudent(student)
        return score
      }

      if (!currentStudentId || !currentStudent) return 0
      const paper = getActiveCbtQuestions()
      let score = 0
      for (const q of paper) {
        if (answers[q.id] === q.correctIndex) score += 1
      }
      patchStudent(currentStudentId, (s) => ({
        ...s,
        progress: {
          ...s.progress,
          cbtSubmitted: true,
          cbtAnswers: answers,
          cbtScore: score,
          cbtRetakeAllowed: false,
        },
      }))
      return score
    },
    [
      currentStudentId,
      currentStudent,
      getActiveCbtQuestions,
      patchStudent,
      studentSession,
      syncServerStudent,
    ],
  )

  // Phase 5: 同意記録。supabaseモードのみ意味を持つ(モックモードは同意ゲート対象外で
  // そもそも呼ばれない想定だが、念のためno-opにしておく)。
  const recordConsent = useCallback(
    async (consentVersion: string): Promise<void> => {
      if (backendMode !== 'supabase' || !studentSession) return
      const { student } = await recordConsentApi(studentSession.token, consentVersion)
      syncServerStudent(student)
    },
    [studentSession, syncServerStudent],
  )

  // 以下はスタッフ側の学生管理操作。Phase 3のスコープは「学生自身の進捗」の書き込み経路のみで、
  // スタッフ管理画面(実習生名簿・日割り計画・CBT再受験許可等)の実データ化は別フェーズで扱うため、
  // supabaseモードでもここは引き続きモック配列のみを操作する(既知の制限)。
  const allowCbtRetake = useCallback(
    (studentId: string) => {
      patchStudent(studentId, (s) => ({
        ...s,
        progress: {
          ...s.progress,
          cbtSubmitted: false,
          cbtAnswers: {},
          cbtScore: null,
          cbtRetakeAllowed: true,
          cbtDrawnIds: [],
          cbtScopeStageIds: [],
        },
      }))
    },
    [patchStudent],
  )

  // Phase 4(M9)フォローアップ: 実習生登録/編集/パスワード再発行を実際にSupabaseへ
  // 書き込む。橋渡し方式(モック配列のidをアプリ内キーに使い続ける)は変えていない
  // ため、編集対象の実uuidは code をキーに fn_admin_list_student_consent 経由で
  // 都度引く(この関数は元々は同意日表示用だが、code→実uuidの一覧という性質は
  // ここでもそのまま使える)。
  const resolveRealStudentId = useCallback(async (code: string): Promise<string | null> => {
    const session = loadStaffSession()
    if (!session) return null
    try {
      const { students: rows } = await listStudentConsentApi(session.token)
      return rows.find((r) => r.code.toUpperCase() === code.toUpperCase())?.studentId ?? null
    } catch {
      return null
    }
  }, [])

  const resetStudentPassword = useCallback(
    async (studentId: string, password: string) => {
      if (backendMode === 'supabase') {
        const session = loadStaffSession()
        const mock = students.find((s) => s.id === studentId)
        if (!session || !mock) throw new Error('スタッフとしてログインし直してください')
        const realId = await resolveRealStudentId(mock.code)
        if (!realId) throw new Error('対応する実データが見つかりません')
        await resetStudentPasswordApi(session.token, { studentId: realId, password })
      }
      patchStudent(studentId, (s) => ({ ...s, password }))
    },
    [patchStudent, students, resolveRealStudentId],
  )

  const upsertStudent = useCallback(
    async (input: {
      id?: string
      name: string
      password: string
      visitDates: string[]
      dayPlans: DayPlan[]
      schoolName?: string | null
    }) => {
      const visitDates = sortDates(input.visitDates)
      const dayPlans = ensureDayPlans(visitDates, input.dayPlans)
      const schoolName = input.schoolName?.trim() || null

      if (backendMode === 'supabase') {
        const session = loadStaffSession()
        if (!session) throw new Error('スタッフとしてログインし直してください')

        if (input.id) {
          const mock = students.find((s) => s.id === input.id)
          if (!mock) throw new Error('編集対象の学生が見つかりません')
          const realId = await resolveRealStudentId(mock.code)
          if (!realId) throw new Error('対応する実データが見つかりません')
          // 編集保存ではpasswordを送らない(フォームに残った旧パスワード表示で
          // 実パスワードを意図せず上書きしないため。変更は resetStudentPassword 経由)。
          await upsertStudentApi(session.token, {
            id: realId,
            name: input.name,
            visitDates,
            dayPlans,
            schoolName,
          })
          patchStudent(input.id, (s) => ({ ...s, name: input.name, schoolName, visitDates, dayPlans }))
          return
        }

        // 新規登録: 実データを作成する。loginStudentはcode一致でモック配列を
        // 検索する橋渡し方式のため、このセッション内ですぐログインできるよう
        // 実uuid/実codeでモック配列にも追加しておく。別端末からの新規学生の
        // ログインは、この橋渡し方式自体を置き換えるまでの既知の制限として残る。
        const { studentId, code } = await upsertStudentApi(session.token, {
          name: input.name,
          password: input.password,
          visitDates,
          dayPlans,
          schoolName,
        })
        setStudents((prev) => [
          ...prev,
          {
            id: studentId,
            name: input.name,
            code: code ?? studentId,
            password: input.password,
            schoolName,
            visitDates,
            dayPlans,
            progress: emptyProgress(),
            consentAt: null,
            stampDates: [],
          },
        ])
        return
      }

      if (input.id) {
        patchStudent(input.id, (s) => ({
          ...s,
          name: input.name,
          password: input.password,
          schoolName,
          visitDates,
          dayPlans,
        }))
        return
      }
      const code = `TRAIN${String(students.length + 1).padStart(2, '0')}`
      setStudents((prev) => [
        ...prev,
        {
          id: `stu-${Date.now()}`,
          name: input.name,
          code,
          password: input.password,
          schoolName,
          visitDates,
          dayPlans,
          progress: emptyProgress(),
          consentAt: null,
          stampDates: [],
        },
      ])
    },
    [patchStudent, students, resolveRealStudentId],
  )

  const updateDayPlan = useCallback(
    (studentId: string, plan: DayPlan) => {
      patchStudent(studentId, (s) => {
        const others = s.dayPlans.filter((p) => p.date !== plan.date)
        return { ...s, dayPlans: [...others, plan].sort((a, b) => a.date.localeCompare(b.date)) }
      })
    },
    [patchStudent],
  )

  const setVisitDates = useCallback(
    (studentId: string, dates: string[]) => {
      patchStudent(studentId, (s) => {
        const visitDates = sortDates(dates)
        return { ...s, visitDates, dayPlans: ensureDayPlans(visitDates, s.dayPlans) }
      })
    },
    [patchStudent],
  )

  const setPublished = useCallback((stageId: string, published: boolean) => {
    setPublishedStageIds((prev) =>
      published ? Array.from(new Set([...prev, stageId])) : prev.filter((id) => id !== stageId),
    )
  }, [])

  const studentStateLoaded = backendMode === 'supabase' ? studentStateQuery.isSuccess : true

  const value = useMemo<AppStateValue>(
    () => ({
      students,
      stages,
      stagesLoaded,
      studentStateLoaded,
      loginStampResult,
      cbtQuestionBank: CBT_QUESTIONS,
      mockToday,
      setMockToday,
      currentStudentId,
      currentStaff,
      loginStudent,
      logoutStudent,
      loginStaff,
      logoutStaff,
      currentStudent,
      todayQueue,
      completeChapter,
      completeCase,
      completeProcedure,
      maybeClearStage,
      completeBeat,
      setUnitCursor,
      startCbt,
      getActiveCbtQuestions,
      submitCbt,
      recordConsent,
      allowCbtRetake,
      resetStudentPassword,
      upsertStudent,
      updateDayPlan,
      setVisitDates,
      setPublished,
      publishedStageIds,
      staffRole: currentStaff?.role ?? null,
    }),
    [
      students,
      stages,
      stagesLoaded,
      studentStateLoaded,
      loginStampResult,
      mockToday,
      currentStudentId,
      currentStaff,
      loginStudent,
      logoutStudent,
      loginStaff,
      logoutStaff,
      currentStudent,
      todayQueue,
      completeChapter,
      completeCase,
      completeProcedure,
      maybeClearStage,
      completeBeat,
      setUnitCursor,
      startCbt,
      getActiveCbtQuestions,
      submitCbt,
      recordConsent,
      allowCbtRetake,
      resetStudentPassword,
      upsertStudent,
      updateDayPlan,
      setVisitDates,
      setPublished,
      publishedStageIds,
    ],
  )

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState() {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider')
  return ctx
}
