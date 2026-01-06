"use client"

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
    const { user, loading, signOut } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        }
    }, [user, loading, router])

    const handleSignOut = async () => {
        await signOut()
        router.push('/login')
    }

    if (loading) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <svg className="animate-spin h-12 w-12 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center p-4">
            <div className="w-full max-w-lg space-y-8 rounded-2xl bg-white/10 p-8 shadow-xl backdrop-blur-lg ring-1 ring-white/20">
                {/* Success Badge */}
                <div className="flex justify-center">
                    <div className="flex items-center gap-2 rounded-full bg-green-500/20 px-4 py-2 text-green-500 ring-1 ring-green-500/30">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm font-medium">Email Verified</span>
                    </div>
                </div>

                {/* Welcome Message */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Welcome! 🎉
                    </h1>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                        Your account has been verified successfully.
                    </p>
                </div>

                {/* User Info Card */}
                <div className="rounded-xl bg-white/5 p-6 ring-1 ring-gray-200 dark:ring-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xl font-bold text-white">
                            {user.email?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Logged in as</p>
                            <p className="font-medium text-gray-900 dark:text-white">{user.email}</p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => router.push('/')}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-500"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Go to Home
                    </button>
                    <button
                        onClick={handleSignOut}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 px-4 py-3 text-sm font-semibold text-gray-900 ring-1 ring-gray-300 transition-all hover:bg-white/10 dark:text-white dark:ring-gray-700"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    )
}
