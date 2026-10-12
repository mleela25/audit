 
import { User } from 'firebase/auth';
import { Student } from '../../types';

// Import all module components
import TestTrackerModule from '../modules/TestTrackerModule';
import PaperCheckTrackerModule from '../modules/PaperCheckTrackerModule';
import DoubtBoxModule from '../modules/DoubtBoxModule';
import CambridgePaperModule from '../modules/CambridgePaperModule';
import WorkPoolModule from '../modules/WorkPoolModule';

// Import dashboard components
import DashboardOverview from '../dashboard/DashboardOverview';
import StudentsManagement from '../dashboard/StudentsManagement';
import AnalyticsDashboard from '../dashboard/AnalyticsDashboard';
import AttendanceManagement from '../dashboard/AttendanceManagement';
import CalendarDashboard from '../dashboard/CalendarDashboard';
import AIInsightsDashboard from '../dashboard/AIInsightsDashboard';

interface ModuleContentProps {
  activeModule: string;
  isAdmin: boolean;
  studentId?: string;
  currentStudent?: Student | null;
  students: Student[];
  loading: boolean;
  currentUser?: User | null;
  onModuleChange?: (module: string) => void;
  onStudentsUpdate?: () => void;
}

export default function ModuleContent({ 
  activeModule, 
  isAdmin, 
  studentId, 
  currentStudent,
  students, 
  loading,
  currentUser,
  onModuleChange,
  onStudentsUpdate
}: ModuleContentProps) {
  const moduleProps = { 
    isAdmin, 
    studentId, 
    currentStudent,
    students, 
    currentUser,
    onModuleChange,
    onStudentsUpdate: onStudentsUpdate || (() => window.location.reload())
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  switch (activeModule) {
    // Main Navigation
    case 'dashboard':
      return <DashboardOverview {...moduleProps} />;
    case 'students':
      return <StudentsManagement {...moduleProps} />;
    case 'analytics':
      return <AnalyticsDashboard {...moduleProps} />;
    case 'attendance':
      return <AttendanceManagement {...moduleProps} />;
    case 'calendar':
      return <CalendarDashboard {...moduleProps} />;
    case 'ai-insights':
      return <AIInsightsDashboard {...moduleProps} />;

    // Modules
    case 'test-tracker':
      return <TestTrackerModule {...moduleProps} />;
    case 'paper-check':
      return <PaperCheckTrackerModule {...moduleProps} />;
    case 'doubt-box':
      return <DoubtBoxModule {...moduleProps} />;
    case 'cambridge-paper':
      return <CambridgePaperModule {...moduleProps} />;
    case 'work-pool':
      return <WorkPoolModule {...moduleProps} />;

    default:
      return <DashboardOverview {...moduleProps} />;
  }
}