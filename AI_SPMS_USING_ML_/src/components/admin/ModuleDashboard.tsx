import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../config/firebase';
import { 
  BookOpen, School, FileText, Award, AlertCircle, 
  FileCheck, Target, HelpCircle, Users 
} from 'lucide-react';
import { studentService } from '../../services/studentService';
import { Student } from '../../types';
import TuitionWorkTracker from '../modules/TuitionWorkTracker';
import SchoolClassworkTracker from '../modules/SchoolClassworkTracker';
import TuitionPendingTracker from '../modules/TuitionPendingTracker';
import TestTrackerModule from '../modules/TestTrackerModule';
import PaperCheckTrackerModule from '../modules/PaperCheckTrackerModule';
import DoubtBoxModule from '../modules/DoubtBoxModule';
import CambridgePaperModule from '../modules/CambridgePaperModule';
import WorkPoolModule from '../modules/WorkPoolModule';

interface ModuleDashboardProps {
  isAdmin: boolean;
  studentId?: string;
}

export default function ModuleDashboard({ isAdmin, studentId }: ModuleDashboardProps) {
  const [activeModule, setActiveModule] = useState('tuition-work');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, authLoading] = useAuthState(auth);

  useEffect(() => {
    if (isAdmin && user && !authLoading) {
      loadStudents();
    }
  }, [isAdmin, user, authLoading]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const data = await studentService.getAllStudents();
      setStudents(data);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const modules = [
    {
      id: 'tuition-work',
      name: 'Tuition Work Tracker',
      icon: BookOpen,
      description: 'Session logging and progress tracking',
      color: 'bg-green-500'
    },
    {
      id: 'school-classwork',
      name: 'School Classwork & Homework',
      icon: School,
      description: 'School assignments and homework tracking',
      color: 'bg-blue-500'
    },
    {
      id: 'tuition-pending',
      name: 'Tuition Pending Work',
      icon: AlertCircle,
      description: 'Pending work reminders and tracking',
      color: 'bg-orange-500'
    },
    {
      id: 'test-tracker',
      name: 'Test Tracker',
      icon: FileText,
      description: 'Test results and performance analytics',
      color: 'bg-purple-500'
    },
    {
      id: 'paper-check',
      name: 'Paper Check Tracker',
      icon: FileCheck,
      description: 'Paper checking workload management',
      color: 'bg-indigo-500'
    },
    {
      id: 'doubt-box',
      name: 'Doubt Box',
      icon: HelpCircle,
      description: 'Systematic doubt resolution',
      color: 'bg-pink-500'
    },
    {
      id: 'cambridge-paper',
      name: 'Cambridge Paper Coordinator',
      icon: Award,
      description: 'Cambridge paper workflow management',
      color: 'bg-yellow-500'
    },
    {
      id: 'work-pool',
      name: 'Work Pool',
      icon: Target,
      description: 'Intelligent task assignment',
      color: 'bg-teal-500'
    }
  ];

  const renderModule = () => {
    const props = { isAdmin, studentId, students, currentUser: user };
    
    switch (activeModule) {
      case 'tuition-work':
        return <TuitionWorkTracker {...props} />;
      case 'school-classwork':
        return <SchoolClassworkTracker {...props} />;
      case 'tuition-pending':
        return <TuitionPendingTracker {...props} />;
      case 'test-tracker':
        return <TestTrackerModule {...props} />;
      case 'paper-check':
        return <PaperCheckTrackerModule {...props} />;
      case 'doubt-box':
        return <DoubtBoxModule {...props} />;
      case 'cambridge-paper':
        return <CambridgePaperModule {...props} />;
      case 'work-pool':
        return <WorkPoolModule {...props} />;
      default:
        return <TuitionWorkTracker {...props} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img 
                  src="/shreeji education- zone.jpeg" 
                  alt="Cognigrade" 
                  className="h-10 w-10 rounded-full object-cover border-2 border-blue-200"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="bg-blue-600 rounded-lg p-2 hidden">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Cognigrade Education </h1>
                <p className="text-xs text-gray-500">
                  {isAdmin ? 'Admin Dashboard' : 'Student Portal'} • 8-Module Ecosystem
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {students.length} Students • {modules.length} Modules
              </div>
              <button
                onClick={() => window.location.reload()}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Module Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 overflow-x-auto py-2">
            {modules.map((module) => (
              <button
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                  activeModule === module.id
                    ? 'bg-blue-50 text-blue-700 border-2 border-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <module.icon className="h-4 w-4" />
                <span>{module.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Module Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        ) : (
          renderModule()
        )}
      </main>
    </div>
  );
}