import { useWorkspace } from '../../context/WorkspaceContext'
import { useTheme } from '../../context/ThemeContext'
import { Hexagon, Sun, Moon, Home, FolderOpen } from 'lucide-react'

export default function Navbar() {
    const { currentWorkspace, setCurrentWorkspace, clearWorkspace } = useWorkspace()
    const { theme, toggleTheme } = useTheme()

    async function handleFilepathClick() {
        const { open } = window.__TAURI__.dialog
        const selected = await open({ directory: true, multiple: false, title: 'Open Workspace' })
        if (selected) setCurrentWorkspace(selected)
    }

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <span className="app-logo">
                    <Hexagon size={18} className="logo-icon"  onClick={clearWorkspace} style={{cursor:'pointer'}}/>
                    <span className="app-name">Bismuth</span>
                </span>
                <div className="filepath-wrap" onClick={handleFilepathClick} style={{ cursor: 'pointer' }}>
                    <FolderOpen size={13} className="filepath-icon" />
                <span className="filepath-text">
                    {currentWorkspace || 'No workspace open'}
                </span>
            </div>
            </div>
            <div className="navbar-right">
                <div className="divider-v" />
                <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
                    {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                </button>
            </div>
        </nav>
    )
}