import { useEffect, useRef, useState, useCallback } from 'react'

export function useTerminal(workspacePath) {
    const [sessionId, setSessionId]   = useState(null)
    const [ready, setReady]           = useState(false)
    const unlistenRef                 = useRef(null)

    const invoke = (...args) => window.__TAURI__.core.invoke(...args)
    const listen = (...args) => window.__TAURI__.event.listen(...args)

    async function start(xtermInstance) {
        if (sessionId) return

        try {
            const id = await invoke('create_terminal', { workspacePath })
            setSessionId(id)

            // Listen for streamed output
            unlistenRef.current = await listen(
                `terminal-output-${id}`,
                (event) => {
                    xtermInstance.write(event.payload)
                }
            )

            setReady(true)
        } catch (err) {
            console.error('Failed to start terminal:', err)
        }
    }

    async function sendInput(input) {
        if (!sessionId) return
        await invoke('send_input', { id: sessionId, input })
    }

    async function resize(rows, cols) {
        if (!sessionId) return
        await invoke('resize_terminal', { id: sessionId, rows, cols })
    }

    async function close() {
        if (!sessionId) return
        if (unlistenRef.current) unlistenRef.current()
        await invoke('close_terminal', { id: sessionId })
        setSessionId(null)
        setReady(false)
    }

    // Cleanup on unmount
    useEffect(() => {
        return () => { close() }
    }, [sessionId])

    return { start, sendInput, resize, close, ready }
}