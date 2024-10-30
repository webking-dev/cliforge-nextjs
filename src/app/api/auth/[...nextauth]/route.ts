import getAuthOptions from '@/lib/auth/options';
import NextAuth from 'next-auth';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

const handler = NextAuth(getAuthOptions());

export { handler as GET, handler as POST };
