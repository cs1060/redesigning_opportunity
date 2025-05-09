import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import './globals.css';
import ChatWidget from '@/components/ChatWidget';

// Initialize the Nunito font
const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-nunito',
});

export const metadata: Metadata = {
  title: 'Opportunity AI',
  description: 'A friendly guide to creating opportunities for your family',
};

// Next.js 15: `params` is delivered as a Promise
type LayoutParams = { locale?: string };

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<LayoutParams>;
}) {
  const { locale = 'en' } = await params;

  return (
    <html lang={locale} className={nunito.variable}>
      <body className="font-nunito" suppressHydrationWarning>
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}