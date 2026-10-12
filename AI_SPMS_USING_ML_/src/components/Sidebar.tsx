import React from 'react';
import { 
  Home, 
  Users, 
  BookOpen, 
  ClipboardList, 
  GraduationCap, 
  BarChart3, 
  FileText,
  Settings
} from 'lucide-react';
import { clsx } from 'clsx';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigation = [
  { name: 'Dashboard', href: 'dashboard', icon: Home },
  { name: 'Students', href: 'students', icon: Users },
  { name: 'Classwork', href: 'classwork', icon: BookOpen },
  { name: 'Homework', href: 'homework', icon: ClipboardList },
  { name: 'Tests', href: 'tests', icon: GraduationCap },
  { name: 'Analytics', href: 'analytics', icon: BarChart3 },
  { name: 'Reports', href: 'reports', icon: FileText },
  { name: 'Settings', href: 'settings', icon: Settings },
];

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:pt-16">
      <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = activeTab === item.href;
              return (
                <button
                  key={item.name}
                  onClick={() => onTabChange(item.href)}
                  className={clsx(
                    isActive
                      ? 'bg-blue-50 border-r-2 border-blue-500 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    'group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md transition-colors'
                  )}
                >
                  <item.icon
                    className={clsx(
                      isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500',
                      'mr-3 flex-shrink-0 h-5 w-5'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}