import { createContext, useContext, useState, ReactNode } from 'react'

type VisitorContextType = {
    isVisitorMode: boolean
    setVisitorMode: (value: boolean) => void
}

const VisitorContext = createContext<VisitorContextType>({
    isVisitorMode: false,
    setVisitorMode: () => { },
})

export const useVisitor = () => useContext(VisitorContext)

export const VisitorProvider = ({ children }: { children: ReactNode }) => {
    const [isVisitorMode, setVisitorMode] = useState(false)

    return (
        <VisitorContext.Provider value={{ isVisitorMode, setVisitorMode }}>
            {children}
        </VisitorContext.Provider>
    )
}
