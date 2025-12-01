'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Home, 
  MessageSquare, 
  FolderOpen, 
  Images, 
  User, 
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  Plus,
  Search,
  Building2
} from 'lucide-react';

interface DesktopLayoutProps {
  children: React.ReactNode;
}

export default function DesktopLayout({ children }: DesktopLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const menuItems = [
    { 
      icon: Home, 
      label: '대시보드', 
      path: '/dashboard',
      badge: null 
    },
    { 
      icon: MessageSquare, 
      label: '채팅', 
      path: '/chat',
      badge: null 
    },
    { 
      icon: FolderOpen, 
      label: '파일저장소', 
      path: '/storage',
      badge: null 
    },
    { 
      icon: Images, 
      label: '앨범보관함', 
      path: '/gallery',
      badge: null 
    },
    { 
      icon: User, 
      label: '프로필', 
      path: '/profile',
      badge: null 
    },
    { 
      icon: Settings, 
      label: '설정', 
      path: '/settings',
      badge: null 
    },
  ];

  const isActive = (path: string) => {
    if (path === '/chat') {
      return pathname.startsWith('/chat');
    }
    return pathname === path;
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <aside 
        className={`
          ${isSidebarCollapsed ? 'w-20' : 'w-64'} 
          bg-gray-850 border-r border-gray-800 
          flex flex-col transition-all duration-200
          hidden lg:flex
        `}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Building2 size={20} className="text-white" />
            </div>
            {!isSidebarCollapsed && (
              <div>
                <h1 className="text-lg font-bold text-white">TEVOR</h1>
                <p className="text-xs text-gray-400">시공 AI 컨시어지</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ChevronLeft 
              size={18} 
              className={`text-gray-400 transition-transform ${isSidebarCollapsed ? 'rotate-180' : ''}`} 
            />
          </button>
        </div>

        {/* Search Box (expanded only) */}
        {!isSidebarCollapsed && (
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                placeholder="검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gray-600"
              />
            </div>
          </div>
        )}

        {/* New Project Button */}
        <div className={`${isSidebarCollapsed ? 'px-4' : 'px-4'} pb-2`}>
          <button
            onClick={() => {
              // 새 프로젝트 생성 모달 열기
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('openCreateProject'));
              }
            }}
            className={`
              ${isSidebarCollapsed ? 'w-12 h-12 p-0 justify-center' : 'w-full px-4 py-2.5 justify-start gap-2'} 
              bg-blue-600 hover:bg-blue-700 
              text-white rounded-lg flex items-center 
              transition-all font-medium text-sm
            `}
          >
            <Plus size={18} />
            {!isSidebarCollapsed && <span>새 프로젝트</span>}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                  transition-all text-sm font-medium
                  ${active 
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                  }
                  ${isSidebarCollapsed ? 'justify-center' : 'justify-start'}
                `}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <Icon size={20} strokeWidth={1.5} />
                {!isSidebarCollapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="border-t border-gray-800 p-4">
          <div className={`flex items-center gap-3 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
              <User size={20} className="text-gray-400" />
            </div>
            {!isSidebarCollapsed && (
              <div className="flex-1">
                <p className="text-sm font-medium text-white">사용자</p>
                <p className="text-xs text-gray-400">user@example.com</p>
              </div>
            )}
            {!isSidebarCollapsed && (
              <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                <LogOut size={18} className="text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded-lg"
      >
        <Menu size={24} className="text-gray-400" />
      </button>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}