import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../config/firebase';
import { studentService } from '../../services/studentService';
import { Student } from '../../types';
import Sidebar from './Sidebar';
import ModuleContent from './ModuleContent';

interface MainLayoutProps {
  isAdmin: boolean;
  studentId?: string;
  onLogout: () => void;
}

export default function MainLayout({ isAdmin, studentId, onLogout }: MainLayoutProps) {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [students, setStudents] = useState<Student[]>([]);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, authLoading] = useAuthState(auth);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (user && !authLoading) {
      loadStudents();
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (studentId && students.length > 0) {
      const student = students.find(s => s.id === studentId);
      setCurrentStudent(student || null);
    }
  }, [studentId, students, refreshKey]);

  const handleStudentsUpdate = () => {
    loadStudents();
    // Force re-render of current student data
    setRefreshKey(prev => prev + 1);
  };

  const loadStudents = async () => {
    try {
      setLoading(true);
      const studentsData = await studentService.getAllStudents();
      setStudents(studentsData);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        activeModule={activeModule}
        onModuleChange={setActiveModule}
        isAdmin={isAdmin}
        currentStudent={currentStudent}
        currentUser={user}
        onLogout={onLogout}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 capitalize">
                {activeModule.replace('-', ' ')}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {isAdmin 
                  ? 'Manage and track student progress' 
                  : currentStudent 
                    ? `Welcome back, ${currentStudent.name}!`
                    : 'View your academic progress'
                }
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {!isAdmin && currentStudent && (
                <div className="flex items-center space-x-3 bg-blue-50 px-4 py-2 rounded-xl">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {currentStudent.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{currentStudent.name}</p>
                    <p className="text-xs text-gray-500">{currentStudent.school} • Grade {currentStudent.grade}</p>
                  </div>
                </div>
              )}
              <div className="text-sm text-gray-600">
                {students.length} Students • 8 Modules
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {isAdmin ? 'A' : 'S'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <ModuleContent
            activeModule={activeModule}
            isAdmin={isAdmin}
            studentId={studentId}
            currentStudent={currentStudent}
            students={students}
            loading={loading}
            currentUser={user}
            onModuleChange={setActiveModule}
            onStudentsUpdate={handleStudentsUpdate}
          />
        </main>
      </div>
    </div>
  );
}