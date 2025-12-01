'use client';

import { ReactNode } from 'react';
import DesktopSidebar from './DesktopSidebar';

interface DesktopChatLayoutProps {
  children: ReactNode;
}

export default function DesktopChatLayout({ children }: DesktopChatLayoutProps) {
  return (
    <div className="h-screen flex bg-gray-900">
      {/* Sidebar */}
      <DesktopSidebar />
      
      {/* Chat Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}