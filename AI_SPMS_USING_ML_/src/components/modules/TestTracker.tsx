import React, { useState, useEffect } from 'react';
import { FileText, Plus, TrendingUp, BarChart3, Grid, List } from 'lucide-react';
import { testService, calculateGrade, getGradeColor } from '../../services/moduleServices';
import { TestResult } from '../../types/modules';
import { Student } from '../../types';
import { ViewMode } from '../../types/modules';

interface TestTrackerProps {
  isAdmin: boolean;
  studentId?: string;
  students: Student[];
}

export default function TestTracker({ isAdmin, studentId, students }: TestTrackerProps) {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showForm, setShowForm] = useState(false);
  const [editingTest, setEditingTest] = useState<TestResult | null>(null);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTests();
  }, [studentId]);

  const loadTests = async () => {
    setLoading(true);
    try {
      const data = studentId 
        ? await testService.getByStudent(studentId)
        : await testService.getAll();
      setTests(data);
    } catch (error) {
      console.error('Error loading tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTests = selectedSubject === 'all' 
    ? tests 
    : tests.filter(test => test.subject === selectedSubject);

  const subjects = Array.from(new Set(tests.map(test => test.subject)));

  // Calculate performance metrics
  const avgPercentage = filteredTests.length > 0 
    ? (filteredTests.reduce((sum, test) => sum + test.percentage, 0) / filteredTests.length).toFixed(1)
    : '0';

  const gradeDistribution = filteredTests.reduce((acc, test) => {
    acc[test.grade] = (acc[test.grade] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const TestCard = ({ test }: { test: TestResult }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{test.subject}</h3>
          <p className="text-sm text-gray-600">{test.studentName}</p>
        </div>
        <span className={`px-3 py-1 text-sm font-bold rounded-full ${getGradeColor(test.grade)}`}>
          {test.grade}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <p><strong>Chapter:</strong> {test.chapter}</p>
        <p><strong>Test Type:</strong> {test.testType}</p>
        <p><strong>Date:</strong> {new Date(test.date).toLocaleDateString()}</p>
        <div className="flex justify-between items-center">
          <span><strong>Marks:</strong> {test.obtainedMarks}/{test.totalMarks}</span>
          <span className="text-lg font-bold text-blue-600">{test.percentage.toFixed(1)}%</span>
        </div>
        {test.remarks && <p><strong>Remarks:</strong> {test.remarks}</p>}
      </div>

      {/* Performance Indicator */}
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${
              test.percentage >= 80 ? 'bg-green-500' :
              test.percentage >= 60 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${test.percentage}%` }}
          ></div>
        </div>
      </div>

      {isAdmin && (
        <div className="flex space-x-2">
          <button
            onClick={() => setEditingTest(test)}
            className="flex-1 bg-blue-50 text-blue-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-100"
          >
            Edit
          </button>
          <button
            className="flex-1 bg-green-50 text-green-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-100"
          >
            <TrendingUp className="h-4 w-4 inline mr-1" />
            View Trend
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <FileText className="h-6 w-6 mr-2" />
            Test Tracker
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {isAdmin ? 'Manage test results and analytics' : 'View your test performance'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Test Result
            </button>
          )}
        </div>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total Tests</p>
              <p className="text-2xl font-semibold text-gray-900">{filteredTests.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Average Score</p>
              <p className="text-2xl font-semibold text-gray-900">{avgPercentage}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">A+ Grades</p>
              <p className="text-2xl font-semibold text-gray-900">{gradeDistribution['A+'] || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-orange-600 font-bold">F</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Failed Tests</p>
              <p className="text-2xl font-semibold text-gray-900">{gradeDistribution['F'] || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subject Filter */}
      <div className="flex space-x-2">
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Subjects</option>
          {subjects.map(subject => (
            <option key={subject} value={subject}>{subject}</option>
          ))}
        </select>
      </div>

      {/* Tests Display */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.map(test => (
            <TestCard key={test.id} test={test} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chapter</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTests.map(test => (
                <tr key={test.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {test.studentName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{test.subject}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{test.chapter}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {test.obtainedMarks}/{test.totalMarks} ({test.percentage.toFixed(1)}%)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getGradeColor(test.grade)}`}>
                      {test.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(test.date).toLocaleDateString()}
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setEditingTest(test)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredTests.length === 0 && !loading && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No test results found.</p>
        </div>
      )}
    </div>
  );
}