import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Routes that require AAL2 (MFA verified) if user has MFA enrolled.
 * 
 * SECURITY RATIONALE:
 * These routes contain sensitive data (health metrics, financial data).
 * If a user has enabled MFA, we require them to verify their second factor
 * before accessing these routes. This protects against session hijacking.
 */
const SENSITIVE_ROUTES = [
    '/finance',
    '/health',
    '/settings/security',
]

/**
 * Updates the user session by refreshing the JWT token if expired.
 * Also enforces AAL2 on sensitive routes for users with MFA enabled.
 * 
 * IMPORTANT: Always calls getUser() to validate the JWT server-side.
 * Never trust cookies alone - they could be tampered with.
 */
export async function updateSession(request: NextRequest) {
    // Create an unmodified response
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // CRITICAL: Do NOT use getSession() here!
    // getSession() reads from cookies which could be tampered with.
    // getUser() makes an API call to Supabase to validate the JWT.
    // This also automatically refreshes the token if it's expired.
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Define public routes that don't require authentication
    const publicRoutes = [
        '/',
        '/login',
        '/landing',
        '/auth/callback',
        '/auth/mfa-verify', // MFA verification page must be accessible
        '/onboarding',
        '/forgot-password', // Password reset request
        '/update-password', // Password update (requires session from email link)
    ]

    const pathname = request.nextUrl.pathname

    // Check if current path is a public route
    const isPublicRoute = publicRoutes.some(route => {
        if (route === '/') {
            return pathname === '/'
        }
        return pathname.startsWith(route)
    })

    // If user is not authenticated and trying to access a protected route
    if (!user && !isPublicRoute) {
        // Redirect to login page
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // Check AAL2 requirement for sensitive routes
    if (user) {
        const isSensitiveRoute = SENSITIVE_ROUTES.some(route => pathname.startsWith(route))

        if (isSensitiveRoute) {
            // Check if user has MFA enrolled
            const { data: factorsData } = await supabase.auth.mfa.listFactors()

            if (factorsData) {
                const verifiedFactors = factorsData.totp.filter(f => f.status === 'verified')

                // If user has MFA enrolled, verify they have AAL2
                if (verifiedFactors.length > 0) {
                    const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()

                    // If current session is AAL1 but user has MFA, require verification
                    if (aalData && aalData.currentLevel === 'aal1' && aalData.nextLevel === 'aal2') {
                        const url = request.nextUrl.clone()
                        url.pathname = '/auth/mfa-verify'
                        // Preserve the original destination
                        url.searchParams.set('next', pathname)
                        return NextResponse.redirect(url)
                    }
                }
            }
        }
    }

    // IMPORTANT: Return the supabaseResponse, not just NextResponse.next()
    // The response contains the refreshed session cookies
    return supabaseResponse
}

