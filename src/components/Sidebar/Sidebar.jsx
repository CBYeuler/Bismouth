import { useState, useEffect } from 'react'
import { useWorkspace } from '../../context/WorkspaceContext'
import { readDirTree, createNote, createFolder } from '../../lib/tauri'
import TreeItem from './TreeItem'
import { FilePlus, FolderPlus } from 'lucide-react'

export default function Sidebar({ isOpen }) {
    const { currentWorkspace } = useWorkspace()
    const [tree, setTree] = useState([])

    useEffect(() => {
        if (currentWorkspace) loadTree()
    }, [currentWorkspace])

    async function loadTree() {
        try {
            const nodes = await readDirTree(currentWorkspace)
            setTree(nodes)
        } catch (err) {
            console.error('Failed to load tree:', err)
        }
    }

    async function handleNewNote() {
        if (!currentWorkspace) return
        // Generate unique name by appending timestamp if needed
        const base = currentWorkspace + '/untitled'
        const path = base + '-' + Date.now() + '.md'
        try {
            await createNote(path)
            await loadTree()
        } catch (err) {
            console.error(err)
        }
    }

    async function handleNewFolder() {
        if (!currentWorkspace) return
        const path = currentWorkspace + '/new-folder-' + Date.now()
        try {
            await createFolder(path)
            await loadTree()
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <aside className={`sidebar ${!isOpen ? 'collapsed' : ''}`}>
            <div className="sidebar-section-label">
                <span>Explorer</span>
                <div className="sidebar-actions">
                    <button className="sidebar-icon-btn" onClick={handleNewNote} title="New Note">
                        <FilePlus size={14} />
                    </button>
                    <button className="sidebar-icon-btn" onClick={handleNewFolder} title="New Folder">
                        <FolderPlus size={14} />
                    </button>
                </div>
            </div>
            <div className="file-tree">
                {tree.map(node => (
                    <TreeItem key={node.path} node={node} depth={0} onRefresh={loadTree} />
                ))}
            </div>
        </aside>
    )
}