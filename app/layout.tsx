import type { Metadata } from 'next';
import './globals.css';
import './workspace-theme.css';
import {APPEARANCE_BOOT} from '@/lib/appearance';
export const metadata: Metadata = { title: 'Adib / Content Studio', description: 'Ruang kerja konten lokal. Draft, tinjau, putuskan.' };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="id" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:APPEARANCE_BOOT}}/></head><body>{children}</body></html>; }
