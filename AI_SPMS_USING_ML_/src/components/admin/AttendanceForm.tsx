import React, { useState, useEffect } from 'react';
import { X, Users, Clock, Calendar, CheckCircle, XCircle, Save } from 'lucide-react';
import { attendanceService } from '../../services/attendanceService';
import { Student } from '../../types';

interface AttendanceFormProps {
  students: Student[];
  onClose: () => void;
  onAttendanceAdded: () => void;
  selectedDate?: string;
}

export default function AttendanceForm({ students, onClose, onAttendanceAdded, selectedDate }: AttendanceFormProps) {
  const [date, setDate] = useState(selectedDate || new Date().toISOString().split('T')[0]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [attendanceData, setAttendanceData] = useState<Record<string, {
    status: 'Present' | 'Absent' | 'Late';
    checkInTime: string;
    remarks: string;
  }>>({});
  const [loading, setLoading] = useState(false);

  const timeSlots = ['3:00 PM - 4:30 PM', '4:30 PM - 6:00 PM', '6:00 PM - 8:00 PM'];
  const batches = ['all', ...Array.from(new Set(students.map(s => s.batch)))];

  // Filter students by selected time slot
  const filteredStudents = selectedBatch === 'all'
    ? (selectedTimeSlot ? students.filter(student => student.batch === selectedTimeSlot) : students)
    : students.filter(student => student.batch === selectedBatch);

  useEffect(() => {
    // Initialize attendance data for filtered students
    const initialData: Record<string, any> = {};
    filteredStudents.forEach(student => {
      initialData[student.id] = {
        status: 'Present',
        checkInTime: '',
        remarks: ''
      };
    });
    setAttendanceData(initialData);
  }, [selectedTimeSlot, filteredStudents.length]);

  const handleStatusChange = (studentId: string, status: 'Present' | 'Absent' | 'Late') => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  const handleCheckInTimeChange = (studentId: string, time: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        checkInTime: time
      }
    }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTimeSlot) {
      alert('Please select a time slot');
      return;
    }

    try {
      setLoading(true);
      
      // Save attendance for each student
      for (const student of filteredStudents) {
        const studentAttendance = attendanceData[student.id];
        if (studentAttendance) {
          await attendanceService.addAttendance({
            studentId: student.id,
            studentName: student.name,
            date,
            timeSlot: selectedTimeSlot,
            status: studentAttendance.status,
            checkInTime: studentAttendance.checkInTime,
            remarks: studentAttendance.remarks
          });
        }
      }
      
      onAttendanceAdded();
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Error saving attendance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Take Attendance
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Date and Batch Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Users className="h-4 w-4 mr-1" />
                Batch Filter
              </label>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Batches</option>
                {batches.slice(1).map(batch => {
                  const count = students.filter(s => s.batch === batch).length;
                  return (
                    <option key={batch} value={batch}>{batch} ({count} students)</option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Time Slot (Optional)
              </label>
              <select
                value={selectedTimeSlot}
                onChange={(e) => setSelectedTimeSlot(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Time Slots</option>
                {timeSlots.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Students List */}
          {filteredStudents.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Students {selectedBatch !== 'all' ? `in ${selectedBatch}` : ''} 
                {selectedTimeSlot ? ` - ${selectedTimeSlot}` : ''} 
                ({filteredStudents.length} students)
              </h3>
              
              {filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No students found for the selected criteria.
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredStudents.map((student) => (
                    <div key={student.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <img 
                            src="/shreeji education- zone.jpeg" 
                            alt="Student" 
                            className="h-10 w-10 rounded-full object-cover border-2 border-blue-200"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center hidden">
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
                        {/* Status Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                          <select
                            value={attendanceData[student.id]?.status || 'Present'}
                            onChange={(e) => handleStatusChange(student.id, e.target.value as any)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                            <option value="Late">Late</option>
                          </select>
                        </div>
                        
                        {/* Check-in Time */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Time</label>
                          <input
                            type="time"
                            value={attendanceData[student.id]?.checkInTime || ''}
                            onChange={(e) => handleCheckInTimeChange(student.id, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        
                        {/* Remarks */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                          <input
                            type="text"
                            value={attendanceData[student.id]?.remarks || ''}
                            onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Optional remarks"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 disabled:opacity-50"
              disabled={loading || filteredStudents.length === 0}
            >
              {loading ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}