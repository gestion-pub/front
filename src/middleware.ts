import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const middleware = createMiddleware(routing);

export default function (req: any) {
    console.log('Middleware executing for:', req.nextUrl.pathname);
    return middleware(req);
}

export const config = {
    // Match all pathnames except for
    // - API routes
    // - Static files (_next, images, favicon.ico, etc.)
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
