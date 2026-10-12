import React from 'react';
import { Calendar, Users, CheckCircle, XCircle, Plus, FileText, Download, Clock, Filter } from 'lucide-react';
import { Student } from '../../types';
import { User } from 'firebase/auth';
import { useState, useEffect } from 'react';
import AttendanceForm from '../admin/AttendanceForm';
import AttendanceReport from '../admin/AttendanceReport';
import { attendanceService } from '../../services/attendanceService';
import { AttendanceRecord } from '../../types';

interface AttendanceManagementProps {
  isAdmin: boolean;
  studentId?: string;
  students: Student[];
  currentUser?: User | null;
}

export default function AttendanceManagement({ isAdmin, students }: AttendanceManagementProps) {
  const [showAttendanceForm, setShowAttendanceForm] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord[]>([]);
  const [attendanceData, setAttendanceData] = useState<Record<string, 'Present' | 'Absent' | 'Late'>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isHoliday, setIsHoliday] = useState(false);

  const batches = ['all', ...Array.from(new Set(students.map(s => s.batch)))];

  useEffect(() => {
    loadTodayAttendance();
  }, [selectedDate]);

  useEffect(() => {
    // Initialize attendance data for filtered students
    const filteredStudents = selectedBatch === 'all' 
      ? students 
      : students.filter(s => s.batch === selectedBatch);
    
    const initialData: Record<string, 'Present' | 'Absent' | 'Late'> = {};
    filteredStudents.forEach(student => {
      const existingRecord = todayAttendance.find(a => a.studentId === student.id);
      initialData[student.id] = existingRecord?.status || 'Present';
    });
    setAttendanceData(initialData);
  }, [selectedBatch, students, todayAttendance]);

  const loadTodayAttendance = async () => {
    setLoading(true);
    try {
      const attendance = await attendanceService.getAttendanceByDate(selectedDate);
      setTodayAttendance(attendance);
    } catch (error) {
      console.error('Error loading today attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceAdded = () => {
    setShowAttendanceForm(false);
    loadTodayAttendance();
  };

  const toggleAttendance = (studentId: string, status: 'Present' | 'Absent' | 'Late') => {
    if (isHoliday) return; // Don't allow individual changes if it's a holiday
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const saveAttendance = async () => {
    setSaving(true);
    try {
      const filteredStudents = selectedBatch === 'all' 
        ? students 
        : students.filter(s => s.batch === selectedBatch);

      for (const student of filteredStudents) {
        const status = isHoliday ? 'Present' : attendanceData[student.id]; // Mark all as present if holiday
        if (status) {
          // Check if record already exists
          const existingRecord = todayAttendance.find(a => a.studentId === student.id);
          
          if (existingRecord) {
            // Update existing record
            await attendanceService.updateAttendance(existingRecord.id, {
              status,
              remarks: isHoliday ? 'Holiday' : existingRecord.remarks,
              checkInTime: new Date().toLocaleTimeString('en-US', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit' 
              })
            });
          } else {
            // Create new record
            await attendanceService.addAttendance({
              studentId: student.id,
              studentName: student.name,
              date: selectedDate,
              timeSlot: student.batch,
              status,
              remarks: isHoliday ? 'Holiday' : '',
              checkInTime: new Date().toLocaleTimeString('en-US', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit' 
              })
            });
          }
        }
      }
      
      await loadTodayAttendance();
      alert(isHoliday ? 'Holiday marked for all students!' : 'Attendance saved successfully!');
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Error saving attendance. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present': return 'bg-green-100 text-green-800';
      case 'Absent': return 'bg-red-100 text-red-800';
      case 'Late': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Present': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'Absent': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'Late': return <Clock className="h-5 w-5 text-yellow-600" />;
      default: return <Users className="h-5 w-5 text-gray-600" />;
    }
  };

  const filteredStudents = selectedBatch === 'all' 
    ? students 
    : students.filter(s => s.batch === selectedBatch);

  const presentCount = Object.values(attendanceData).filter(status => status === 'Present').length;
  const absentCount = Object.values(attendanceData).filter(status => status === 'Absent').length;
  const attendancePercentage = filteredStudents.length > 0 
    ? Math.round((presentCount / filteredStudents.length) * 100) 
    : 0;

  const AttendanceToggle = ({ student }: { student: Student }) => {
    const currentStatus = isHoliday ? 'Present' : (attendanceData[student.id] || 'Present');
    
    return (
      <div className={`rounded-2xl border p-6 hover:shadow-lg transition-all duration-200 ${
        isHoliday ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-lg font-bold text-white">
              {student.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{student.name}</h3>
            <p className="text-sm text-gray-500">{student.school} • Grade {student.grade}</p>
            <p className="text-xs text-gray-400">{student.batch}</p>
          </div>
        </div>

        {isHoliday ? (
          <div className="text-center py-4">
            <div className="inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-800 rounded-xl font-medium">
              🎉 Holiday - All Present
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => toggleAttendance(student.id, 'Present')}
            className={`py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center space-x-2 ${
              currentStatus === 'Present'
                ? 'bg-green-500 text-white shadow-lg scale-105 border-2 border-green-600'
                : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
            }`}
          >
            <CheckCircle className="h-4 w-4" />
            <span>Present</span>
          </button>
          
          <button
            onClick={() => toggleAttendance(student.id, 'Absent')}
            className={`py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center space-x-2 ${
              currentStatus === 'Absent'
                ? 'bg-red-500 text-white shadow-lg scale-105 border-2 border-red-600'
                : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
            }`}
          >
            <XCircle className="h-4 w-4" />
            <span>Absent</span>
          </button>
        </div>
        )}

        {/* Status Indicator */}
        <div className="mt-4 text-center">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            isHoliday ? 'bg-indigo-100 text-indigo-800' :
            currentStatus === 'Present' ? 'bg-green-100 text-green-800' :
            'bg-red-100 text-red-800'
          }`}>
            {isHoliday ? (
              <>
                <span className="text-lg mr-2">🎉</span>
                <span>Holiday</span>
              </>
            ) : (
              <>
                {getStatusIcon(currentStatus)}
                <span className="ml-2">{currentStatus}</span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 via-blue-50 to-teal-50 rounded-2xl p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Attendance Management</h2>
              <p className="text-gray-600">Interactive attendance tracking with real-time updates</p>
              <div className="mt-2 flex items-center space-x-4 text-sm">
                <span className="text-gray-600">Date: {new Date(selectedDate).toLocaleDateString()}</span>
                <span className="text-gray-600">•</span>
                <span className="text-gray-600">{filteredStudents.length} students</span>
                <span className="text-gray-600">•</span>
                <span className="text-gray-600">{attendancePercentage}% present</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col space-y-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={() => setShowReport(true)}
              className="bg-white text-blue-600 px-6 py-3 rounded-xl font-medium hover:bg-blue-50 transition-colors flex items-center shadow-sm"
            >
              <FileText className="h-5 w-5 mr-2" />
              View Reports
            </button>
          </div>
        </div>
      </div>

      {/* Batch Filter */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Batch Filter</h3>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="all">All Batches ({students.length} students)</option>
              {batches.slice(1).map(batch => {
                const count = students.filter(s => s.batch === batch).length;
                return (
                  <option key={batch} value={batch}>{batch} ({count} students)</option>
                );
              })}
            </select>
            <button
              onClick={saveAttendance}
              disabled={saving || filteredStudents.length === 0}
              className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-2 rounded-xl font-medium hover:from-green-700 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 flex items-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Save All Attendance
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="bg-green-50 rounded-xl p-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-green-600">{presentCount}</p>
              <p className="text-sm text-green-600 font-medium">Present</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-green-100 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${filteredStudents.length > 0 ? (presentCount / filteredStudents.length) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="bg-red-50 rounded-xl p-3">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-red-600">{absentCount}</p>
              <p className="text-sm text-red-600 font-medium">Absent</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-red-100 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${filteredStudents.length > 0 ? (absentCount / filteredStudents.length) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="bg-blue-50 rounded-xl p-3">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-blue-600">{attendancePercentage}%</p>
              <p className="text-sm text-blue-600 font-medium">Rate</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-blue-100 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${attendancePercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="bg-indigo-50 rounded-xl p-3">
              <Calendar className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-indigo-600">{isHoliday ? '🎉' : '📅'}</p>
              <p className="text-sm text-indigo-600 font-medium">{isHoliday ? 'Holiday' : 'Regular Day'}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className={`w-full rounded-full h-2 ${isHoliday ? 'bg-indigo-500' : 'bg-gray-200'}`}>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Attendance Grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Interactive Attendance for {new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-200">
                <input
                  type="checkbox"
                  checked={isHoliday}
                  onChange={(e) => setIsHoliday(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-indigo-900">🎉 Mark as Holiday (All Students)</span>
              </label>
              <div className="text-sm text-gray-600">
                {selectedBatch === 'all' ? 'All Batches' : selectedBatch} • {filteredStudents.length} students
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading students...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No students found for the selected batch</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStudents.map(student => (
                <AttendanceToggle key={student.id} student={student} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Color Legend */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Color Coding Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-xl border border-green-200">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-green-900">Present</p>
              <p className="text-sm text-green-700">Student attended on time</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-xl border border-red-200">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
              <XCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-red-900">Absent</p>
              <p className="text-sm text-red-700">Student did not attend</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-xl border border-indigo-200">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-indigo-900">Holiday</p>
              <p className="text-sm text-indigo-700">Special day - all present</p>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Report Modal */}
      {showReport && (
        <AttendanceReport
          onBack={() => setShowReport(false)}
        />
      )}
    </div>
  );
}