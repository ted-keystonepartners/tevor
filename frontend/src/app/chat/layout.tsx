import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: '채팅 - TEVOR',
  description: 'AI 컨시어지와 시공 현장에 대해 상담하세요',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#00C6AE',
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}