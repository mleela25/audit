import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { ExamResult } from '../../services/examService';
import { Student } from '../../types';
import { TrendingUp, Users, FileText, Award } from 'lucide-react';

interface ExamAnalyticsProps {
  examResults: ExamResult[];
  students: Student[];
}

export default function ExamAnalytics({ examResults, students }: ExamAnalyticsProps) {
  const [selectedBoard, setSelectedBoard] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedExamType, setSelectedExamType] = useState('all');

  // Filter exam results based on selections
  const filteredResults = examResults.filter(result => {
    const student = students.find(s => s.id === result.studentId);
    const matchesBoard = selectedBoard === 'all' || student?.schoolType === selectedBoard;
    const matchesSubject = selectedSubject === 'all' || result.subject === selectedSubject;
    const matchesExamType = selectedExamType === 'all' || result.examType === selectedExamType;
    return matchesBoard && matchesSubject && matchesExamType;
  });

  // Calculate statistics
  const avgPercentage = filteredResults.length > 0 
    ? (filteredResults.reduce((acc, result) => acc + result.percentage, 0) / filteredResults.length).toFixed(1)
    : '0';

  const gradeDistribution = filteredResults.reduce((acc, result) => {
    acc[result.grade] = (acc[result.grade] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const gradeData = Object.entries(gradeDistribution).map(([grade, count]) => ({
    grade,
    count,
    percentage: ((count / filteredResults.length) * 100).toFixed(1)
  }));

  // Subject-wise performance
  const subjectPerformance = filteredResults.reduce((acc, result) => {
    if (!acc[result.subject]) {
      acc[result.subject] = { total: 0, count: 0 };
    }
    acc[result.subject].total += result.percentage;
    acc[result.subject].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  const subjectData = Object.entries(subjectPerformance).map(([subject, data]) => ({
    subject,
    average: (data.total / data.count).toFixed(1),
    count: data.count
  }));

  // Monthly trend
  const monthlyTrend = filteredResults.reduce((acc, result) => {
    const month = new Date(result.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    if (!acc[month]) {
      acc[month] = { total: 0, count: 0 };
    }
    acc[month].total += result.percentage;
    acc[month].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  const trendData = Object.entries(monthlyTrend).map(([month, data]) => ({
    month,
    average: (data.total / data.count).toFixed(1)
  })).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

  // Board-wise comparison
  const boardPerformance = students.reduce((acc, student) => {
    const studentResults = filteredResults.filter(r => r.studentId === student.id);
    if (studentResults.length > 0) {
      const avgPerf = studentResults.reduce((sum, r) => sum + r.percentage, 0) / studentResults.length;
      if (!acc[student.schoolType]) {
        acc[student.schoolType] = { total: 0, count: 0 };
      }
      acc[student.schoolType].total += avgPerf;
      acc[student.schoolType].count += 1;
    }
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  const boardData = Object.entries(boardPerformance).map(([board, data]) => ({
    board,
    average: (data.total / data.count).toFixed(1),
    students: data.count
  }));

  const boards = ['all', ...Array.from(new Set(students.map(s => s.schoolType)))];
  const subjects = ['all', ...Array.from(new Set(examResults.map(r => r.subject)))];
  const examTypes = ['all', ...Array.from(new Set(examResults.map(r => r.examType)))];

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={selectedBoard}
            onChange={(e) => setSelectedBoard(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Boards</option>
            {boards.slice(1).map(board => (
              <option key={board} value={board}>{board}</option>
            ))}
          </select>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Subjects</option>
            {subjects.slice(1).map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
          <select
            value={selectedExamType}
            onChange={(e) => setSelectedExamType(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Exam Types</option>
            {examTypes.slice(1).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total Exams</p>
              <p className="text-2xl font-semibold text-gray-900">{filteredResults.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Avg Performance</p>
              <p className="text-2xl font-semibold text-gray-900">{avgPercentage}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <Award className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">A+ Grades</p>
              <p className="text-2xl font-semibold text-gray-900">{gradeDistribution['A+'] || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Students Tested</p>
              <p className="text-2xl font-semibold text-gray-900">
                {new Set(filteredResults.map(r => r.studentId)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Grade Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={gradeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ grade, percentage }) => `${grade} (${percentage}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {gradeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Subject Performance */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject-wise Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={subjectData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="average" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="average" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Board Comparison */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Board-wise Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={boardData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="board" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="average" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Results Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Exam Results</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Exam Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredResults.slice(0, 10).map((result) => (
                <tr key={result.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {result.studentName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {result.subject}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {result.examType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {result.obtainedMarks}/{result.totalMarks} ({result.percentage}%)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      result.grade.startsWith('A') ? 'bg-green-100 text-green-800' :
                      result.grade.startsWith('B') ? 'bg-blue-100 text-blue-800' :
                      result.grade.startsWith('C') ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {result.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(result.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}