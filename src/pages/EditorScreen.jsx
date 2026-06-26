import { useState, useEffect, useRef } from 'react'
import { useWorkspace } from '../context/WorkspaceContext'
import { useTheme } from '../context/ThemeContext'
import Navbar from '../components/Navbar/Navbar'
import Sidebar from '../components/Sidebar/Sidebar'
import Editor from '../components/Editor/Editor'
import StatusBar from '../components/StatusBar/StatusBar'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Terminal from '../components/Terminal/Terminal'
import '../components/Terminal/Terminal.css'



export default function EditorScreen() {
    const [terminalOpen, setTerminalOpen] = useState(false)
    const { currentWorkspace, currentFile } = useWorkspace()
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [wordCount, setWordCount]     = useState(0)
    const [charCount, setCharCount]     = useState(0)

    useEffect(() => {
        const handler = (e) => {
            if (e.ctrlKey && e.key.toLowerCase() === 'b') {
                e.preventDefault()
                setSidebarOpen(prev => !prev)
            } else if (e.ctrlKey && e.key ==='`') {
                e.preventDefault()
                setTerminalOpen(prev => !prev)
            }
        }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [])

    return (
        <div className="app-shell">
            <Navbar
                sidebarOpen={sidebarOpen}
                onToggleSidebar={() => setSidebarOpen(prev => !prev)}
            />
            <div className="app-body">
                <Sidebar isOpen={sidebarOpen} />
                <button
                    className={`toggle-sidebar ${!sidebarOpen ? 'collapsed' : ''}`}
                    style={{ left: sidebarOpen ? 'var(--sidebar-width)' : '0' }}
                    onClick={() => setSidebarOpen(prev => !prev)}
                    aria-label="Toggle sidebar"
                >
                    {sidebarOpen ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}
                </button>
                <main className={`main-content ${!sidebarOpen ? 'expanded' : ''}`}>
                    <Editor
                        onWordsChange={setWordCount}
                        onCharsChange={setCharCount}
                    />
                    {terminalOpen && <Terminal isOpen={terminalOpen}/>}
                </main>
            </div>
            <StatusBar wordCount={wordCount} 
            charCount={charCount} 
            onToggleTerminal={() => setTerminalOpen(prev => !prev)}
            />
        </div>
    )
}