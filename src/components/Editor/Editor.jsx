import { useEffect, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import { useWorkspace } from '../../context/WorkspaceContext'
import { readNote, writeNote } from '../../lib/tauri'
import {
    Bold, Italic, Strikethrough, Code, Heading1, Heading2, Heading3,
    List, ListOrdered, Quote, Minus, FileText, SquareCode
} from 'lucide-react'

const lowlight = createLowlight(common)

// toolbar
function ToolbarBtn({ onClick, active, title, children }) {
    return (
        <button
            className={`toolbar-btn ${active ? 'active' : ''}`}
            onClick={onClick}
            title={title}
            type="button"
        >
            {children}
        </button>
    )
}

function ToolbarDivider() {
    return <div className="toolbar-divider" />
}

// main editor
export default function Editor({ onWordsChange, onCharsChange }) {
    const { currentFile } = useWorkspace()

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                codeBlock: false, // replaced by CodeBlockLowlight
            }),
            Placeholder.configure({
                placeholder: 'Start writing…',
            }),
            CodeBlockLowlight.configure({
                lowlight,
            }),
        ],
        content: '',
        onUpdate({ editor }) {
            updateMeta(editor)
            scheduleSave(editor)
        },
    })

    // save timer
    let saveTimer = null
    function scheduleSave(editor) {
        clearTimeout(saveTimer)
        saveTimer = setTimeout(() => {
            if (!currentFile) return
            const markdown = editorToMarkdown(editor)
            writeNote(currentFile, markdown).catch(console.error)
        }, 800)
    }

    //
    useEffect(() => {
        if (!currentFile || !editor) return
        readNote(currentFile).then(content => {
            editor.commands.setContent(markdownToTiptap(content))
            updateMeta(editor)
        }).catch(console.error)
    }, [currentFile, editor])

    //
    function updateMeta(editor) {
        const text    = editor.getText()
        const trimmed = text.trim()
        const words   = trimmed === '' ? 0 : trimmed.split(/\s+/).filter(Boolean).length
        const chars   = text.length
        onWordsChange?.(words)
        onCharsChange?.(chars)
    }

    const tabName = currentFile ? currentFile.split(/[\\/]/).pop() : 'Untitled'

    if (!editor) return null

    return (
        <div className="editor-container">

            {/* Tab bar */}
            <div className="editor-header">
                <span className="editor-tab active">
                    <FileText size={13} />
                    <span>{tabName}</span>
                </span>
            </div>

            {/* Toolbar */}
            <div className="editor-toolbar">
                <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    active={editor.isActive('bold')}
                    title="Bold (Ctrl+B)"
                >
                    <Bold size={14} />
                </ToolbarBtn>

                <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    active={editor.isActive('italic')}
                    title="Italic (Ctrl+I)"
                >
                    <Italic size={14} />
                </ToolbarBtn>

                <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    active={editor.isActive('strike')}
                    title="Strikethrough"
                >
                    <Strikethrough size={14} />
                </ToolbarBtn>

                <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    active={editor.isActive('code')}
                    title="Inline code"
                >
                    <Code size={14} />
                </ToolbarBtn>

                <ToolbarDivider />

                <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    active={editor.isActive('heading', { level: 1 })}
                    title="Heading 1"
                >
                    <Heading1 size={14} />
                </ToolbarBtn>

                <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    active={editor.isActive('heading', { level: 2 })}
                    title="Heading 2"
                >
                    <Heading2 size={14} />
                </ToolbarBtn>

                <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    active={editor.isActive('heading', { level: 3 })}
                    title="Heading 3"
                >
                    <Heading3 size={14} />
                </ToolbarBtn>

                <ToolbarDivider />

                <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    active={editor.isActive('bulletList')}
                    title="Bullet list"
                >
                    <List size={14} />
                </ToolbarBtn>

                <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    active={editor.isActive('orderedList')}
                    title="Ordered list"
                >
                    <ListOrdered size={14} />
                </ToolbarBtn>

                <ToolbarDivider />

                <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    active={editor.isActive('blockquote')}
                    title="Blockquote"
                >
                    <Quote size={14} />
                </ToolbarBtn>

                <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    active={editor.isActive('codeBlock')}
                    title="Code block"
                >
                    <SquareCode size={14} />
                </ToolbarBtn>

                <ToolbarBtn
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    title="Horizontal rule"
                >
                    <Minus size={14} />
                </ToolbarBtn>
            </div>

            {/* Editor content */}
            <div className="editor-wrap">
                <EditorContent editor={editor} className="tiptap-editor" />
            </div>

        </div>
    )
}

// md helpers
// Simple markdown to Tiptap HTML for loading files
function markdownToTiptap(md) {
    if (!md || md.trim() === '') return ''

    let html = md
        // Headings
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm,  '<h2>$1</h2>')
        .replace(/^# (.+)$/gm,   '<h1>$1</h1>')
        // Bold, italic, strikethrough, inline code
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g,     '<em>$1</em>')
        .replace(/~~(.+?)~~/g,     '<s>$1</s>')
        .replace(/`(.+?)`/g,       '<code>$1</code>')
        // Blockquote
        .replace(/^> (.+)$/gm, '<blockquote><p>$1</p></blockquote>')
        // Horizontal rule
        .replace(/^---$/gm, '<hr>')
        // Code blocks
        .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
        // Unordered list
        .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
        // Ordered list
        .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
        // Paragraphs — wrap plain lines
        .replace(/^(?!<[a-z]).+$/gm, '<p>$&</p>')

    return html
}

// Tiptap text to plain markdown for saving
function editorToMarkdown(editor) {
    // Tiptap's getText() gives plain text
    // For now save as-is - full markdown serializer can be added later
    return editor.getText()
}