import { useEffect, useRef, useState } from 'react'
import { useWorkspace } from '../../context/WorkspaceContext'
import { readNote, writeNote } from '../../lib/tauri'
import { FileText } from 'lucide-react'

export default function Editor({ onWordsChange, onCharsChange }) {
    const { currentFile } = useWorkspace()
    const editorRef  = useRef(null)
    const saveTimer  = useRef(null)
    const [lines, setLines] = useState(['1'])
    const [tabName, setTabName] = useState('Untitled')

    useEffect(() => {
        if (!currentFile) return
        readNote(currentFile).then(content => {
            if (editorRef.current) {
                editorRef.current.innerText = content
                updateMeta()
            }
        }).catch(console.error)
        setTabName(currentFile.split(/[\\/]/).pop())
    }, [currentFile])

    function updateMeta() {
        const text  = editorRef.current?.innerText || ''
        const lines = text === '' ? 1 : text.split('\n').length
        setLines(Array.from({ length: lines }, (_, i) => i + 1))

        const trimmed = text.trim()
        const words   = trimmed === '' ? 0 : trimmed.split(/\s+/).filter(Boolean).length
        const chars   = text.replace(/\n$/, '').length
        onWordsChange?.(words)
        onCharsChange?.(chars)
    }

    function handleInput() {
        updateMeta()
        clearTimeout(saveTimer.current)
        saveTimer.current = setTimeout(() => {
            if (currentFile && editorRef.current) {
                writeNote(currentFile, editorRef.current.innerText).catch(console.error)
            }
        }, 800)
    }

    return (
        <div className="editor-container">
            <div className="editor-header">
                <span className="editor-tab active">
                    <FileText size={13} />
                    <span>{tabName}</span>
                </span>
            </div>
            <div className="editor-wrap">
                <div className="line-numbers">
                    {lines.map(n => <div key={n} style={{lineHeight:'1.8'}}>{n}</div>)}
                </div>
                <div
                    ref={editorRef}
                    id="editor"
                    contentEditable
                    suppressContentEditableWarning
                    spellCheck
                    onInput={handleInput}
                    data-placeholder="Start writing…"
                />
            </div>
        </div>
    )
}