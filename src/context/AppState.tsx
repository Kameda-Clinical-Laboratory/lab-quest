import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  CBT_QUESTIONS,
  INITIAL_STUDENTS,
  MOCK_TODAY_DEFAULT,
  STAFF_USERS,
  STAGES,
  emptyProgress,
  getStage,
  isStageCleared,
} from '../mocks/data'
import {
  buildCbtPaper,
  ensureDayPlans,
  getTodayQueue,
  sortDates,
} from '../mocks/schedule'
import type { CbtQuestion, DayPlan, StaffRole, StaffUser, Student } from '../mocks/types'

interface AppStateValue {
  students: Student[]
  stages: typeof STAGES
  cbtQuestionBank: typeof CBT_QUESTIONS
  mockToday: string
  setMockToday: (date: string) => void
  currentStudentId: string | null
  currentStaff: StaffUser | null
  loginStudent: (nameOrCode: string, password: string) => string | null
  logoutStudent: () => void
  loginStaff: (password: string) => string | null
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
  startCbt: () => CbtQuestion[]
  getActiveCbtQuestions: () => CbtQuestion[]
  submitCbt: (answers: Record<string, number>) => number
  allowCbtRetake: (studentId: string) => void
  resetStudentPassword: (studentId: string, password: string) => void
  upsertStudent: (input: {
    id?: string
    name: string
    password: string
    visitDates: string[]
    dayPlans: DayPlan[]
  }) => void
  updateDayPlan: (studentId: string, plan: DayPlan) => void
  setVisitDates: (studentId: string, dates: string[]) => void
  setPublished: (stageId: string, published: boolean) => void
  publishedStageIds: string[]
  staffRole: StaffRole | null
}

const AppStateContext = createContext<AppStateValue | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS)
  const [currentStudentId, setCurrentStudentId] = useState<string | null>(null)
  const [currentStaff, setCurrentStaff] = useState<StaffUser | null>(null)
  const [publishedStageIds, setPublishedStageIds] = useState<string[]>(STAGES.map((s) => s.id))
  const [mockToday, setMockToday] = useState(MOCK_TODAY_DEFAULT)

  const currentStudent = students.find((s) => s.id === currentStudentId) ?? null
  const todayQueue = currentStudent ? getTodayQueue(currentStudent, mockToday) : null

  const loginStudent = useCallback(
    (nameOrCode: string, password: string) => {
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

  const logoutStudent = useCallback(() => setCurrentStudentId(null), [])

  const loginStaff = useCallback((password: string) => {
    const found = STAFF_USERS.find((s) => s.password === password.trim())
    if (!found) return 'パスワードが違います（モック: full / ops）'
    setCurrentStaff(found)
    setCurrentStudentId(null)
    return null
  }, [])

  const logoutStaff = useCallback(() => setCurrentStaff(null), [])

  const patchStudent = useCallback((id: string, fn: (s: Student) => Student) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? fn(s) : s)))
  }, [])

  const refreshStageClear = useCallback(
    (studentId: string, stageId: string) => {
      patchStudent(studentId, (s) => {
        const stage = getStage(stageId)
        if (!stage) return s
        if (!isStageCleared(stage, s.progress)) return s
        if (s.progress.clearedStageIds.includes(stageId)) return s
        return {
          ...s,
          progress: {
            ...s.progress,
            clearedStageIds: [...s.progress.clearedStageIds, stageId],
            stamps: s.progress.stamps + 3,
            xp: s.progress.xp + 50,
          },
        }
      })
    },
    [patchStudent],
  )

  const completeChapter = useCallback(
    (chapterId: string, xp: number) => {
      if (!currentStudentId) return
      patchStudent(currentStudentId, (s) => {
        if (s.progress.clearedChapterIds.includes(chapterId)) return s
        return {
          ...s,
          progress: {
            ...s.progress,
            clearedChapterIds: [...s.progress.clearedChapterIds, chapterId],
            xp: s.progress.xp + xp,
            stamps: s.progress.stamps + 1,
          },
        }
      })
    },
    [currentStudentId, patchStudent],
  )

  const completeCase = useCallback(
    (stageId: string) => {
      if (!currentStudentId) return
      patchStudent(currentStudentId, (s) => {
        if (s.progress.clearedCaseStageIds.includes(stageId)) return s
        return {
          ...s,
          progress: {
            ...s.progress,
            clearedCaseStageIds: [...s.progress.clearedCaseStageIds, stageId],
            stamps: s.progress.stamps + 1,
            xp: s.progress.xp + 30,
          },
        }
      })
      refreshStageClear(currentStudentId, stageId)
    },
    [currentStudentId, patchStudent, refreshStageClear],
  )

  const completeProcedure = useCallback(
    (stageId: string) => {
      if (!currentStudentId) return
      patchStudent(currentStudentId, (s) => {
        if (s.progress.clearedProcedureStageIds.includes(stageId)) return s
        return {
          ...s,
          progress: {
            ...s.progress,
            clearedProcedureStageIds: [...s.progress.clearedProcedureStageIds, stageId],
            stamps: s.progress.stamps + 2,
            xp: s.progress.xp + 40,
          },
        }
      })
      refreshStageClear(currentStudentId, stageId)
    },
    [currentStudentId, patchStudent, refreshStageClear],
  )

  const maybeClearStage = useCallback(
    (stageId: string) => {
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
      if (!currentStudentId) return
      patchStudent(currentStudentId, (s) => {
        const already = s.progress.clearedBeatIds.includes(opts.beatId)
        const owned = new Set(s.progress.ownedClueIds)
        if (opts.clueId) owned.add(opts.clueId)
        const unitCursors = { ...s.progress.unitCursors }
        if (opts.unitId != null && opts.nextBeatIndex != null) {
          unitCursors[opts.unitId] = opts.nextBeatIndex
        }
        return {
          ...s,
          progress: {
            ...s.progress,
            clearedBeatIds: already
              ? s.progress.clearedBeatIds
              : [...s.progress.clearedBeatIds, opts.beatId],
            ownedClueIds: Array.from(owned),
            unitCursors,
            xp: already ? s.progress.xp : s.progress.xp + (opts.xp ?? 0),
          },
        }
      })
      if (opts.stageId) refreshStageClear(currentStudentId, opts.stageId)
    },
    [currentStudentId, patchStudent, refreshStageClear],
  )

  const setUnitCursor = useCallback(
    (unitId: string, beatIndex: number) => {
      if (!currentStudentId) return
      patchStudent(currentStudentId, (s) => ({
        ...s,
        progress: {
          ...s.progress,
          unitCursors: { ...s.progress.unitCursors, [unitId]: beatIndex },
        },
      }))
    },
    [currentStudentId, patchStudent],
  )

  const startCbt = useCallback(() => {
    if (!currentStudent) return [] as CbtQuestion[]
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
  }, [currentStudent, patchStudent])

  const getActiveCbtQuestions = useCallback(() => {
    if (!currentStudent) return []
    const ids = currentStudent.progress.cbtDrawnIds
    if (ids.length === 0) return []
    return ids
      .map((id) => CBT_QUESTIONS.find((q) => q.id === id))
      .filter((q): q is CbtQuestion => Boolean(q))
  }, [currentStudent])

  const submitCbt = useCallback(
    (answers: Record<string, number>) => {
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
    [currentStudentId, currentStudent, getActiveCbtQuestions, patchStudent],
  )

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

  const resetStudentPassword = useCallback(
    (studentId: string, password: string) => {
      patchStudent(studentId, (s) => ({ ...s, password }))
    },
    [patchStudent],
  )

  const upsertStudent = useCallback(
    (input: {
      id?: string
      name: string
      password: string
      visitDates: string[]
      dayPlans: DayPlan[]
    }) => {
      const visitDates = sortDates(input.visitDates)
      const dayPlans = ensureDayPlans(visitDates, input.dayPlans)
      if (input.id) {
        patchStudent(input.id, (s) => ({
          ...s,
          name: input.name,
          password: input.password,
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
          visitDates,
          dayPlans,
          progress: emptyProgress(),
        },
      ])
    },
    [patchStudent, students.length],
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

  const value = useMemo<AppStateValue>(
    () => ({
      students,
      stages: STAGES,
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
