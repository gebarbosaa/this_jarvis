import type { Metadata, Viewport } from 'next';
import { Lora, Inter } from 'next/font/google';
import './globals.css';

const display = Lora({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600'],
});

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Secretária',
  description: 'Sua organização pessoal em um só lugar.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#FAFAF7',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${sans.variable}`}>
      <body className="font-sans antialiased min-h-dvh">{children}</body>
    </html>
  );
}