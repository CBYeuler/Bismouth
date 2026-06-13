import { useState, useEffect, useRef } from 'react'
import { useWorkspace } from '../../context/WorkspaceContext'
import { deleteNote, renameNote, createNote, createFolder } from '../../lib/tauri'
import { ChevronRight, FileText, Folder, Trash2, Pencil, FilePlus } from 'lucide-react'

export default function TreeItem({ node, depth, onRefresh }) {
    const { setCurrentFile, currentFile } = useWorkspace()
    const [open, setOpen]         = useState(false)
    const [renaming, setRenaming] = useState(false)
    const [newName, setNewName]   = useState(node.name)
    const [ctxMenu, setCtxMenu]   = useState(null) // { x, y }
    const ctxRef = useRef(null)

    // Close context menu on outside click
    useEffect(() => {
        if (!ctxMenu) return
        function handleClick(e) {
            if (ctxRef.current && !ctxRef.current.contains(e.target)) {
                setCtxMenu(null)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [ctxMenu])

    // Sync newName if node.name changes (after refresh)
    useEffect(() => {
        setNewName(node.name)
    }, [node.name])

    function handleClick() {
        if (node.is_dir) {
            setOpen(prev => !prev)
            return
        }
        setCurrentFile(node.path)
    }

    function handleContextMenu(e) {
        e.preventDefault()
        e.stopPropagation()
        setCtxMenu({ x: e.clientX, y: e.clientY })
    }

    async function handleRename() {
        const trimmed = newName.trim()
        if (!trimmed || trimmed === node.name) {
            setRenaming(false)
            setNewName(node.name)
            return
        }
        const dir     = node.path.substring(0, node.path.lastIndexOf('/'))
        const newPath = dir + '/' + trimmed
        try {
            await renameNote(node.path, newPath)
            onRefresh()
        } catch (err) {
            console.error(err)
        }
        setRenaming(false)
    }

    async function handleDelete() {
        setCtxMenu(null)
        if (!confirm(`Delete "${node.name}"? This cannot be undone.`)) return
        try {
            await deleteNote(node.path)
            onRefresh()
        } catch (err) {
            console.error(err)
        }
    }

    async function handleNewNoteHere() {
        setCtxMenu(null)
        const dir  = node.is_dir ? node.path : node.path.substring(0, node.path.lastIndexOf('/'))
        const path = dir + '/untitled-' + Date.now() + '.md'
        try {
            await createNote(path)
            onRefresh()
        } catch (err) {
            console.error(err)
        }
    }

    const isActive = currentFile === node.path
    const indent   = 8 + depth * 12

    return (
        <div style={{ position: 'relative' }}>
            <div
                className={`tree-row ${isActive ? 'active' : ''}`}
                style={{ paddingLeft: indent }}
                onClick={handleClick}
                onContextMenu={handleContextMenu}
            >
                {node.is_dir
                    ? <><ChevronRight size={12} className={`tree-arrow ${open ? 'open' : ''}`} />
                        <Folder size={14} className="tree-icon folder-icon" /></>
                    : <FileText size={14} className="tree-icon" style={{ marginLeft: 16 }} />
                }

                {renaming ? (
                    <input
                        className="tree-rename-input"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        onBlur={handleRename}
                        onKeyDown={e => {
                            if (e.key === 'Enter')  handleRename()
                            if (e.key === 'Escape') { setRenaming(false); setNewName(node.name) }
                        }}
                        autoFocus
                        onClick={e => e.stopPropagation()}
                    />
                ) : (
                    <span className="tree-label">{node.name}</span>
                )}
            </div>

            {/* Children */}
            {node.is_dir && open && node.children?.map(child => (
                <TreeItem key={child.path} node={child} depth={depth + 1} onRefresh={onRefresh} />
            ))}

            {/* Context menu */}
            {ctxMenu && (
                <div
                    ref={ctxRef}
                    className="ctx-menu"
                    style={{ top: ctxMenu.y, left: ctxMenu.x }}
                >
                    <button onClick={() => { setCtxMenu(null); setRenaming(true) }}>
                        <Pencil size={13} /> <span>Rename</span>
                    </button>
                    <button className="ctx-delete" onClick={handleDelete}>
                        <Trash2 size={13} /> <span>Delete</span>
                    </button>
                    <div className="ctx-divider" />
                    <button onClick={handleNewNoteHere}>
                        <FilePlus size={13} /> <span>New Note Here</span>
                    </button>
                </div>
            )}
        </div>
    )
}