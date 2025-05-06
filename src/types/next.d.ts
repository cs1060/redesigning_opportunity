// This file extends the Next.js types to fix the layout component type issue
import { ReactNode } from 'react';

declare module 'next' {
  export interface LayoutProps {
    children: ReactNode;
    params: Record<string, string | string[]>; // More specific type for locale params
  }
}
