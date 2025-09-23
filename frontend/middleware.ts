import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Rutas que requieren autenticación
  const protectedPaths = ['/dashboard', '/legajos', '/plantillas', '/flujos']
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  if (isProtectedPath) {
    // Verificar si hay tokens en las cookies o headers
    const accessToken = request.cookies.get('access_token')?.value
    
    if (!accessToken) {
      // Redirigir al login si no hay token
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/legajos/:path*', '/plantillas/:path*', '/flujos/:path*']
}