"use client"

import { createContext, useContext, useState, ReactNode } from 'react'

type VisitorContextType = {
    isVisitor: boolean
    setIsVisitor: (value: boolean) => void
}

const VisitorContext = createContext<VisitorContextType>({
    isVisitor: false,
    setIsVisitor: () => { },
})

export const useVisitor = () => useContext(VisitorContext)

export const VisitorProvider = ({ children }: { children: ReactNode }) => {
    const [isVisitor, setIsVisitor] = useState(false)

    return (
        <VisitorContext.Provider value={{ isVisitor, setIsVisitor }}>
            {children}
        </VisitorContext.Provider>
    )
}
