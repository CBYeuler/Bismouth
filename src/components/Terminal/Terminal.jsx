import { useEffect, useRef } from 'react'
import { Terminal as XTerm } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { useTerminal } from './useTerminal'
import { useWorkspace } from '../../context/WorkspaceContext'
import '@xterm/xterm/css/xterm.css'

export default function Terminal({ isOpen }) {
    const { currentWorkspace } = useWorkspace()
    const containerRef = useRef(null)
    const xtermRef     = useRef(null)
    const fitAddonRef  = useRef(null)
    const { start, sendInput, resize, ready } = useTerminal(currentWorkspace)

    useEffect(() => {
        if (!isOpen || !containerRef.current || xtermRef.current) return

        // Init xterm
        const term = new XTerm({
            theme: {
                background:  '#121417',
                foreground:  '#E6E8EB',
                cursor:      '#4F8CFF',
                black:       '#1A1D21',
                brightBlack: '#555C67',
            },
            fontFamily:  '"JetBrains Mono", monospace',
            fontSize:    13,
            lineHeight:  1.5,
            cursorBlink: true,
            scrollback:  1000,
        })

        const fitAddon = new FitAddon()
        term.loadAddon(fitAddon)
        term.open(containerRef.current)
        fitAddon.fit()

        xtermRef.current    = term
        fitAddonRef.current = fitAddon

        // Start PTY
        start(term)

        // Forward key input to PTY
        term.onData((data) => sendInput(data))

        // Resize observer
        const observer = new ResizeObserver(() => {
            fitAddon.fit()
            const { rows, cols } = term
            resize(rows, cols)
        })
        observer.observe(containerRef.current)

        return () => {
            observer.disconnect()
            term.dispose()
            xtermRef.current = null
        }
    }, [isOpen])

    return (
        <div className="terminal-panel">
            <div className="terminal-header">
                <span>Terminal</span>
                <span className="terminal-cwd">{currentWorkspace}</span>
            </div>
            <div ref={containerRef} className="terminal-body" />
        </div>
    )
}