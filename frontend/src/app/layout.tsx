import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import ServerWakeup from '@/components/ServerWakeup';

export const metadata: Metadata = {
  title: 'TEVOR - 인테리어 시공 AI 컨시어지',
  description: '시공 현장의 모든 기록을 AI와 함께 관리하세요',
  keywords: ['인테리어', '시공', 'AI', '컨시어지', '현장관리'],
  authors: [{ name: 'TEVOR Team' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#00C6AE',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="font-sans antialiased">
        <ServerWakeup />
        <div id="root">
          {children}
        </div>
      </body>
    </html>
  );
}