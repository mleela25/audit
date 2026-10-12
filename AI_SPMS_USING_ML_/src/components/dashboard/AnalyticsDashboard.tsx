import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Target, Filter, Search, Calendar, Award, FileText } from 'lucide-react';
import { Student } from '../../types';
import { User } from 'firebase/auth';
import { 
  tuitionWorkService, 
  testTrackerService, 
  schoolClassworkService,
  doubtBoxService,
  cambridgePaperService 
} from '../../services/moduleServices';
import { 
  TuitionWorkEntry, 
  TestTrackerEntry, 
  SchoolClassworkHomework,
  DoubtBoxEntry,
  CambridgePaperEntry 
} from '../../types/modules';

interface AnalyticsDashboardProps {
  isAdmin: boolean;
  studentId?: string;
  students: Student[];
  currentUser?: User | null;
}

export default function AnalyticsDashboard({ students, currentUser }: AnalyticsDashboardProps) {
  const [selectedStudent, setSelectedStudent] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('3months');
  const [loading, setLoading] = useState(false);
  
  // Data states
  const [tuitionData, setTuitionData] = useState<TuitionWorkEntry[]>([]);
  const [testData, setTestData] = useState<TestTrackerEntry[]>([]);
  const [schoolworkData, setSchoolworkData] = useState<SchoolClassworkHomework[]>([]);
  const [doubtsData, setDoubtsData] = useState<DoubtBoxEntry[]>([]);
  const [cambridgeData, setCambridgeData] = useState<CambridgePaperEntry[]>([]);

  useEffect(() => {
    if (currentUser) {
      loadAnalyticsData();
    }
  }, [currentUser, selectedStudent, selectedSubject, selectedTimeframe]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const [tuition, tests, schoolwork, doubts, cambridge] = await Promise.all([
        selectedStudent === 'all' ? tuitionWorkService.getAll() : tuitionWorkService.getByStudent(selectedStudent),
        selectedStudent === 'all' ? testTrackerService.getAll() : testTrackerService.getByStudent(selectedStudent),
        selectedStudent === 'all' ? schoolClassworkService.getAll() : schoolClassworkService.getByStudent(selectedStudent),
        selectedStudent === 'all' ? doubtBoxService.getAll() : doubtBoxService.getByStudent(selectedStudent),
        selectedStudent === 'all' ? cambridgePaperService.getAll() : cambridgePaperService.getByStudent(selectedStudent)
      ]);

      setTuitionData(tuition);
      setTestData(tests);
      setSchoolworkData(schoolwork);
      setDoubtsData(doubts);
      setCambridgeData(cambridge);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter data by subject and timeframe
  const filterDataByTimeframe = (data: any[]) => {
    const now = new Date();
    const timeframeMap = {
      '1month': 30,
      '3months': 90,
      '6months': 180,
      '1year': 365
    };
    const days = timeframeMap[selectedTimeframe as keyof typeof timeframeMap] || 90;
    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    return data.filter(item => {
      const itemDate = new Date(item.date || item.createdAt);
      const matchesTimeframe = itemDate >= cutoffDate;
      const matchesSubject = selectedSubject === 'all' || item.subject === selectedSubject;
      return matchesTimeframe && matchesSubject;
    });
  };

  const filteredTuitionData = filterDataByTimeframe(tuitionData);
  const filteredTestData = filterDataByTimeframe(testData);
  const filteredSchoolworkData = filterDataByTimeframe(schoolworkData);
  const filteredDoubtsData = filterDataByTimeframe(doubtsData);
  const filteredCambridgeData = filterDataByTimeframe(cambridgeData);

  // Calculate analytics
  const analytics = {
    totalSessions: filteredTuitionData.length,
    completedSessions: filteredTuitionData.filter(t => t.status === 'Completed').length,
    averageTestScore: filteredTestData.length > 0 
      ? (filteredTestData.reduce((sum, test) => sum + test.percentage, 0) / filteredTestData.length).toFixed(1)
      : '0',
    totalTests: filteredTestData.length,
    schoolworkCompleted: filteredSchoolworkData.filter(s => s.status === 'Done').length,
    totalSchoolwork: filteredSchoolworkData.length,
    doubtsResolved: filteredDoubtsData.filter(d => d.resolved).length,
    totalDoubts: filteredDoubtsData.length,
    cambridgePapersCompleted: filteredCambridgeData.filter(c => c.status === 'Feedback Given').length,
    totalCambridgePapers: filteredCambridgeData.length
  };

  // Get unique subjects
  const allSubjects = Array.from(new Set([
    ...filteredTuitionData.map(t => t.subject),
    ...filteredTestData.map(t => t.subject),
    ...filteredSchoolworkData.map(s => s.subject),
    ...filteredDoubtsData.map(d => d.subject),
    ...filteredCambridgeData.map(c => c.subject)
  ]));

  // Subject-wise performance
  const subjectPerformance = allSubjects.map(subject => {
    const subjectTests = filteredTestData.filter(t => t.subject === subject);
    const subjectTuition = filteredTuitionData.filter(t => t.subject === subject);
    const subjectSchoolwork = filteredSchoolworkData.filter(s => s.subject === subject);
    
    return {
      subject,
      avgTestScore: subjectTests.length > 0 
        ? (subjectTests.reduce((sum, test) => sum + test.percentage, 0) / subjectTests.length).toFixed(1)
        : '0',
      tuitionSessions: subjectTuition.length,
      schoolworkCompletion: subjectSchoolwork.length > 0 
        ? ((subjectSchoolwork.filter(s => s.status === 'Done').length / subjectSchoolwork.length) * 100).toFixed(1)
        : '0'
    };
  });

  // Student performance comparison (if viewing all students)
  const studentPerformance = selectedStudent === 'all' ? students.map(student => {
    const studentTests = filteredTestData.filter(t => t.studentId === student.id);
    const studentTuition = filteredTuitionData.filter(t => t.studentId === student.id);
    const studentSchoolwork = filteredSchoolworkData.filter(s => s.studentId === student.id);
    
    return {
      studentName: student.name,
      school: student.school,
      grade: student.grade,
      avgTestScore: studentTests.length > 0 
        ? (studentTests.reduce((sum, test) => sum + test.percentage, 0) / studentTests.length).toFixed(1)
        : '0',
      totalSessions: studentTuition.length,
      schoolworkCompletion: studentSchoolwork.length > 0 
        ? ((studentSchoolwork.filter(s => s.status === 'Done').length / studentSchoolwork.length) * 100).toFixed(1)
        : '0'
    };
  }) : [];

  return (
    <div className="space-y-6">
      {/* Header with Smart Filters */}
      <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 rounded-2xl p-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h2>
            <p className="text-gray-600 text-lg">Comprehensive performance insights and trends</p>
          </div>
        </div>
        
        {/* Smart Filters */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Student Filter</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
            >
              <option value="all">All Students</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.name} - Grade {student.grade}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject Filter</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="all">All Subjects</option>
              {allSubjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timeframe</label>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="1month">Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={loadAnalyticsData}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Apply Filters'}
            </button>
          </div>
        </div>
      </div>

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div className="bg-blue-50 rounded-xl p-3">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{analytics.totalSessions}</p>
              <p className="text-sm text-blue-600 font-medium">Sessions</p>
            </div>
          </div>
          <p className="text-sm font-medium text-gray-600 mt-4">Tuition Sessions</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div className="bg-green-50 rounded-xl p-3">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{analytics.averageTestScore}%</p>
              <p className="text-sm text-green-600 font-medium">{analytics.totalTests} tests</p>
            </div>
          </div>
          <p className="text-sm font-medium text-gray-600 mt-4">Avg Test Score</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div className="bg-orange-50 rounded-xl p-3">
              <Target className="h-6 w-6 text-orange-600" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{analytics.schoolworkCompleted}</p>
              <p className="text-sm text-orange-600 font-medium">of {analytics.totalSchoolwork}</p>
            </div>
          </div>
          <p className="text-sm font-medium text-gray-600 mt-4">Schoolwork Done</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div className="bg-purple-50 rounded-xl p-3">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{analytics.doubtsResolved}</p>
              <p className="text-sm text-purple-600 font-medium">of {analytics.totalDoubts}</p>
            </div>
          </div>
          <p className="text-sm font-medium text-gray-600 mt-4">Doubts Resolved</p>
        </div>
      </div>

      {/* Subject-wise Performance */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Subject-wise Performance Analysis</h3>
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="mt-2 text-gray-600">Loading analytics...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjectPerformance.map((subject, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">{subject.subject}</h4>
                  <div className={`w-3 h-3 rounded-full ${
                    parseFloat(subject.avgTestScore) >= 80 ? 'bg-green-500' :
                    parseFloat(subject.avgTestScore) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg Test Score:</span>
                    <span className="font-medium">{subject.avgTestScore}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tuition Sessions:</span>
                    <span className="font-medium">{subject.tuitionSessions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Schoolwork:</span>
                    <span className="font-medium">{subject.schoolworkCompletion}%</span>
                  </div>
                </div>
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      parseFloat(subject.avgTestScore) >= 80 ? 'bg-green-500' :
                      parseFloat(subject.avgTestScore) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(parseFloat(subject.avgTestScore), 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Student Performance Comparison (when viewing all students) */}
      {selectedStudent === 'all' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Student Performance Comparison</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Test Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tuition Sessions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schoolwork %</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {studentPerformance.map((student, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-600">
                            {student.studentName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{student.studentName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.school}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                        {student.grade}th
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.avgTestScore}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.totalSessions}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.schoolworkCompletion}%</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        parseFloat(student.avgTestScore) >= 80 ? 'bg-green-100 text-green-800' :
                        parseFloat(student.avgTestScore) >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {parseFloat(student.avgTestScore) >= 80 ? 'Excellent' :
                         parseFloat(student.avgTestScore) >= 60 ? 'Good' : 'Needs Improvement'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Module Activity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Module Activity Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">🟢</span>
                </div>
                <span className="ml-3 font-medium text-gray-900">Tuition Work</span>
              </div>
              <span className="text-lg font-bold text-green-600">{analytics.completedSessions}/{analytics.totalSessions}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">🏫</span>
                </div>
                <span className="ml-3 font-medium text-gray-900">Schoolwork</span>
              </div>
              <span className="text-lg font-bold text-blue-600">{analytics.schoolworkCompleted}/{analytics.totalSchoolwork}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">❓</span>
                </div>
                <span className="ml-3 font-medium text-gray-900">Doubts</span>
              </div>
              <span className="text-lg font-bold text-purple-600">{analytics.doubtsResolved}/{analytics.totalDoubts}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">📘</span>
                </div>
                <span className="ml-3 font-medium text-gray-900">Cambridge Papers</span>
              </div>
              <span className="text-lg font-bold text-yellow-600">{analytics.cambridgePapersCompleted}/{analytics.totalCambridgePapers}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Performance Insights</h3>
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl">
              <h4 className="font-medium text-gray-900 mb-2">🎯 Top Performing Subject</h4>
              <p className="text-sm text-gray-600">
                {subjectPerformance.length > 0 
                  ? subjectPerformance.reduce((prev, current) => 
                      parseFloat(prev.avgTestScore) > parseFloat(current.avgTestScore) ? prev : current
                    ).subject
                  : 'No data available'
                }
              </p>
            </div>
            <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
              <h4 className="font-medium text-gray-900 mb-2">📈 Needs Attention</h4>
              <p className="text-sm text-gray-600">
                {subjectPerformance.length > 0 
                  ? subjectPerformance.reduce((prev, current) => 
                      parseFloat(prev.avgTestScore) < parseFloat(current.avgTestScore) ? prev : current
                    ).subject
                  : 'No data available'
                }
              </p>
            </div>
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
              <h4 className="font-medium text-gray-900 mb-2">📊 Overall Progress</h4>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(parseFloat(analytics.averageTestScore), 100)}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{analytics.averageTestScore}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}