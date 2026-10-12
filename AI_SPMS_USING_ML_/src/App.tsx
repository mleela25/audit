import { useState } from 'react';
import { UserRole } from './types';
import LoginPage from './components/auth/LoginPage';
import AdminDashboard from './components/admin/AdminDashboard';
import StudentDashboard from './components/student/StudentDashboard';

export default function App() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);

  const handleLogin = (role: UserRole, userId?: string) => {
    setUserRole(role);
    if (userId) {
      setStudentId(userId);
    }
  };

  const handleLogout = () => {
    setUserRole(null);
    setStudentId(null);
  };

  if (!userRole) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (userRole === 'admin') {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  if (userRole === 'student' && studentId) {
    return <StudentDashboard studentId={studentId} onLogout={handleLogout} />;
  }

  // Fallback - should not reach here
  return <LoginPage onLogin={handleLogin} />;
}