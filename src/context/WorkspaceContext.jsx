import { createContext, useContext, useState } from "react";

const WorkspaceContext = createContext()
export function WorkspaceProvider({children}) {
    const [currentWorkspace, setCurrentWorkspace] = useState(
        localStorage.getItem('bismouth-workspace') || null
    )
    const [currentFile, setCurrentFile] = useState(null)

    function openWorkSpace(path) {
        localStorage.setItem('bismouth-workspace', path)
        setCurrentWorkspace(path)
    }

    function clearWorkspace(){
        localStorage.removeItem('bismouth-workspace')
        setCurrentWorkspace(null)
    }

    return (
        <WorkspaceContext.Provider value={{
            currentWorkspace, setCurrentWorkspace: openWorkSpace,
            currentFile, setCurrentFile,
            clearWorkspace,
        }}>
            {children}
        </WorkspaceContext.Provider>
    )
}

export const useWorkspace = () => useContext(WorkspaceContext)