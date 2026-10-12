'use client';

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  Image as ImageIcon, 
  Users, 
  Calendar, 
  BarChart3, 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  MessageSquare, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Camera,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const getMenuItems = () => {
    const commonItems = [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    ];

    if (user?.role === 'admin') {
      return [
        ...commonItems,
        { icon: Briefcase, label: 'Portfolio', href: '/portfolio' },
        { icon: ImageIcon, label: 'Albums', href: '/albums' },
        { icon: Users, label: 'Clients', href: '/clients' },
        { icon: Calendar, label: 'Bookings', href: '/bookings' },
        { icon: BarChart3, label: 'Analytics', href: '/analytics' },
        { icon: Sparkles, label: 'AI Photos', href: '/ai-insights' },
        { icon: ShieldCheck, label: 'Watermarking', href: '/watermarking' },
        { icon: Lock, label: 'Permissions', href: '/permissions' },
        { icon: MessageSquare, label: 'Feedback', href: '/feedback' },
        { icon: Settings, label: 'Settings', href: '/settings' },
      ];
    }

    if (user?.role === 'photographer') {
      return [
        ...commonItems,
        { icon: Briefcase, label: 'Portfolio', href: '/portfolio' },
        { icon: ImageIcon, label: 'Albums', href: '/albums' },
        { icon: Users, label: 'Clients', href: '/clients' },
        { icon: Calendar, label: 'Bookings', href: '/bookings' },
        { icon: BarChart3, label: 'Analytics', href: '/analytics' },
        { icon: Sparkles, label: 'AI Photos', href: '/ai-insights' },
        { icon: ShieldCheck, label: 'Watermarking', href: '/watermarking' },
        { icon: MessageSquare, label: 'Feedback', href: '/feedback' },
        { icon: Settings, label: 'Settings', href: '/settings' },
      ];
    }

    if (user?.role === 'client') {
      return [
        ...commonItems,
        { icon: ImageIcon, label: 'My Gallery', href: '/albums' },
        { icon: MessageSquare, label: 'Feedback', href: '/feedback' },
      ];
    }

    return commonItems;
  };

  const menuItems = getMenuItems();

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen bg-card border-r border-white/10 transition-all duration-300 z-50",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-accent to-secondary rounded-lg flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight gradient-text">Shutter CMS</span>
            </div>
          )}
          {isCollapsed && (
             <div className="w-8 h-8 bg-gradient-to-br from-accent to-secondary rounded-lg flex items-center justify-center mx-auto">
                <Camera className="w-5 h-5 text-white" />
              </div>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-8 w-6 h-6 bg-accent rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform"
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item, index) => (
            <Link 
              key={index}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-3 rounded-xl transition-all group hover:bg-white/5",
                pathname === item.href ? "bg-accent/10 text-accent" : "text-muted hover:text-white"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 min-w-[20px] transition-colors",
                pathname === item.href ? "text-accent" : "group-hover:text-accent",
                !isCollapsed && "mr-4"
              )} />
              {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User Profile Summary */}
        <div className="p-4 border-t border-white/10">
          <div className={cn(
            "flex items-center p-2 rounded-xl bg-white/5",
            isCollapsed ? "justify-center" : "space-x-3"
          )}>
            <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent font-bold uppercase">
              {user?.name?.substring(0, 2) || '??'}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-white">{user?.name || 'Loading...'}</p>
                <p className="text-[10px] text-muted truncate uppercase">{user?.role || 'User'}</p>
              </div>
            )}
            {!isCollapsed && (
              <button 
                onClick={handleLogout}
                className="p-1.5 hover:bg-rose-500/10 hover:text-rose-500 text-muted rounded-lg transition-all"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
