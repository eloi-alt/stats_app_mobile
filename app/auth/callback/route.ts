import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (code) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim()
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim()
        const supabase = createClient(supabaseUrl, supabaseAnonKey)

        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
            console.error('Auth callback error:', error)
            return NextResponse.redirect(
                new URL(`/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
            )
        }
    }

    // Redirect to dashboard after successful verification
    return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
}
