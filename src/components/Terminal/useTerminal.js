import { useEffect, useRef, useState } from 'react'

export function useTerminal(workspacePath) {
    const sessionIdRef  = useRef(null)   // ← ref instead of state
    const [ready, setReady] = useState(false)
    const unlistenRef   = useRef(null)

    const invoke = (...args) => window.__TAURI__.core.invoke(...args)
    const listen = (...args) => window.__TAURI__.event.listen(...args)

    async function start(xtermInstance) {
        if (sessionIdRef.current) return
        try {
            const id = await invoke('create_terminal', { workspacePath })
            sessionIdRef.current = id   // ← set ref directly

            unlistenRef.current = await listen(
                `terminal-output-${id}`,
                (event) => { xtermInstance.write(event.payload) }
            )
            setReady(true)
        } catch (err) {
            console.error('Failed to start terminal:', err)
        }
    }

    async function sendInput(input) {
        if (!sessionIdRef.current) return   // ← read from ref
        await invoke('send_input', { id: sessionIdRef.current, input })
    }

    async function resize(rows, cols) {
        if (!sessionIdRef.current) return
        await invoke('resize_terminal', { id: sessionIdRef.current, rows, cols })
    }

    async function close() {
        if (!sessionIdRef.current) return
        if (unlistenRef.current) unlistenRef.current()
        await invoke('close_terminal', { id: sessionIdRef.current })
        sessionIdRef.current = null
        setReady(false)
    }

    useEffect(() => {
        return () => { close() }
    }, [])

    return { start, sendInput, resize, close, ready }
}