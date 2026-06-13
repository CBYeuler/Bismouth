import { useState } from 'react'
import { useWorkspace } from '../../context/WorkspaceContext'
import { readNote, deleteNote, renameNote } from '../../lib/tauri'
import { ChevronRight, FileText, Folder } from 'lucide-react'

export default function TreeItem({ node, depth, onRefresh }) {
    const { setCurrentFile, currentFile } = useWorkspace()
    const [open, setOpen] = useState(false)
    const [renaming, setRenaming] = useState(false)
    const [newName, setNewName] = useState(node.name)

    async function handleClick() {
        if (node.is_dir) {
            setOpen(prev => !prev)
            return
        }
        setCurrentFile(node.path)
    }

    async function handleRename() {
        const dir     = node.path.substring(0, node.path.lastIndexOf('/'))
        const newPath = dir + '/' + newName
        if (newName !== node.name) {
            try {
                await renameNote(node.path, newPath)
                onRefresh()
            } catch (err) {
                console.error(err)
            }
        }
        setRenaming(false)
    }

    async function handleDelete(e) {
        e.stopPropagation()
        if (!confirm(`Delete "${node.name}"?`)) return
        try {
            await deleteNote(node.path)
            onRefresh()
        } catch (err) {
            console.error(err)
        }
    }

    const isActive = currentFile === node.path
    const indent   = 8 + depth * 12

    return (
        <div>
            <div
                className={`tree-row ${isActive ? 'active' : ''}`}
                style={{ paddingLeft: indent }}
                onClick={handleClick}
                onContextMenu={(e) => { e.preventDefault(); setRenaming(true) }}
            >
                {node.is_dir
                    ? <><ChevronRight size={12} className={`tree-arrow ${open ? 'open' : ''}`} /><Folder size={14} className="tree-icon folder-icon" /></>
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
                            if (e.key === 'Escape') setRenaming(false)
                        }}
                        autoFocus
                        onClick={e => e.stopPropagation()}
                    />
                ) : (
                    <span className="tree-label">{node.name}</span>
                )}
            </div>

            {node.is_dir && open && node.children?.map(child => (
                <TreeItem key={child.path} node={child} depth={depth + 1} onRefresh={onRefresh} />
            ))}
        </div>
    )
}