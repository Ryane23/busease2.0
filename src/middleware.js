import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const { token } = req.nextauth;

    // Redirect authenticated users from login/register to dashboard
    if (token && (pathname === '/login' || pathname === '/register' || pathname === '/')) {
      return NextResponse.redirect(new URL('/dashboard/passenger', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export function middleware(request) {
  // For the home page route
  if (request.nextUrl.pathname === '/') {
    return NextResponse.next();
  }

  // For dashboard routes that require authentication
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // Add your authentication logic here if needed
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/register',
    '/',
    '/((?!api|_next/static|_next/image|.*\\..*|favicon.ico).*)'
  ]
};
