import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppStateProvider } from './context/AppState'
import { StaffShell, StudentShell } from './components/Shells'
import { StaffLogin, StudentLogin } from './pages/Login'
import { HomeMap } from './pages/HomeMap'
import { Codex } from './pages/Codex'
import { StageOverview } from './pages/StageOverview'
import { ChapterLearn } from './pages/ChapterLearn'
import { CaseWalkthrough } from './pages/CaseWalkthrough'
import { ProcedureSim } from './pages/ProcedureSim'
import { CbtResult, FinalCbt } from './pages/FinalCbt'
import {
  ContentAdmin,
  CbtResultsAdmin,
  ProgressDashboard,
  StudentAdmin,
  UnitListPage,
  UnitEditor,
} from './pages/Admin'

export default function App() {
  return (
    <AppStateProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<StudentLogin />} />
          <Route path="/staff/login" element={<StaffLogin />} />

          <Route path="/app" element={<StudentShell />}>
            <Route index element={<HomeMap />} />
            <Route path="codex" element={<Codex />} />
            <Route path="stage/:stageId" element={<StageOverview />} />
            <Route path="stage/:stageId/chapter/:chapterId" element={<ChapterLearn />} />
            <Route path="stage/:stageId/case" element={<CaseWalkthrough />} />
            <Route path="stage/:stageId/procedure" element={<ProcedureSim />} />
            <Route path="cbt" element={<FinalCbt />} />
            <Route path="cbt/result" element={<CbtResult />} />
          </Route>

          <Route path="/staff" element={<StaffShell />}>
            <Route index element={<Navigate to="progress" replace />} />
            <Route path="progress" element={<ProgressDashboard />} />
            <Route path="students" element={<StudentAdmin />} />
            <Route path="content" element={<ContentAdmin />} />
            <Route path="content/:stageId" element={<UnitListPage />} />
            <Route path="content/:stageId/unit/:unitId" element={<UnitEditor />} />
            <Route path="cbt" element={<CbtResultsAdmin />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppStateProvider>
  )
}
