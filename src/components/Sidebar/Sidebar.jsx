import { useState, useEffect } from 'react'
import { useWorkspace } from '../../context/WorkspaceContext'
import { readDirTree } from '../../lib/tauri'
import TreeItem from './TreeItem'
import { FilePlus, FolderPlus } from 'lucide-react'
import { createNote, createFolder } from '../../lib/tauri'

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
        try {
            await createNote(currentWorkspace + '/untitled.md')
            await loadTree()
        } catch (err) {
            console.error(err)
        }
    }

    async function handleNewFolder() {
        if (!currentWorkspace) return
        try {
            await createFolder(currentWorkspace + '/new-folder')
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