import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { NextAuthOptions } from 'next-auth';
import { Adapter } from 'next-auth/adapters';
import EmailProvider from 'next-auth/providers/email';
import { account } from '../db/schema/account';
import { user } from '../db/schema/user';
import { verificationToken } from '../db/schema/verificationToken';
import db from '../postgres/client';

const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    adapter: DrizzleAdapter(db, {
        usersTable: user,
        accountsTable: account,
        verificationTokensTable: verificationToken,
    }) as Adapter,
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        async signIn({ user, account, profile, email, credentials }) {
            console.log('signIn', user, account, profile, email, credentials);
            // const whitelistUser = await clientPromise.then(async (client) => {
            // 	return await client
            // 		.db("test")
            // 		.collection("whitelist")
            // 		.findOne({ email: user.email });
            // });
            // if (whitelistUser?.email === user.email) {
            // 	return true;
            // }
            return true;
        },
        session({ session, token }) {
            if (!token.sub) {
                console.error('Invalid token', token);
                throw new Error('Invalid token');
            }

            if (!session.user)
                session.user = {
                    id: token.sub!,
                    name: token.name,
                    email: token.email,
                    image: token.picture,
                };
            else session.user.id = token.sub!;

            return session;
        },
    },
    pages: {
        signIn: '/auth',
    },
    providers: [
        EmailProvider({
            server: {
                host: process.env.EMAIL_SERVER_HOST!,
                port: process.env.EMAIL_SERVER_PORT!,
                auth: {
                    user: process.env.EMAIL_SERVER_USER!,
                    pass: process.env.EMAIL_SERVER_PASSWORD!,
                },
            },
            from: process.env.EMAIL_FROM!,
        }),
    ],
};

// TODO: Identify and fix  client side code is calling auth options directly.
export default function getAuthOptions(): NextAuthOptions {
    if (typeof window === 'undefined') {
        return authOptions;
    }
    // Return a minimal version for client-side
    return {
        providers: [],
    };
}
