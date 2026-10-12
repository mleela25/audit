import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Calendar, BookOpen, Target } from 'lucide-react';

interface StudentAnalyticsProps {
  studentId?: string;
}

export default function StudentAnalytics({ studentId }: StudentAnalyticsProps) {
  const analyticsData = null; // TODO: Fetch from Firebase
  const predictionData = null; // TODO: Fetch from Firebase

  if (studentId) {
    // Individual student analytics
    const student = null; // TODO: Fetch from studentService
    const studentAnalytics = null; // TODO: Fetch from Firebase
    const studentPredictions = null; // TODO: Fetch from Firebase
    const studentProgress: any[] = []; // TODO: Fetch from Firebase


    // Prepare chart data for individual student
    const monthlyData = studentAnalytics?.monthlyProgress?.map(month => ({
      month: month.month,
      ...month.subjects
    })) || [];

    const subjectProgressData = studentAnalytics?.monthlyProgress?.[0]?.subjects ? Object.entries(studentAnalytics.monthlyProgress[0].subjects).map(([subject, data]) => ({
      subject,
      completed: data.chaptersCompleted.length,
      total: data.totalChapters,
      percentage: data.progressPercentage
    })) : [];

    const chapterTimelineData = studentProgress.map(cp => ({
      chapter: cp.chapter,
      subject: cp.subject,
      timeSpent: cp.timeSpent,
      difficulty: cp.difficulty,
      status: cp.status
    }));

    return (
      <div className="space-y-6">
        {/* Student Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <img 
                src="/shreeji education- zone.jpeg" 
                alt="Shreeji Education Zone" 
                className="h-16 w-16 rounded-full object-cover border-3 border-blue-300"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center hidden">
                <span className="text-lg font-bold text-blue-600">
                  {student?.name?.split(' ').map(n => n[0]).join('') || 'N/A'}
                </span>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{student?.name || 'Student Name'}</h2>
              <p className="text-gray-600">{student?.school || 'School'} • Class {student?.class || 'N/A'}</p>
              <p className="text-sm text-gray-500">{student?.schoolType || 'N/A'} • {student?.examPattern || 'N/A'} Pattern</p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Chapters Completed</p>
                <p className="text-xl font-semibold text-gray-900">{studentProgress.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Avg Time/Chapter</p>
                <p className="text-xl font-semibold text-gray-900">
                  {Math.round(studentProgress.reduce((acc, cp) => acc + cp.timeSpent, 0) / studentProgress.length)}h
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Avg Difficulty</p>
                <p className="text-xl font-semibold text-gray-900">
                  {(studentProgress.reduce((acc, cp) => acc + cp.difficulty, 0) / studentProgress.length).toFixed(1)}/5
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Next Exam</p>
                <p className="text-xl font-semibold text-gray-900">Jan 15</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Subject Progress */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject-wise Progress</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subjectProgressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="percentage" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Chapter Timeline */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Chapter Completion Timeline</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chapterTimelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="chapter" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="timeSpent" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Predictions */}
        {studentPredictions && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Exam Predictions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studentPredictions.examPredictions.map((prediction, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">{prediction.examType}</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Predicted Date:</strong> {new Date(prediction.predictedDate).toLocaleDateString()}</p>
                    <p><strong>Chapters:</strong> {prediction.chaptersIncluded.join(', ')}</p>
                    <p><strong>Prep Time:</strong> {prediction.preparationTime} days</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Overall analytics for all students
  const overallData: any[] = []; // TODO: Fetch from Firebase

  const schoolWiseData: any[] = []; // TODO: Fetch from Firebase

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Overall Analytics</h2>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">
          <strong>Note:</strong> Analytics will be fully functional once real student data is integrated from Firebase.
        </p>
      </div>

      {/* School Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">School-wise Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={schoolWiseData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ school, percent }) => `${school} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="students"
              >
                {schoolWiseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`hsl(${index * 72}, 70%, 50%)`} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Student Performance Comparison */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={overallData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="chaptersCompleted" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Student Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Student Performance Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  School
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chapters Completed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Time/Chapter
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Difficulty
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {overallData.map((student, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.school}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.chaptersCompleted}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.avgTimePerChapter}h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.avgDifficulty}/5
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