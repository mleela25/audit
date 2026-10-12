import React from 'react';
import { Users, BookOpen, TrendingUp, Calendar, Target, Award, AlertCircle, FileText, BarChart3, Plus, UserPlus, ClipboardList, PieChart, Clock, CheckCircle } from 'lucide-react';
import { Student } from '../../types';
import { User } from 'firebase/auth';

interface DashboardOverviewProps {
  isAdmin: boolean;
  studentId?: string;
  currentStudent?: Student | null;
  students: Student[];
  currentUser?: User | null;
  onModuleChange?: (module: string) => void;
}

export default function DashboardOverview({ isAdmin, students, currentStudent, currentUser, onModuleChange }: DashboardOverviewProps) {
  const stats = [
    {
      name: 'Total Students',
      value: students.length.toString(),
      icon: Users,
      change: '+12%',
      changeType: 'positive' as const,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      name: 'Active Modules',
      value: '8',
      icon: Target,
      change: '100%',
      changeType: 'positive' as const,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      name: 'Avg Performance',
      value: '85.5%',
      icon: TrendingUp,
      change: '+5.2%',
      changeType: 'positive' as const,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      name: 'Active Boards',
      value: new Set(students.map(s => s.schoolType)).size.toString(),
      icon: BookOpen,
      change: '+2',
      changeType: 'positive' as const,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    },
  ];

  // Student-specific stats
  const studentStats = currentStudent ? [
    {
      name: 'My Subjects',
      value: currentStudent.subjects.length.toString(),
      icon: BookOpen,
      change: 'Active',
      changeType: 'positive' as const,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      name: 'School Board',
      value: currentStudent.schoolType,
      icon: Award,
      change: currentStudent.examPattern,
      changeType: 'positive' as const,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      name: 'Current Grade',
      value: `${currentStudent.grade}th`,
      icon: TrendingUp,
      change: 'Grade',
      changeType: 'positive' as const,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      name: 'Time Slot',
      value: currentStudent.batch.split(' - ')[0],
      icon: Calendar,
      change: 'Daily',
      changeType: 'positive' as const,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    },
  ] : [];

  // Student Work Pool Stats for Student Dashboard
  const studentWorkStats = currentStudent ? [
    {
      name: 'Assigned Work',
      value: '0', // TODO: Get from WorkPool service
      icon: Target,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      description: 'New work assigned to you'
    },
    {
      name: 'Pending Work',
      value: '0', // TODO: Get from WorkPool service
      icon: Clock,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      description: 'Work in progress'
    },
    {
      name: 'Completed Work',
      value: '0', // TODO: Get from WorkPool service
      icon: CheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      description: 'Successfully completed work'
    }
  ] : [];

  const moduleCards = [
    { name: 'Work Pool', icon: Target, color: 'bg-teal-500', count: '21', emoji: '🌀' },
    { name: 'Test Tracker', icon: FileText, color: 'bg-violet-500', count: '15', emoji: '📑' },
    { name: 'Paper Check', icon: FileText, color: 'bg-indigo-500', count: '12', emoji: '📋' },
    { name: 'Doubt Box', icon: AlertCircle, color: 'bg-pink-500', count: '9', emoji: '❓' },
    { name: 'Cambridge Papers', icon: Award, color: 'bg-yellow-500', count: '6', emoji: '📘' },
    { name: 'Calendar', icon: Calendar, color: 'bg-blue-500', count: '30', emoji: '📅' },
    { name: 'Analytics', icon: BarChart3, color: 'bg-purple-500', count: '∞', emoji: '📊' },
    { name: 'Attendance', icon: Users, color: 'bg-green-500', count: '100%', emoji: '✅' }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {isAdmin 
                ? 'Welcome to Cognigrade Education' 
                : currentStudent 
                  ? `Welcome back, ${currentStudent.name}!`
                  : 'Welcome to Cognigrade Education '
              }
            </h2>
            <p className="text-lg text-gray-600 mb-4">
              {isAdmin 
                ? 'Comprehensive Student Management System' 
                : currentStudent 
                  ? `${currentStudent.school} • Grade ${currentStudent.grade} • ${currentStudent.schoolType}`
                  : 'Track Your Academic Journey'
              }
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              {isAdmin ? (
                <>
                  <span className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {students.length} Students
              </span>
              <span className="flex items-center">
                <Target className="h-4 w-4 mr-1" />
                8 Modules
              </span>
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Real-time Tracking
              </span>
                </>
              ) : currentStudent ? (
                <>
                  <span className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-1" />
                    {currentStudent.subjects.length} Subjects
                  </span>
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {currentStudent.batch}
                  </span>
                  <span className="flex items-center">
                    <Award className="h-4 w-4 mr-1" />
                    {currentStudent.schoolType}
                  </span>
                </>
              ) : null}
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl flex items-center justify-center">
              {currentStudent ? (
                <span className="text-4xl font-bold text-white">
                  {currentStudent.name.split(' ').map(n => n[0]).join('')}
                </span>
              ) : (
                <Target className="w-16 h-16 text-white" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(isAdmin ? stats : studentStats).map((stat) => (
          <div key={stat.name} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div className={`${stat.bgColor} rounded-xl p-3`}>
                <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-600">{stat.name}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Student Personal Details */}
      {!isAdmin && currentStudent && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8" id="student-profile">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">My Profile</h3>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg font-bold">
                  {currentStudent.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">{currentStudent.name}</p>
                <p className="text-sm text-gray-500">{currentStudent.school} • Grade {currentStudent.grade}</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {new Date(currentStudent.updatedAt).toLocaleDateString()}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                <span className="text-sm font-medium text-gray-600">Full Name</span>
                <span className="text-sm font-semibold text-blue-900">{currentStudent.name}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
                <span className="text-sm font-medium text-gray-600">School</span>
                <span className="text-sm font-semibold text-green-900">{currentStudent.school}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                <span className="text-sm font-medium text-gray-600">Grade</span>
                <span className="text-sm font-semibold text-purple-900">{currentStudent.grade}th</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-200">
                <span className="text-sm font-medium text-gray-600">Board</span>
                <span className="text-sm font-semibold text-orange-900">{currentStudent.schoolType}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border border-teal-200">
                <span className="text-sm font-medium text-gray-600">Parent Name</span>
                <span className="text-sm font-semibold text-teal-900">{currentStudent.parentName}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200">
                <span className="text-sm font-medium text-gray-600">Contact</span>
                <span className="text-sm font-semibold text-red-900">{currentStudent.parentPhone}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-200">
                <span className="text-sm font-medium text-gray-600">Time Slot</span>
                <span className="text-sm font-semibold text-indigo-900">{currentStudent.batch}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-200">
                <span className="text-sm font-medium text-gray-600">Exam Pattern</span>
                <span className="text-sm font-semibold text-violet-900">{currentStudent.examPattern}</span>
              </div>
            </div>
          </div>
          
          {/* Contact Information */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Email:</span>
                  <span className="text-sm font-medium text-gray-900">{currentStudent.email || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Address:</span>
                  <span className="text-sm font-medium text-gray-900 text-right max-w-xs">{currentStudent.address}</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6 border border-green-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Academic Information</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Joining Date:</span>
                  <span className="text-sm font-medium text-gray-900">{new Date(currentStudent.joiningDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Student ID:</span>
                  <span className="text-sm font-medium text-gray-900">{currentStudent.id.slice(-8).toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Subjects List */}
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">My Subjects ({currentStudent.subjects.length})</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {currentStudent.subjects.map((subject, index) => (
                <div key={index} className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 text-center hover:shadow-md transition-all duration-200 group">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span className="text-white text-xs font-bold">
                      {subject.split(' ').map(s => s[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors">{subject}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Student Work Pool Dashboard - Student Only */}
      {!isAdmin && currentStudent && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">My Work Dashboard</h3>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              Work Pool System
            </span>
          </div>
          
          {/* Work Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {studentWorkStats.map((stat, index) => (
              <div key={index} className={`${stat.bgColor} rounded-2xl p-6 border-2 border-opacity-20`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.color} rounded-xl p-3`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{stat.name}</h4>
                <p className="text-sm text-gray-600">{stat.description}</p>
                <button 
                  onClick={() => onModuleChange?.('work-pool')}
                  className={`mt-4 w-full ${stat.color} text-white py-2 px-4 rounded-xl font-medium hover:opacity-90 transition-opacity`}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>

          {/* Quick Work Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={() => onModuleChange?.('work-pool')}
              className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl hover:from-blue-100 hover:to-purple-100 transition-all duration-200 border border-blue-200"
            >
              <Target className="h-8 w-8 text-blue-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-blue-900">View All Work</p>
                <p className="text-sm text-blue-700">Access complete work pool</p>
              </div>
            </button>
            <button 
              onClick={() => onModuleChange?.('calendar')}
              className="flex items-center p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl hover:from-green-100 hover:to-teal-100 transition-all duration-200 border border-green-200"
            >
              <Calendar className="h-8 w-8 text-green-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-green-900">View Calendar</p>
                <p className="text-sm text-green-700">Check attendance & progress</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Modules Overview */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">{isAdmin ? 'Module Ecosystem' : 'Available Modules'}</h3>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            All Active
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {moduleCards.map((module, index) => (
            <div key={index} className="group p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <div className={`${module.color} rounded-lg p-2`}>
                  <module.icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-2xl">{module.emoji}</span>
              </div>
              <h4 className="font-medium text-gray-900 text-sm mb-1">{module.name}</h4>
              <p className="text-xs text-gray-500">{module.count} entries</p>
            </div>
          ))}
        </div>
      </div>

      {/* Board Distribution - Admin Only */}
      {isAdmin && (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Board-wise Student Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from(new Set(students.map(s => s.schoolType))).map((board) => {
            const count = students.filter(s => s.schoolType === board).length;
            const percentage = students.length > 0 ? ((count / students.length) * 100).toFixed(1) : '0';
            return (
              <div key={board} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-gray-900">{board}</h4>
                  <span className="text-2xl font-bold text-blue-600">{count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">{percentage}% of total students</p>
              </div>
            );
          })}
        </div>
      </div>
      )}

      {/* Quick Actions */}
      {isAdmin && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {currentUser?.displayName?.split(' ').map(n => n[0]).join('') || 'A'}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Welcome, {currentUser?.displayName || 'Admin'}
                </p>
                <p className="text-xs text-gray-500">{currentUser?.email}</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => onModuleChange?.('students')}
              className="flex items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors group"
            >
              <UserPlus className="h-8 w-8 text-blue-600 mr-3 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <p className="font-medium text-blue-900">Add Student</p>
                <p className="text-sm text-blue-700">Register new student</p>
              </div>
            </button>
            <button 
              onClick={() => onModuleChange?.('work-pool')}
              className="flex items-center p-4 bg-teal-50 rounded-xl hover:bg-teal-100 transition-colors group"
            >
              <Target className="h-8 w-8 text-teal-600 mr-3 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <p className="font-medium text-teal-900">Manage Work</p>
                <p className="text-sm text-teal-700">Assign & track work</p>
              </div>
            </button>
            <button 
              onClick={() => onModuleChange?.('test-tracker')}
              className="flex items-center p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors group"
            >
              <FileText className="h-8 w-8 text-orange-600 mr-3 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <p className="font-medium text-orange-900">Add Test Result</p>
                <p className="text-sm text-orange-700">Record performance</p>
              </div>
            </button>
            <button 
              onClick={() => onModuleChange?.('analytics')}
              className="flex items-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors group"
            >
              <BarChart3 className="h-8 w-8 text-purple-600 mr-3 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <p className="font-medium text-purple-900">View Analytics</p>
                <p className="text-sm text-purple-700">Performance insights</p>
              </div>
            </button>
            <button 
              onClick={() => onModuleChange?.('doubt-box')}
              className="flex items-center p-4 bg-pink-50 rounded-xl hover:bg-pink-100 transition-colors group"
            >
              <AlertCircle className="h-8 w-8 text-pink-600 mr-3 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <p className="font-medium text-pink-900">Add Doubt</p>
                <p className="text-sm text-pink-700">Record student doubts</p>
              </div>
            </button>
            <button 
              onClick={() => onModuleChange?.('cambridge-paper')}
              className="flex items-center p-4 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition-colors group"
            >
              <Award className="h-8 w-8 text-yellow-600 mr-3 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <p className="font-medium text-yellow-900">Assign Paper</p>
                <p className="text-sm text-yellow-700">Cambridge papers</p>
              </div>
            </button>
            <button 
              onClick={() => onModuleChange?.('attendance')}
              className="flex items-center p-4 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors group"
            >
              <ClipboardList className="h-8 w-8 text-indigo-600 mr-3 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <p className="font-medium text-indigo-900">Take Attendance</p>
                <p className="text-sm text-indigo-700">Mark daily attendance</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}