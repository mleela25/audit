import React, { useState, useEffect } from 'react';
import { Calendar, Users, CheckCircle, XCircle, BookOpen, FileText, Save } from 'lucide-react';
import { dailyProgressService } from '../../services/dailyProgressService';
import { studentService } from '../../services/studentService';
import { Student, DailyProgress } from '../../types';

export default function DailyProgressTracker() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<Student[]>([]);
  const [dailyProgress, setDailyProgress] = useState<DailyProgress[]>([]);
  const [progressData, setProgressData] = useState<Record<string, {
    homeworkStatus: 'completed' | 'incomplete' | null;
    diaryStatus: 'brought' | 'not_brought' | null;
    isHoliday: boolean;
  }>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    loadStudents();
    loadDailyProgress();
  }, []);

  useEffect(() => {
    loadProgressForDate();
  }, [selectedDate, students]);

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

  const loadDailyProgress = async () => {
    try {
      const progressData = await dailyProgressService.getAllDailyProgress();
      setDailyProgress(progressData);
    } catch (error) {
      console.error('Error loading daily progress:', error);
    }
  };

  const loadProgressForDate = async () => {
    try {
      const progressForDate = await dailyProgressService.getDailyProgressByDate(selectedDate);
      const progressMap: Record<string, any> = {};
      
      students.forEach(student => {
        const existingProgress = progressForDate.find(p => p.studentId === student.id);
        progressMap[student.id] = {
          homeworkStatus: existingProgress?.homeworkStatus || null,
          diaryStatus: existingProgress?.diaryStatus || null,
          isHoliday: existingProgress?.isHoliday || false
        };
      });
      
      setProgressData(progressMap);
    } catch (error) {
      console.error('Error loading progress for date:', error);
    }
  };

  const updateStudentProgress = (studentId: string, field: string, value: any) => {
    setProgressData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: prev[studentId]?.[field] === value ? null : value
      }
    }));
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      
      const updates = students.map(student => ({
        studentId: student.id,
        studentName: student.name,
        homeworkStatus: progressData[student.id]?.homeworkStatus || null,
        diaryStatus: progressData[student.id]?.diaryStatus || null,
        isHoliday: progressData[student.id]?.isHoliday || false
      }));

      await dailyProgressService.bulkUpdateDailyProgress(selectedDate, updates);
      await loadDailyProgress();
      
      alert('Daily progress updated successfully!');
    } catch (error) {
      console.error('Error saving daily progress:', error);
      alert('Error saving daily progress. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (student: Student, date: string) => {
    const progress = dailyProgress.find(p => p.studentId === student.id && p.date === date);
    if (!progress) return 'bg-gray-200';
    
    if (progress.isHoliday) return 'bg-indigo-500';
    
    const homeworkComplete = progress.homeworkStatus === 'completed';
    const diaryBrought = progress.diaryStatus === 'brought';
    
    if (homeworkComplete && diaryBrought) return 'bg-green-500';
    if (!homeworkComplete && diaryBrought) return 'bg-yellow-500';
    if (homeworkComplete && !diaryBrought) return 'bg-purple-500';
    return 'bg-red-500';
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const formatDate = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    return new Date(year, month, day).toISOString().split('T')[0];
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Calendar className="h-6 w-6 mr-2" />
            Daily Progress Tracker
          </h2>
          <p className="text-sm text-gray-500 mt-1">Track homework completion and diary status</p>
        </div>
      </div>

      {/* Calendar View */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
            >
              ← Previous
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
            >
              Next →
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>All Complete</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span>Homework Incomplete</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span>Diary Not Brought</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-indigo-500 rounded"></div>
            <span>Holiday</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 mb-6">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
          
          {generateCalendarDays().map((day, index) => (
            <div key={index} className="min-h-[100px] border border-gray-200 rounded-lg p-2">
              {day && (
                <>
                  <div className="text-sm font-medium text-gray-900 mb-2">{day}</div>
                  <div className="space-y-1">
                    {students.slice(0, 3).map(student => {
                      const date = formatDate(day);
                      const color = getStatusColor(student, date);
                      return (
                        <div
                          key={student.id}
                          className={`w-full h-2 rounded ${color}`}
                          title={`${student.name} - ${date}`}
                        ></div>
                      );
                    })}
                    {students.length > 3 && (
                      <div className="text-xs text-gray-500">+{students.length - 3} more</div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Date Selection and Management Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Manage Daily Records</h3>
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Select Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading students...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {students.map(student => (
              <div key={student.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{student.name}</h4>
                      <p className="text-sm text-gray-500">{student.school} • Grade {student.grade}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Homework Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <BookOpen className="inline h-4 w-4 mr-1" />
                      Homework
                    </label>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => updateStudentProgress(student.id, 'homeworkStatus', 'completed')}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          progressData[student.id]?.homeworkStatus === 'completed'
                            ? 'bg-green-100 text-green-800 border-2 border-green-500'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <CheckCircle className="inline h-4 w-4 mr-1" />
                        Complete
                      </button>
                      <button
                        onClick={() => updateStudentProgress(student.id, 'homeworkStatus', 'incomplete')}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          progressData[student.id]?.homeworkStatus === 'incomplete'
                            ? 'bg-red-100 text-red-800 border-2 border-red-500'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <XCircle className="inline h-4 w-4 mr-1" />
                        Incomplete
                      </button>
                    </div>
                  </div>

                  {/* Diary Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FileText className="inline h-4 w-4 mr-1" />
                      Personal Diary
                    </label>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => updateStudentProgress(student.id, 'diaryStatus', 'brought')}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          progressData[student.id]?.diaryStatus === 'brought'
                            ? 'bg-green-100 text-green-800 border-2 border-green-500'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <CheckCircle className="inline h-4 w-4 mr-1" />
                        Brought
                      </button>
                      <button
                        onClick={() => updateStudentProgress(student.id, 'diaryStatus', 'not_brought')}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          progressData[student.id]?.diaryStatus === 'not_brought'
                            ? 'bg-red-100 text-red-800 border-2 border-red-500'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <XCircle className="inline h-4 w-4 mr-1" />
                        Not Brought
                      </button>
                    </div>
                  </div>

                  {/* Holiday Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Status
                    </label>
                    <button
                      onClick={() => updateStudentProgress(student.id, 'isHoliday', true)}
                      className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        progressData[student.id]?.isHoliday
                          ? 'bg-indigo-100 text-indigo-800 border-2 border-indigo-500'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Mark as Holiday
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Submit All Records'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}