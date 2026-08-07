export type StaffRole = 'full' | 'ops'

export type AreaId = 'biochem' | 'immuno'

export interface QuizQuestion {
  id: string
  prompt: string
  choices: string[]
  correctIndex: number
  explanation: string
}

export interface Chapter {
  id: string
  title: string
  lecture: string
  quiz: QuizQuestion
  xp: number
}

export interface CaseStep {
  id: string
  prompt: string
  choices: { label: string; correct: boolean; feedback: string }[]
}

export interface ProcedureStep {
  id: string
  label: string
  correctOrder: number
}

/** シリーズ（旧ステージ） */
export interface Stage {
  id: string
  areaId: AreaId
  title: string
  required: boolean
  hasProcedure: boolean
  chapters: Chapter[]
  caseSteps: CaseStep[]
  procedureSteps?: ProcedureStep[]
  procedureImageNote?: string
  /** Present = new conversation→investigate→resolve loop (see learning.ts) */
  units?: import('./learning').LearningUnit[]
  clues?: import('./learning').ClueDef[]
}

export interface CbtQuestion {
  id: string
  prompt: string
  choices: string[]
  correctIndex: number
  explanation: string
  sourceStageId: string
}

/** 実習1日分の計画。seriesIds が空なら見学などアプリなし */
export interface DayPlan {
  date: string
  seriesIds: string[]
  note?: string
}

export interface StudentProgress {
  clearedChapterIds: string[]
  clearedCaseStageIds: string[]
  clearedProcedureStageIds: string[]
  clearedStageIds: string[]
  /** New-loop beat completion */
  clearedBeatIds: string[]
  /** Clues earned via investigate */
  ownedClueIds: string[]
  /** Mid-unit resume cursor (beat index per unit) */
  unitCursors: Record<string, number>
  xp: number
  stamps: number
  cbtSubmitted: boolean
  cbtAnswers: Record<string, number>
  cbtScore: number | null
  cbtRetakeAllowed: boolean
  /** 受験開始時に確定した出題ID */
  cbtDrawnIds: string[]
  cbtScopeStageIds: string[]
}

export interface Student {
  id: string
  name: string
  code: string
  password: string
  /** 実習日 YYYY-MM-DD（カレンダー選択） */
  visitDates: string[]
  dayPlans: DayPlan[]
  progress: StudentProgress
}

export interface StaffUser {
  id: string
  name: string
  role: StaffRole
  password: string
}
