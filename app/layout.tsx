import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Nav } from '@/components/Nav';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Great Canadian Affordability Dashboard',
  description:
    'Canadian city-level housing data: affordability, rental yield, bubble risk, and market structure signals.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0d0d10] text-[#ececf0] min-h-screen`}
      >
        <Nav />
        <main className="max-w-screen-2xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
