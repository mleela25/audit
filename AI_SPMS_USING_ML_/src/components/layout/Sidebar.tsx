import { useState } from 'react';
import { 
  Home, 
  Users, 
  BookOpen, 
  FileText,
  FileCheck,
  HelpCircle,
  Award,
  Target,
  Calendar,
  BarChart3,
  Settings,
  Search,
  ChevronDown,
  ChevronRight,
  Bell,
  User,
  LogOut
} from 'lucide-react';
import { clsx } from 'clsx';
import { Student } from '../../types';
import { User as AuthUser } from 'firebase/auth';

interface SidebarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
  isAdmin: boolean;
  currentStudent?: Student | null;
  currentUser?: AuthUser | null;
  onLogout: () => void;
}

export default function Sidebar({ activeModule, onModuleChange, isAdmin, currentStudent, currentUser, onLogout }: SidebarProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['modules']);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const mainNavigation = [
    { 
      id: 'dashboard', 
      name: 'Dashboard', 
      icon: Home, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    { 
      id: 'ai-insights', 
      name: 'AI Insights', 
      icon: Search, 
      color: 'text-fuchsia-600',
      bgColor: 'bg-fuchsia-50',
      borderColor: 'border-fuchsia-200',
      emoji: '✨'
    },
    { 
      id: 'students', 
      name: 'Students', 
      icon: Users, 
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    { 
      id: 'analytics', 
      name: 'Analytics', 
      icon: BarChart3, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    { 
      id: 'attendance', 
      name: 'Attendance', 
      icon: Calendar, 
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    }
  ];

  const moduleNavigation = [
    { 
      id: 'calendar', 
      name: 'Calendar Dashboard', 
      icon: Calendar, 
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      emoji: '📅'
    },
    { 
      id: 'work-pool', 
      name: 'Work Pool', 
      icon: Target, 
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200',
      emoji: '🌀'
    },
    { 
      id: 'test-tracker', 
      name: 'Test Tracker', 
      icon: FileText, 
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
      borderColor: 'border-violet-200',
      emoji: '📑'
    },
    { 
      id: 'paper-check', 
      name: 'Paper Check Tracker', 
      icon: FileCheck, 
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      emoji: '📋'
    },
    { 
      id: 'doubt-box', 
      name: 'Doubt Box', 
      icon: HelpCircle, 
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
      emoji: '❓'
    },
    { 
      id: 'cambridge-paper', 
      name: 'Cambridge Paper Coordinator', 
      icon: Award, 
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      emoji: '📘'
    },
  ];

  const filteredModules = moduleNavigation.filter(module =>
    module.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const NavItem = ({ item, isActive, onClick }: { 
    item: any; 
    isActive: boolean; 
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={clsx(
        'w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group',
        isActive
          ? `${item.bgColor} ${item.color} border-l-4 ${item.borderColor} shadow-sm`
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      )}
    >
      <item.icon className={clsx(
        'mr-3 h-5 w-5 transition-colors',
        isActive ? item.color : 'text-gray-400 group-hover:text-gray-600'
      )} />
      <span className="truncate">{item.name}</span>
      {item.emoji && (
        <span className="ml-auto text-lg">{item.emoji}</span>
      )}
    </button>
  );

  const SectionHeader = ({ title, section, count }: { 
    title: string; 
    section: string; 
    count?: number;
  }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
    >
      <span className="flex items-center">
        {title}
        {count !== undefined && (
          <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
            {count}
          </span>
        )}
      </span>
      {expandedSections.includes(section) ? (
        <ChevronDown className="h-4 w-4" />
      ) : (
        <ChevronRight className="h-4 w-4" />
      )}
    </button>
  );

  return (
    <div className="flex h-screen bg-white border-r border-gray-200 w-80 flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <img 
              src="/cognigrade.png" 
              alt="Cognigrade" 
              className="w-8 h-8 rounded-lg object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <BookOpen className="w-6 h-6 text-white hidden" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900"> Cognigrade</h1>
            <p className="text-xs text-gray-500">
              {isAdmin ? 'Admin Portal' : currentStudent ? `${currentStudent.name}'s Portal` : 'Student Portal'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="h-4 w-4" />
          </button>
          <button 
            onClick={onLogout}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Student Profile Section */}
      {!isAdmin && currentStudent && (
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg font-bold">
                {currentStudent.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{currentStudent.name}</h3>
              <p className="text-sm text-gray-600">{currentStudent.school}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  Grade {currentStudent.grade}
                </span>
                <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  {currentStudent.schoolType}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white/70 rounded-lg p-2">
              <p className="text-gray-500">Batch</p>
              <p className="font-medium text-gray-900">{currentStudent.batch}</p>
            </div>
            <div className="bg-white/70 rounded-lg p-2">
              <p className="text-gray-500">Subjects</p>
              <p className="font-medium text-gray-900">{currentStudent.subjects.length}</p>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="p-4 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search modules..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Main Navigation */}
        {isAdmin && (
          <div>
          <SectionHeader title="Main" section="main" />
          {expandedSections.includes('main') && (
            <div className="mt-2 space-y-1">
              {mainNavigation.map((item) => (
                <NavItem
                  key={item.id}
                  item={item}
                  isActive={activeModule === item.id}
                  onClick={() => onModuleChange(item.id)}
                />
              ))}
            </div>
          )}
          </div>
        )}

        {/* 8 Modules */}
        <div>
          <SectionHeader title="8 Modules" section="modules" count={8} />
          {expandedSections.includes('modules') && (
            <div className="mt-2 space-y-1">
              {filteredModules.map((item) => (
                <NavItem
                  key={item.id}
                  item={item}
                  isActive={activeModule === item.id}
                  onClick={() => onModuleChange(item.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Settings */}
        {isAdmin && (
          <div>
          <SectionHeader title="Settings" section="settings" />
          {expandedSections.includes('settings') && (
            <div className="mt-2 space-y-1">
              <NavItem
                item={{
                  id: 'settings',
                  name: 'Settings',
                  icon: Settings,
                  color: 'text-gray-600',
                  bgColor: 'bg-gray-50',
                  borderColor: 'border-gray-200'
                }}
                isActive={activeModule === 'settings'}
                onClick={() => onModuleChange('settings')}
              />
            </div>
          )}
          </div>
        )}
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-blue-200">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            {currentStudent ? (
              <span className="text-white text-sm font-medium">
                {currentStudent.name.split(' ').map(n => n[0]).join('')}
              </span>
            ) : (
              <User className="w-4 h-4 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {isAdmin ? (currentUser?.displayName || 'Admin Portal') : currentStudent?.name || 'Student User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {isAdmin ? (currentUser?.email || 'Full Access') : currentStudent?.school || 'Student Portal'}
            </p>
          </div>
          <button 
            onClick={onLogout}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}