import { useCallback, useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/common/Navbar'
import ProtectedRoute from './components/common/ProtectedRoute'
import { initialWorkflows } from './mock/mockData'
import { LoginPage, SignupPage } from './pages/AuthPages'
import DashboardPage from './pages/DashboardPage'
import HistoryPage from './pages/HistoryPage'
import ToolsPage from './pages/ToolsPage'
import WorkflowDetailPage from './pages/WorkflowDetailPage'

const STORAGE_KEY = 'agentic-workflows'

function loadWorkflows() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return Array.isArray(saved) ? saved : initialWorkflows
  } catch {
    return initialWorkflows
  }
}

function ProtectedLayout({ children, theme, onToggleTheme }) {
  return <><Navbar theme={theme} onToggleTheme={onToggleTheme} /><main>{children}</main></>
}

export default function App() {
  const [workflows, setWorkflows] = useState(loadWorkflows)
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('agentic-theme') === 'light' ? 'light' : 'dark'
    } catch {
      return 'dark'
    }
  })
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('agentic-theme', theme)
    } catch {
      // The theme still works for this session if storage is unavailable.
    }
  }, [theme])
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(workflows)) }, [workflows])
  const toggleTheme = useCallback(() => {
    setTheme((current) => current === 'dark' ? 'light' : 'dark')
  }, [])
  const createWorkflow = useCallback((workflow) => {
    setWorkflows((current) => [workflow, ...current])
  }, [])
  const updateWorkflow = useCallback((id, updater) => {
    setWorkflows((current) => current.map((workflow) => {
      if (workflow.id !== id) return workflow
      return typeof updater === 'function' ? updater(workflow) : { ...workflow, ...updater }
    }))
  }, [])
  return (
    <div className="min-h-screen bg-canvas text-[#e8e8e1]">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<ProtectedLayout theme={theme} onToggleTheme={toggleTheme}><DashboardPage workflows={workflows} onCreateWorkflow={createWorkflow} /></ProtectedLayout>} />
          <Route path="/workflow/:id" element={<ProtectedLayout theme={theme} onToggleTheme={toggleTheme}><WorkflowDetailPage workflows={workflows} updateWorkflow={updateWorkflow} /></ProtectedLayout>} />
          <Route path="/history" element={<ProtectedLayout theme={theme} onToggleTheme={toggleTheme}><HistoryPage workflows={workflows} /></ProtectedLayout>} />
          <Route path="/tools" element={<ProtectedLayout theme={theme} onToggleTheme={toggleTheme}><ToolsPage /></ProtectedLayout>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
