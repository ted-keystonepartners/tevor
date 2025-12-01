'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Home, 
  FolderOpen, 
  Images, 
  User, 
  Settings,
  ChevronLeft,
  Menu,
  Building2
} from 'lucide-react';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 모바일 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const menuItems = [
    { 
      icon: Home, 
      label: '홈', 
      path: '/dashboard'
    },
    { 
      icon: FolderOpen, 
      label: '파일저장소', 
      path: '/storage'
    },
    { 
      icon: Images, 
      label: '앨범보관함', 
      path: '/gallery'
    },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard' && pathname.startsWith('/chat')) {
      return true; // 채팅 페이지에서도 홈 활성화
    }
    return pathname === path;
  };

  // 모바일이면 children만 반환
  if (isMobile) {
    return <>{children}</>;
  }

  // 데스크탑 레이아웃
  return (
    <div className="h-screen flex bg-gray-900">
      {/* 사이드바 */}
      <aside 
        className={`
          ${isSidebarCollapsed ? 'w-20' : 'w-64'} 
          bg-gray-850 border-r border-gray-800 
          flex flex-col transition-all duration-200
          flex-shrink-0
        `}
        style={{ backgroundColor: '#1a1a1a' }}
      >
        {/* 로고 영역 */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
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

        {/* 메뉴 */}
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
                  <span className="flex-1 text-left">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* 사용자 섹션 */}
        <div className="border-t border-gray-800 p-4">
          <button
            onClick={() => router.push('/profile')}
            className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 transition-colors ${isSidebarCollapsed ? 'justify-center' : ''}`}
          >
            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
              <User size={20} className="text-gray-400" />
            </div>
            {!isSidebarCollapsed && (
              <>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-white">사용자</p>
                  <p className="text-xs text-gray-400">프로필 관리</p>
                </div>
                <Settings size={18} className="text-gray-400" />
              </>
            )}
          </button>
        </div>
      </aside>

      {/* 메인 컨텐츠 영역 */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}