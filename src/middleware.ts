/**
 * Middleware function that adds authentication to the request.
 */
import { withAuth } from "next-auth/middleware";

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		"/((?!api|_next/static|_next/image|favicon.ico).*)",
	],
};

export default withAuth(function middleware() {}, {
	callbacks: {
		authorized: ({ req, token }) => {
			if (
				req.nextUrl.pathname.startsWith("/auth") ||
				req.nextUrl.pathname.startsWith("/test")
			) {
				return true;
			}

			if (token) {
				return true;
			}

			return false;
		},
	},
});
