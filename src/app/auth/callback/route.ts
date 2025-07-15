import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // Handle error cases
  if (error) {
    console.error('Auth callback error:', error, errorDescription)
    return NextResponse.redirect(`${requestUrl.origin}/?error=${error}&message=${errorDescription || 'Authentication failed'}`)
  }

  // Handle successful confirmation
  if (code) {
    // Redirect to main page with success parameter
    // The client-side AuthContext will handle the session exchange
    return NextResponse.redirect(`${requestUrl.origin}/?confirmed=true`)
  }

  // Fallback redirect
  return NextResponse.redirect(`${requestUrl.origin}/`)
}