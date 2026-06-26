export default function StatusBar({ wordCount, charCount, onToggleTerminal }) {
    return (
        <div className="statusbar">
            <span>{wordCount} {wordCount !== 1 ? 'words' : 'word'}</span>
            <span>{charCount} {charCount !== 1 ? 'chars' : 'char'}</span>
            <span 
                className="statusbar-terminal-btn"
                onClick={onToggleTerminal}
                title="Toggle Terminal (Ctrl+`)"
            >
                Terminal
            </span>
            <span className="statusbar-right">Bismuth v1.0.0</span>
        </div>
    )
}