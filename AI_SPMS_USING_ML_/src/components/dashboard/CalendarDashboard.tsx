import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Users, 
  BookOpen, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Plus,
  Eye,
  Edit,
  Save,
  X,
  Filter,
  Clock
} from 'lucide-react';
import { Student } from '../../types';
import { User } from 'firebase/auth';
import { calendarService } from '../../services/calendarService';
import { attendanceService } from '../../services/attendanceService';
import { CalendarEntry } from '../../types/calendar';
import { AttendanceRecord } from '../../types';

interface CalendarDashboardProps {
  isAdmin: boolean;
  studentId?: string;
  currentStudent?: Student | null;
  students: Student[];
  currentUser?: User | null;
}

export default function CalendarDashboard({ 
  isAdmin, 
  studentId, 
  currentStudent, 
  students, 
  currentUser 
}: CalendarDashboardProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [calendarData, setCalendarData] = useState<CalendarEntry[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [showDayModal, setShowDayModal] = useState(false);
  const [selectedDayData, setSelectedDayData] = useState<CalendarEntry[]>([]);
  const [selectedDayAttendance, setSelectedDayAttendance] = useState<AttendanceRecord[]>([]);
  const [editingEntry, setEditingEntry] = useState<CalendarEntry | null>(null);
  const [loading, setLoading] = useState(false);

  const batches = ['all', ...Array.from(new Set(students.map(s => s.batch)))];

  useEffect(() => {
    loadCalendarData();
    loadAttendanceData();
  }, [currentDate, studentId]);

  const loadCalendarData = async () => {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      
      if (studentId) {
        // Load data for specific student
        const data = await calendarService.getStudentCalendarData(studentId, year, month);
        setCalendarData(data);
      } else if (isAdmin) {
        // Load data for all students
        const data = await calendarService.getAllCalendarData(year, month);
        setCalendarData(data);
      }
    } catch (error) {
      console.error('Error loading calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceData = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const startDate = new Date(year, month, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
      
      // Get all attendance records for the month
      const allAttendance = await attendanceService.getAllAttendance();
      const monthAttendance = allAttendance.filter(record => 
        record.date >= startDate && record.date <= endDate
      );
      setAttendanceData(monthAttendance);
    } catch (error) {
      console.error('Error loading attendance data:', error);
    }
  };
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
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
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = new Date(year, month, day);
    return date.toISOString().split('T')[0];
  };

  const getDayAttendanceStatus = (day: number) => {
    const date = formatDate(day);
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Only show attendance data for current date or past dates, not future dates
    if (date > currentDate) return 'no-data';
    
    // Only show attendance data if it actually exists for this date
    const dayAttendance = attendanceData.filter(record => record.date === date);
    if (dayAttendance.length === 0) return 'no-data';
    
    // Filter by batch if selected
    const filteredAttendance = selectedBatch === 'all' 
      ? dayAttendance 
      : dayAttendance.filter(record => {
          const student = students.find(s => s.id === record.studentId);
          return student?.batch === selectedBatch;
        });
    
    if (filteredAttendance.length === 0) return 'no-data';
    
    // Check if it's a holiday
    const isHoliday = filteredAttendance.some(record => record.remarks === 'Holiday');
    if (isHoliday) return 'holiday';
    
    const presentCount = filteredAttendance.filter(record => record.status === 'Present').length;
    const absentCount = filteredAttendance.filter(record => record.status === 'Absent').length;
    
    if (absentCount > presentCount) return 'mostly-absent';
    if (presentCount === filteredAttendance.length) return 'all-present';
    return 'mixed';
  };

  const getDayStatus = (day: number) => {
    const date = formatDate(day);
    const dayEntries = calendarData.filter(entry => entry.date === date);
    
    if (dayEntries.length === 0) return 'no-data';
    
    const hasAbsent = dayEntries.some(entry => entry.attendanceStatus === 'Absent');
    const hasIncompleteHomework = dayEntries.some(entry => entry.homeworkStatus === 'incomplete');
    const hasMissingDiary = dayEntries.some(entry => entry.diaryStatus === 'not_brought');
    const hasHoliday = dayEntries.some(entry => entry.isHoliday);
    
    if (hasHoliday) return 'holiday';
    if (hasAbsent) return 'absent';
    if (hasIncompleteHomework || hasMissingDiary) return 'incomplete';
    return 'complete';
  };

  const getAttendanceStatusColor = (status: string) => {
    switch (status) {
      case 'all-present': return 'bg-green-500';
      case 'mostly-absent': return 'bg-red-500';
      case 'mixed': return 'bg-orange-500';
      case 'holiday': return 'bg-indigo-500';
      default: return 'bg-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-500';
      case 'incomplete': return 'bg-yellow-500';
      case 'absent': return 'bg-red-500';
      case 'holiday': return 'bg-indigo-500';
      default: return 'bg-gray-200';
    }
  };

  const handleDayClick = (day: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const clickedDate = new Date(year, month, day);
    const date = clickedDate.toISOString().split('T')[0];
    
    setSelectedDate(date);
    const dayData = calendarData.filter(entry => entry.date === date);
    const dayAttendance = attendanceData.filter(record => record.date === date);
    setSelectedDayData(dayData);
    setSelectedDayAttendance(dayAttendance);
    setShowDayModal(true);
  };

  const handleSaveEntry = async (entry: Partial<CalendarEntry>) => {
    try {
      if (editingEntry) {
        await calendarService.updateCalendarEntry(editingEntry.id!, entry);
      } else {
        await calendarService.addCalendarEntry({
          ...entry,
          date: selectedDate!
        } as Omit<CalendarEntry, 'id' | 'createdAt' | 'updatedAt'>);
      }
      
      await loadCalendarData();
      setEditingEntry(null);
      setShowDayModal(false);
    } catch (error) {
      console.error('Error saving calendar entry:', error);
      alert('Error saving entry. Please try again.');
    }
  };

  const CalendarDay = ({ day }: { day: number | null }) => {
    if (!day) return <div className="h-24"></div>;
    
    const date = formatDate(day);
    const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
    
    // For students, only show their own attendance data
    let dayAttendance = attendanceData.filter(record => record.date === date);
    let calendarEntries = calendarData.filter(entry => entry.date === date);
    
    if (!isAdmin && studentId) {
      // Student view - only show their own data
      dayAttendance = dayAttendance.filter(record => record.studentId === studentId);
      calendarEntries = calendarEntries.filter(entry => entry.studentId === studentId);
    } else if (isAdmin) {
      // Admin view - filter by batch if selected
      const filteredDayAttendance = selectedBatch === 'all' 
        ? dayAttendance 
        : dayAttendance.filter(record => {
            const student = students.find(s => s.id === record.studentId);
            return student?.batch === selectedBatch;
          });
      dayAttendance = filteredDayAttendance;
    }
    
    // Get status colors
    const attendanceStatus = isAdmin ? getDayAttendanceStatus(day) : 
      dayAttendance.length > 0 ? dayAttendance[0].status.toLowerCase() : 'no-data';
    const calendarStatus = getDayStatus(day);
    const attendanceColor = isAdmin ? getAttendanceStatusColor(attendanceStatus) :
      attendanceStatus === 'present' ? 'bg-green-500' :
      attendanceStatus === 'absent' ? 'bg-red-500' :
      attendanceStatus === 'late' ? 'bg-yellow-500' : 'bg-gray-200';
    const calendarColor = getStatusColor(calendarStatus);
    
    return (
      <div 
        className={`h-28 border border-gray-200 rounded-lg p-2 cursor-pointer hover:shadow-md transition-all ${
          isToday ? 'ring-2 ring-blue-500' : ''
        }`}
        onClick={() => handleDayClick(day)}
      >
        <div className="flex justify-between items-start mb-2">
          <span className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
            {day}
          </span>
          <div className="flex space-x-1">
            <div className={`w-3 h-3 rounded-full ${attendanceColor}`} title="Attendance Status"></div>
            <div className={`w-3 h-3 rounded-full ${calendarColor}`} title="Calendar Status"></div>
          </div>
        </div>
        
        {dayAttendance.length > 0 && (
          <div className="space-y-1">
            {/* Check if it's a holiday */}
            {dayAttendance.some(record => record.remarks === 'Holiday') && (
              <div className="text-xs text-center bg-indigo-100 text-indigo-800 rounded px-2 py-1 mb-2">
                🎉 Holiday
              </div>
            )}
            {!dayAttendance.some(record => record.remarks === 'Holiday') && (
              <>
                {isAdmin ? (
                  <div className="text-xs text-center text-gray-600 mb-1">
                    {dayAttendance.filter(r => r.status === 'Present').length}P / {dayAttendance.filter(r => r.status === 'Absent').length}A
                  </div>
                ) : (
                  <div className="text-xs text-center text-gray-600 mb-1">
                    {dayAttendance.length > 0 ? dayAttendance[0].status : 'No Record'}
                  </div>
                )}
                <div className="text-center">
                  <div className={`w-full h-3 rounded-full ${
                    isAdmin ? (
                      dayAttendance.filter(r => r.status === 'Present').length === dayAttendance.length ? 'bg-green-500' :
                      dayAttendance.filter(r => r.status === 'Absent').length > dayAttendance.filter(r => r.status === 'Present').length ? 'bg-red-500' :
                      'bg-orange-500'
                    ) : (
                      dayAttendance.length > 0 && dayAttendance[0].status === 'Present' ? 'bg-green-500' :
                      dayAttendance.length > 0 && dayAttendance[0].status === 'Absent' ? 'bg-red-500' :
                      'bg-gray-300'
                    )
                  }`}></div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  const DayDetailModal = () => {
    const [formData, setFormData] = useState({
      studentId: editingEntry?.studentId || (studentId || ''),
      studentName: editingEntry?.studentName || (currentStudent?.name || ''),
      attendanceStatus: editingEntry?.attendanceStatus || 'Present' as 'Present' | 'Absent' | 'Late',
      homeworkStatus: editingEntry?.homeworkStatus || null as 'completed' | 'incomplete' | null,
      diaryStatus: editingEntry?.diaryStatus || null as 'brought' | 'not_brought' | null,
      isHoliday: editingEntry?.isHoliday || false,
      notes: editingEntry?.notes || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleSaveEntry(formData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                {selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }) : 'Calendar Details'}
              </h2>
              <button
                onClick={() => {
                  setShowDayModal(false);
                  setEditingEntry(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {isAdmin ? (
              <div className="space-y-6">
                {/* Student Selection for Admin */}
                {!editingEntry && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Student to Add/Edit Record
                    </label>
                    <select
                      value={formData.studentId}
                      onChange={(e) => {
                        const student = students.find(s => s.id === e.target.value);
                        setFormData(prev => ({
                          ...prev,
                          studentId: e.target.value,
                          studentName: student?.name || ''
                        }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Student</option>
                      {students.map(student => (
                        <option key={student.id} value={student.id}>
                          {student.name} - {student.school} (Grade {student.grade})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Entry Form */}
                {(formData.studentId || editingEntry) && (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Attendance Status */}
                      <div className="bg-blue-50 rounded-xl p-4">
                        <h3 className="text-lg font-medium text-blue-900 mb-4 flex items-center">
                          <Users className="h-5 w-5 mr-2" />
                          Attendance
                        </h3>
                        <div className="space-y-2">
                          {['Present', 'Absent', 'Late'].map(status => (
                            <label key={status} className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="attendance"
                                value={status}
                                checked={formData.attendanceStatus === status}
                                onChange={(e) => setFormData(prev => ({ 
                                  ...prev, 
                                  attendanceStatus: e.target.value as any 
                                }))}
                                className="text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm font-medium text-gray-700">{status}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Homework Status */}
                      <div className="bg-green-50 rounded-xl p-4">
                        <h3 className="text-lg font-medium text-green-900 mb-4 flex items-center">
                          <BookOpen className="h-5 w-5 mr-2" />
                          Homework
                        </h3>
                        <div className="space-y-2">
                          {[
                            { value: 'completed', label: 'Completed' },
                            { value: 'incomplete', label: 'Incomplete' },
                            { value: null, label: 'Not Assigned' }
                          ].map(option => (
                            <label key={option.label} className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="homework"
                                value={option.value || ''}
                                checked={formData.homeworkStatus === option.value}
                                onChange={(e) => setFormData(prev => ({ 
                                  ...prev, 
                                  homeworkStatus: e.target.value || null as any
                                }))}
                                className="text-green-600 focus:ring-green-500"
                              />
                              <span className="text-sm font-medium text-gray-700">{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Diary Status */}
                      <div className="bg-purple-50 rounded-xl p-4">
                        <h3 className="text-lg font-medium text-purple-900 mb-4 flex items-center">
                          <FileText className="h-5 w-5 mr-2" />
                          Personal Diary
                        </h3>
                        <div className="space-y-2">
                          {[
                            { value: 'brought', label: 'Brought' },
                            { value: 'not_brought', label: 'Not Brought' },
                            { value: null, label: 'Not Required' }
                          ].map(option => (
                            <label key={option.label} className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="diary"
                                value={option.value || ''}
                                checked={formData.diaryStatus === option.value}
                                onChange={(e) => setFormData(prev => ({ 
                                  ...prev, 
                                  diaryStatus: e.target.value || null as any
                                }))}
                                className="text-purple-600 focus:ring-purple-500"
                              />
                              <span className="text-sm font-medium text-gray-700">{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Holiday and Notes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-indigo-50 rounded-xl p-4">
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={formData.isHoliday}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              isHoliday: e.target.checked 
                            }))}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-lg font-medium text-indigo-900">Mark as Holiday</span>
                        </label>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Notes (Optional)
                        </label>
                        <textarea
                          value={formData.notes}
                          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows={3}
                          placeholder="Additional notes..."
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => {
                          setShowDayModal(false);
                          setEditingEntry(null);
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 flex items-center"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {editingEntry ? 'Update Entry' : 'Save Entry'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Existing Entries for the Day */}
                {selectedDayData.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Calendar Records for {selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString() : ''}
                    </h3>
                    <div className="space-y-4">
                      {selectedDayData.map((entry) => (
                        <div key={entry.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{entry.studentName}</h4>
                              <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                                <div>
                                  <span className="text-gray-500">Attendance:</span>
                                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                    entry.attendanceStatus === 'Present' ? 'bg-green-100 text-green-800' :
                                    entry.attendanceStatus === 'Absent' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {entry.attendanceStatus}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Homework:</span>
                                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                    entry.homeworkStatus === 'completed' ? 'bg-green-100 text-green-800' :
                                    entry.homeworkStatus === 'incomplete' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {entry.homeworkStatus || 'Not Assigned'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Diary:</span>
                                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                    entry.diaryStatus === 'brought' ? 'bg-green-100 text-green-800' :
                                    entry.diaryStatus === 'not_brought' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {entry.diaryStatus === 'brought' ? 'Brought' :
                                     entry.diaryStatus === 'not_brought' ? 'Not Brought' : 'Not Required'}
                                  </span>
                                </div>
                              </div>
                              {entry.notes && (
                                <p className="text-sm text-gray-600 mt-2">{entry.notes}</p>
                              )}
                            </div>
                            <button
                              onClick={() => setEditingEntry(entry)}
                              className="ml-4 p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attendance Records for the Day */}
                {selectedDayAttendance.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {isAdmin ? 'Attendance Records' : 'My Attendance'} for {selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString() : ''}
                    </h3>
                    <div className={`grid gap-4 ${isAdmin ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                      {selectedDayAttendance
                        .filter(record => isAdmin ? 
                          (selectedBatch === 'all' || students.find(s => s.id === record.studentId)?.batch === selectedBatch) :
                          record.studentId === studentId
                        )
                        .map((record) => (
                        <div key={record.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-600">
                                  {record.studentName.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{record.studentName}</h4>
                                <p className="text-sm text-gray-500">{isAdmin ? record.timeSlot : 'My Attendance'}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {record.status === 'Present' && <CheckCircle className="h-5 w-5 text-green-600" />}
                              {record.status === 'Absent' && <XCircle className="h-5 w-5 text-red-600" />}
                              {record.status === 'Late' && <Clock className="h-5 w-5 text-yellow-600" />}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Status:</span>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                record.status === 'Present' ? 'bg-green-100 text-green-800' :
                                record.status === 'Absent' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {record.status}
                              </span>
                            </div>
                            
                            {record.checkInTime && (
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Check-in:</span>
                                <span className="text-sm font-medium text-gray-900">{record.checkInTime}</span>
                              </div>
                            )}
                            
                            {record.remarks && (
                              <div className="mt-2 p-2 bg-white rounded-lg">
                                <p className="text-xs text-gray-600">{record.remarks}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Student View - Read Only
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    My Records for {selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString() : ''}
                  </h3>
                  <p className="text-sm text-gray-500">View your daily progress and attendance</p>
                </div>

                {selectedDayData.length > 0 ? (
                  selectedDayData.map((entry) => (
                    <div key={entry.id} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 ${
                            entry.attendanceStatus === 'Present' ? 'bg-green-500' :
                            entry.attendanceStatus === 'Absent' ? 'bg-red-500' : 'bg-yellow-500'
                          }`}>
                            {entry.attendanceStatus === 'Present' ? 
                              <CheckCircle className="h-8 w-8 text-white" /> :
                              entry.attendanceStatus === 'Absent' ?
                              <XCircle className="h-8 w-8 text-white" /> :
                              <AlertCircle className="h-8 w-8 text-white" />
                            }
                          </div>
                          <h4 className="font-medium text-gray-900">Attendance</h4>
                          <p className="text-sm text-gray-600">{entry.attendanceStatus}</p>
                        </div>

                        <div className="text-center">
                          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 ${
                            entry.homeworkStatus === 'completed' ? 'bg-green-500' :
                            entry.homeworkStatus === 'incomplete' ? 'bg-red-500' : 'bg-gray-400'
                          }`}>
                            <BookOpen className="h-8 w-8 text-white" />
                          </div>
                          <h4 className="font-medium text-gray-900">Homework</h4>
                          <p className="text-sm text-gray-600">
                            {entry.homeworkStatus === 'completed' ? 'Completed' :
                             entry.homeworkStatus === 'incomplete' ? 'Incomplete' : 'Not Assigned'}
                          </p>
                        </div>

                        <div className="text-center">
                          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 ${
                            entry.diaryStatus === 'brought' ? 'bg-green-500' :
                            entry.diaryStatus === 'not_brought' ? 'bg-red-500' : 'bg-gray-400'
                          }`}>
                            <FileText className="h-8 w-8 text-white" />
                          </div>
                          <h4 className="font-medium text-gray-900">Personal Diary</h4>
                          <p className="text-sm text-gray-600">
                            {entry.diaryStatus === 'brought' ? 'Brought' :
                             entry.diaryStatus === 'not_brought' ? 'Not Brought' : 'Not Required'}
                          </p>
                        </div>
                      </div>

                      {entry.notes && (
                        <div className="mt-4 p-3 bg-white/70 rounded-lg">
                          <h5 className="font-medium text-gray-900 mb-1">Notes:</h5>
                          <p className="text-sm text-gray-700">{entry.notes}</p>
                        </div>
                      )}

                      {entry.isHoliday && (
                        <div className="mt-4 p-3 bg-indigo-100 rounded-lg">
                          <p className="text-indigo-800 font-medium text-center">🎉 Holiday</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No records found for this date.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 rounded-2xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center">
              <Calendar className="h-8 w-8 mr-3" />
              Calendar Dashboard
            </h2>
            <p className="text-gray-600 text-lg mt-2">
              {isAdmin 
                ? 'Interactive calendar with real-time attendance tracking and progress monitoring'
                : 'View your daily progress and attendance records'
              }
            </p>
          </div>
          <div className="hidden lg:block">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Calendar className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Batch Filter */}
      {isAdmin && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Filter className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Batch Filter</h3>
            </div>
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
          </div>
        </div>
      )}

      {/* Calendar Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h3 className="text-2xl font-bold text-gray-900">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <p className="font-medium text-gray-700">Attendance:</p>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>All Present</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Mostly Absent</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                  <span>Holiday</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-gray-700">Progress:</p>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Complete</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Incomplete</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                  <span>Holiday</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-medium text-gray-500 py-3 text-sm">
              {day}
            </div>
          ))}
          
          {/* Calendar Days */}
          {generateCalendarDays().map((day, index) => (
            <CalendarDay key={index} day={day} />
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">{isAdmin ? 'Present Days' : 'My Present Days'}</p>
              <p className="text-2xl font-semibold text-gray-900">
                {attendanceData.filter(record => 
                  record.status === 'Present' && (
                    isAdmin ? 
                      (selectedBatch === 'all' || students.find(s => s.id === record.studentId)?.batch === selectedBatch) :
                      record.studentId === studentId
                  )
                ).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <XCircle className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">{isAdmin ? 'Absent Days' : 'My Absent Days'}</p>
              <p className="text-2xl font-semibold text-gray-900">
                {attendanceData.filter(record => 
                  record.status === 'Absent' && (
                    isAdmin ? 
                      (selectedBatch === 'all' || students.find(s => s.id === record.studentId)?.batch === selectedBatch) :
                      record.studentId === studentId
                  )
                ).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">{isAdmin ? 'Late Days' : 'My Late Days'}</p>
              <p className="text-2xl font-semibold text-gray-900">
                {attendanceData.filter(record => 
                  record.status === 'Late' && (
                    isAdmin ? 
                      (selectedBatch === 'all' || students.find(s => s.id === record.studentId)?.batch === selectedBatch) :
                      record.studentId === studentId
                  )
                ).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">{isAdmin ? 'Attendance Rate' : 'My Attendance Rate'}</p>
              <p className="text-2xl font-semibold text-gray-900">
                {(() => {
                  const batchAttendance = isAdmin ? (
                    selectedBatch === 'all' 
                      ? attendanceData 
                      : attendanceData.filter(record => {
                          const student = students.find(s => s.id === record.studentId);
                          return student?.batch === selectedBatch;
                        })
                  ) : attendanceData.filter(record => record.studentId === studentId);
                  const presentCount = batchAttendance.filter(record => record.status === 'Present').length;
                  return batchAttendance.length > 0 ? Math.round((presentCount / batchAttendance.length) * 100) : 0;
                })()}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Batch-wise Attendance Summary - Admin Only */}
      {isAdmin && selectedBatch === 'all' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Batch-wise Attendance Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {batches.slice(1).map(batch => {
              const batchStudents = students.filter(s => s.batch === batch);
              const batchAttendance = attendanceData.filter(record => {
                const student = students.find(s => s.id === record.studentId);
                return student?.batch === batch;
              });
              const batchPresent = batchAttendance.filter(record => record.status === 'Present').length;
              const batchRate = batchAttendance.length > 0 ? Math.round((batchPresent / batchAttendance.length) * 100) : 0;
              
              return (
                <div key={batch} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">{batch}</h4>
                    <span className="text-2xl font-bold text-blue-600">{batchRate}%</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Students:</span>
                      <span className="font-medium">{batchStudents.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Present Today:</span>
                      <span className="font-medium text-green-600">{batchPresent}</span>
                    </div>
                    <div className="w-full bg-blue-100 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${batchRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Day Detail Modal */}
      {showDayModal && <DayDetailModal />}
    </div>
  );
}