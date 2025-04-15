import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import './globals.css'
import ChatWidget from '@/components/ChatWidget'

// Initialize the Nunito font
const nunito = Nunito({ 
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-nunito',
})

export const metadata: Metadata = {
  title: 'Opportunity AI',
  description: 'A friendly guide to creating opportunities for your family',
}

export default function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params?: { locale?: string };
}) {
  // Default to 'en' if locale is not available
  const locale = params?.locale || 'en';
  
  return (
    <html lang={locale} className={nunito.variable}>
      <body className="font-nunito" suppressHydrationWarning={true}>
        {children}
        <ChatWidget />
      </body>
    </html>
  )
}