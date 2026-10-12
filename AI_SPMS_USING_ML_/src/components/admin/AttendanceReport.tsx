import React, { useState, useEffect } from 'react';
import {
  Calendar, Download, Users, TrendingUp, Clock,
  CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import { getAttendanceReport, exportAttendanceReport } from '../../services/attendanceService';
import { studentService } from '../../services/studentService';
import { Student } from '../../types';

interface AttendanceReportProps {
  onBack: () => void;
}

interface StudentAttendanceReport {
  student: Student;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  percentage: number;
}

const AttendanceReport: React.FC<AttendanceReportProps> = ({ onBack }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('all');
  const [reportData, setReportData] = useState<StudentAttendanceReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);

  const timeSlots = [
    { value: 'all', label: 'All Time Slots' },
    { value: '3:00 PM - 4:30 PM', label: '3:00 PM - 4:30 PM' },
    { value: '4:30 PM - 6:00 PM', label: '4:30 PM - 6:00 PM' },
    { value: '6:00 PM - 8:00 PM', label: '6:00 PM - 8:00 PM' }
  ];

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const overallStats = {
    totalStudents: reportData.length,
    averageAttendance:
      reportData.length > 0
        ? Math.round(reportData.reduce((sum, r) => sum + r.percentage, 0) / reportData.length)
        : 0,
    excellentPerformers: reportData.filter(r => r.percentage >= 90).length,
    poorPerformers: reportData.filter(r => r.percentage < 75).length
  };

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    if (students.length > 0) {
      generateReport();
    }
  }, [selectedMonth, selectedYear, selectedTimeSlot, students]);

  const loadStudents = async () => {
    try {
      const studentsData = await studentService.getAllStudents();
      setStudents(studentsData);
    } catch (error) {
      console.error('Error loading students:', error);
      // If there's a permission error, show empty state but don't crash
      setStudents([]);
      setReportData([]);
    }
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      const filteredStudents = selectedTimeSlot === 'all'
        ? students
        : students.filter(student => student.timeSlot === selectedTimeSlot);

      const reports: StudentAttendanceReport[] = [];

      for (const student of filteredStudents) {
        try {
          const attendanceRecords = await getAttendanceReport(
            student.id,
            selectedMonth,
            selectedYear
          );

          const totalDays = getDaysInMonth(selectedMonth, selectedYear);
          const presentDays = attendanceRecords.filter(r => r.status === 'present').length;
          const absentDays = attendanceRecords.filter(r => r.status === 'absent').length;
          const lateDays = attendanceRecords.filter(r => r.status === 'late').length;

          const percentage = Math.round((presentDays / totalDays) * 100);

          reports.push({
            student,
            totalDays,
            presentDays,
            absentDays,
            lateDays,
            percentage
          });
        } catch (error) {
          console.error(`Error getting attendance for student ${student.name}:`, error);
          // Add student with zero attendance if query fails
          const totalDays = getDaysInMonth(selectedMonth, selectedYear);
          reports.push({
            student,
            totalDays,
            presentDays: 0,
            absentDays: 0,
            lateDays: 0,
            percentage: 0
          });
        }
      }

      setReportData(reports);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    exportAttendanceReport(reportData);
  };

  const getDaysInMonth = (month: number, year: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getPerformanceLabel = (percentage: number): string => {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 75) return 'Good';
    return 'Poor';
  };

  const getPerformanceColor = (percentage: number): string => {
    if (percentage >= 90) return 'bg-green-100 text-green-800';
    if (percentage >= 75) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ←
          </button>
          <div className="flex items-center space-x-2">
            <img 
              src="https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&fit=crop&crop=face" 
              alt="Shreeji Education Zone" 
              className="w-8 h-8 rounded-full border-2 border-blue-500"
            />
            <h1 className="text-2xl font-bold text-gray-900">Attendance Report</h1>
          </div>
        </div>
        <button
          onClick={handleExportReport}
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Slot</label>
            <select
              value={selectedTimeSlot}
              onChange={(e) => setSelectedTimeSlot(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {timeSlots.map(slot => (
                <option key={slot.value} value={slot.value}>{slot.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{overallStats.totalStudents}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Attendance</p>
              <p className="text-2xl font-bold text-gray-900">{overallStats.averageAttendance}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Excellent (≥90%)</p>
              <p className="text-2xl font-bold text-green-600">{overallStats.excellentPerformers}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Poor (&lt;75%)</p>
              <p className="text-2xl font-bold text-red-600">{overallStats.poorPerformers}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Report Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {months[selectedMonth]} {selectedYear} - {selectedTimeSlot === 'all' ? 'All Time Slots' : selectedTimeSlot}
          </h3>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Generating report...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Slot</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Present</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Absent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Late</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance %</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.map((report) => (
                  <tr key={report.student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img src="https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&fit=crop&crop=face"
                          alt="Logo" className="w-8 h-8 rounded-full border border-blue-500 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{report.student.name}</div>
                          <div className="text-sm text-gray-500">{report.student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{report.student.timeSlot}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{report.presentDays}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{report.absentDays}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{report.lateDays}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{report.percentage}%</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPerformanceColor(report.percentage)}`}>
                        {getPerformanceLabel(report.percentage)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && reportData.length === 0 && (
          <div className="p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {students.length === 0 
                ? "Unable to load student data. Please check your Firebase permissions or contact administrator."
                : "No attendance data found for the selected period."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceReport;
