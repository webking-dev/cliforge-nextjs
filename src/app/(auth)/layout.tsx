import { cn } from '@/lib/utils';
import { Analytics } from '@vercel/analytics/react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import Providers from '../providers';

const fontSans = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
    title: 'Lead Gen',
    description: 'Generated leads for your business',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <link
                    href="https://api.mapbox.com/mapbox-gl-js/v2.8.1/mapbox-gl.css"
                    rel="stylesheet"
                />
            </head>
            <body
                className={cn(
                    'min-h-screen bg-background font-sans antialiased',
                    fontSans.variable
                )}
            >
                <Providers>{children}</Providers>
                <Analytics />
            </body>
        </html>
    );
}
