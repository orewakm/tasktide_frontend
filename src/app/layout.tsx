import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Providers } from '@/components/Providers';
import './globals.css';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin', 'latin-ext'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin', 'latin-ext'],
});

export const metadata: Metadata = {
    title: 'TaskTide',
    description: 'Boards, cards and time tracking for teams',
};

// Sets up the HTML page, fonts and providers for every page.
// TR: Her sayfa için HTML sayfasını, fontları ve sağlayıcıları hazırlar.
export default function RootLayout({ children }: LayoutProps<'/'>) {
    return (
        <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
            <body className="flex min-h-full flex-col bg-canvas font-sans text-ink">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
