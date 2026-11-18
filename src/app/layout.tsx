import type { Metadata, Viewport } from 'next';
import './globals.css';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

export const metadata: Metadata = {
  title: '잔소리메이트 (ZansoriMate) - AI 협업 및 마감일 독촉 플랫폼',
  description: 'AI가 회의록을 요약해 할 일을 쪼개주고, 맵고 달달한 잔소리로 팀원들의 마감일을 챙겨주는 초간편 협업 플랫폼',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0B1326',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="dark">
      <body className="bg-background min-h-screen text-on-surface antialiased flex flex-col justify-between">
        <Header />
        <main className="flex-1 w-full max-w-md mx-auto pt-16 pb-20 px-4">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}

