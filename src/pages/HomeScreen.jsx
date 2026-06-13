import { useState, useEffect } from 'react'
import { useWorkspace } from '../context/WorkspaceContext'
import { listWorkspaces, createWorkspace, deleteWorkspace } from '../lib/tauri'
import { Hexagon, Plus, FolderOpen, Folder, Trash2 } from 'lucide-react'

function formatDate(unixSecs) {
    const diff = Math.floor(Date.now() / 1000) - unixSecs
    if (diff < 60)    return 'Less than a minute ago'
    if (diff < 3600)  return `${Math.floor(diff / 60)} minutes ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
    return `${Math.floor(diff / 86400)} days ago`
}

export default function HomeScreen() {
    const { setCurrentWorkspace } = useWorkspace()
    const [workspaces, setWorkspaces]   = useState([])
    const [modalOpen, setModalOpen]     = useState(false)
    const [wsName, setWsName]           = useState('')

    useEffect(() => {
        loadWorkspaces()
    }, [])

    async function loadWorkspaces() {
        try {
            const list = await listWorkspaces()
            setWorkspaces(list)
        } catch (err) {
            console.error('Failed to load workspaces:', err)
        }
    }

    async function handleCreate() {
        const raw  = wsName.trim()
        if (!raw) return
        const name = raw.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-_]/g, '')
        if (!name) return
        try {
            const path = await createWorkspace(name)
            setModalOpen(false)
            setCurrentWorkspace(path)
        } catch (err) {
            console.error('Create failed:', err)
        }
    }

    async function handleDelete(e, path) {
        e.stopPropagation()
        const name = path.split('/').pop()
        if (!confirm(`Delete workspace "${name}"? This cannot be undone.`)) return
        try {
            await deleteWorkspace(path)
            await loadWorkspaces()
        } catch (err) {
            console.error('Delete failed:', err)
        }
    }

    async function handleOpen() {
        const selected = await window.__TAURI__.dialog.open({ directory: true, multiple: false, title: 'Open Workspace' })
        if (selected) setCurrentWorkspace(selected)
    }

    return (
        <main className="welcome-screen">
            <div className="hero">
                <div className="hero-logo">
                    <Hexagon size={80} strokeWidth={1.4} />
                </div>
                <h1>Bismuth</h1>
                <h2>Workspace</h2>
                <p>Your local markdown workspace for developers</p>

                <div className="actions">
                    <button className="primary-btn" onClick={() => { setWsName(''); setModalOpen(true) }}>
                        <Plus size={18} /> Create New Workspace
                    </button>
                    <button className="secondary-btn" onClick={handleOpen}>
                        <FolderOpen size={18} /> Open Workspace
                    </button>
                </div>
            </div>

            <section className="ws">
                <div className="ws-header">
                    <Folder size={15} />
                    <span>YOUR WORKSPACES</span>
                </div>

                {workspaces.length === 0 ? (
                    <p className="ws-empty">No workspaces yet.</p>
                ) : (
                    workspaces.map(ws => (
                        <div key={ws.path} className="ws-list-item" onClick={() => setCurrentWorkspace(ws.path)}>
                            <div className="ws-left">
                                <Folder size={20} className="folder" />
                                <div className="ws-info">
                                    <span className="ws-name">{ws.name}</span>
                                    <span className="ws-date">{formatDate(ws.modified)}</span>
                                </div>
                            </div>
                            <button className="delete-btn" onClick={(e) => handleDelete(e, ws.path)}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))
                )}
            </section>

            {modalOpen && (
                <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false) }}>
                    <div className="modal">
                        <h3>New Workspace</h3>
                        <p>Will be created in ~/Documents/Bismuth/</p>
                        <input
                            type="text"
                            value={wsName}
                            onChange={e => setWsName(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter')  handleCreate()
                                if (e.key === 'Escape') setModalOpen(false)
                            }}
                            placeholder="my-workspace"
                            autoFocus
                            autoComplete="off"
                        />
                        <div className="modal-actions">
                            <button className="secondary-btn" onClick={() => setModalOpen(false)}>Cancel</button>
                            <button className="primary-btn" onClick={handleCreate}>
                                <Plus size={16} /> Create
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}