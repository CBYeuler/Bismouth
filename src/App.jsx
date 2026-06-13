import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext'
import { ThemeProvider } from './context/ThemeContext'
import HomeScreen from './pages/HomeScreen'
import EditorScreen from './pages/EditorScreen'
import './index.css'

function AppRoutes() {
    const { currentWorkspace } = useWorkspace()
    return currentWorkspace ? <EditorScreen /> : <HomeScreen />
}

function App() {
    return (
        <ThemeProvider>
            <WorkspaceProvider>
                <AppRoutes />
            </WorkspaceProvider>
        </ThemeProvider>
    )
}

export default App