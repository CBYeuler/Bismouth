//import { create } from 'framer-motion/m'
import {createContext, useContext, useState} from 'react'

const ThemeContext = createContext()

export function ThemeProvider({children}) {
    const [theme, setTheme] = useState('dark')

    function toggleTheme(){
        setTheme(prev => {
            const next = prev === 'dark' ? 'light' : 'dark'
            document.documentElement.classList.toggle('light', next === 'light')
            return next
        })
    }

    return (
        <ThemeContext.Provider value = {{theme, toggleTheme}}>  
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => useContext(ThemeContext)

