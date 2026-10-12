import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ScatterChart, Scatter } from 'recharts';
import { Calendar, TrendingUp, Target, Clock } from 'lucide-react';

interface StudentProgressProps {
  studentId: string;
}

export default function StudentProgress({ studentId }: StudentProgressProps) {
  const [selectedSubject, setSelectedSubject] = useState('all');
  
  const student = null; // TODO: Fetch from Firebase
  const studentProgress: any[] = []; // TODO: Fetch from Firebase
  const analyticsData = null; // TODO: Fetch from Firebase
  const predictionData = null; // TODO: Fetch from Firebase

  if (!student) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Student data not available. Please ensure the student exists in the database.</p>
      </div>
    );
  }

  // Filter progress by subject if selected
  const filteredProgress = selectedSubject === 'all' 
    ? studentProgress 
    : studentProgress.filter(cp => cp.subject === selectedSubject);

  // Prepare data for chapter completion timeline
  const timelineData = filteredProgress.map(cp => ({
    chapter: cp.chapter,
    subject: cp.subject,
    timeSpent: cp.timeSpent,
    difficulty: cp.difficulty,
    completedDate: cp.completedDate,
    month: cp.completedDate ? new Date(cp.completedDate).toLocaleDateString('en-US', { month: 'short' }) : 'Pending'
  }));

  // Monthly progress data for line chart
  const monthlyProgressData = analyticsData?.monthlyProgress?.map(month => {
    const subjectData = selectedSubject === 'all' 
      ? Object.values(month.subjects).reduce((acc, subject) => acc + subject.chaptersCompleted.length, 0)
      : month.subjects[selectedSubject]?.chaptersCompleted.length || 0;
    
    return {
      month: month.month,
      chaptersCompleted: subjectData,
      totalChapters: selectedSubject === 'all' 
        ? Object.values(month.subjects).reduce((acc, subject) => acc + subject.totalChapters, 0)
        : month.subjects[selectedSubject]?.totalChapters || 0
    };
  }) || [];

  // Subject-wise performance data
  const subjectPerformanceData = analyticsData?.monthlyProgress?.[0]?.subjects ? Object.entries(analyticsData.monthlyProgress[0].subjects).map(([subject, data]) => ({
    subject,
    completed: data.chaptersCompleted.length,
    total: data.totalChapters,
    percentage: data.progressPercentage,
    avgTime: filteredProgress.filter(cp => cp.subject === subject).reduce((acc, cp) => acc + cp.timeSpent, 0) / 
             Math.max(filteredProgress.filter(cp => cp.subject === subject).length, 1)
  })) : [];

  // Difficulty vs Time analysis
  const difficultyTimeData = filteredProgress.map(cp => ({
    difficulty: cp.difficulty,
    timeSpent: cp.timeSpent,
    chapter: cp.chapter,
    subject: cp.subject
  }));

  // Prediction timeline
  const predictionTimeline = predictionData?.estimatedCompletionDates.map(pred => ({
    chapter: pred.chapter,
    date: pred.date,
    month: new Date(pred.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header with Subject Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Progress Analytics</h2>
          <p className="text-sm text-gray-500 mt-1">Track your learning journey and predictions</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Subjects</option>
            {student?.subjects?.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            )) || null}
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Chapters Completed</p>
              <p className="text-xl font-semibold text-gray-900">{filteredProgress.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total Study Time</p>
              <p className="text-xl font-semibold text-gray-900">
                {Math.round(filteredProgress.reduce((acc, cp) => acc + cp.timeSpent, 0))}h
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Avg Difficulty</p>
              <p className="text-xl font-semibold text-gray-900">
                {filteredProgress.length > 0 
                  ? (filteredProgress.reduce((acc, cp) => acc + cp.difficulty, 0) / filteredProgress.length).toFixed(1)
                  : '0'}/5
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Avg Time/Chapter</p>
              <p className="text-xl font-semibold text-gray-900">
                {filteredProgress.length > 0 
                  ? Math.round(filteredProgress.reduce((acc, cp) => acc + cp.timeSpent, 0) / filteredProgress.length)
                  : '0'}h
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Progress Trend */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Progress Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyProgressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="chaptersCompleted" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Subject Performance */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject-wise Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={subjectPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="percentage" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chapter Timeline */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Chapter Completion Timeline</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value, name, props) => [
                  `${value}h`, 
                  `${props.payload.chapter} (${props.payload.subject})`
                ]}
              />
              <Bar dataKey="timeSpent" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Difficulty vs Time Analysis */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Difficulty vs Time Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={difficultyTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="difficulty" domain={[1, 5]} />
              <YAxis dataKey="timeSpent" />
              <Tooltip 
                formatter={(value, name, props) => [
                  name === 'timeSpent' ? `${value}h` : value,
                  props.payload.chapter
                ]}
              />
              <Scatter dataKey="timeSpent" fill="#8B5CF6" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Predictions Section */}
      {predictionData && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Chapter Completion Predictions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Upcoming Chapters</h4>
              <div className="space-y-3">
                {predictionData.estimatedCompletionDates.map((prediction, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium text-blue-900">{prediction.chapter}</span>
                    <span className="text-sm text-blue-700">
                      {new Date(prediction.date).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Exam Predictions</h4>
              <div className="space-y-3">
                {predictionData.examPredictions.map((exam, index) => (
                  <div key={index} className="p-3 bg-orange-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-orange-900">{exam.examType}</span>
                      <span className="text-sm text-orange-700">
                        {new Date(exam.predictedDate).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-orange-700">
                      Prep time: {exam.preparationTime} days
                    </p>
                    <p className="text-xs text-orange-600 mt-1">
                      Chapters: {exam.chaptersIncluded.join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Progress Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Chapter Progress Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chapter
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time Spent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Difficulty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completed Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProgress.map((progress) => (
                <tr key={progress.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {progress.chapter}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {progress.subject}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {progress.timeSpent}h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      progress.difficulty <= 2 ? 'bg-green-100 text-green-800' :
                      progress.difficulty <= 3 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {progress.difficulty}/5
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {progress.completedDate ? new Date(progress.completedDate).toLocaleDateString() : 'In Progress'}
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