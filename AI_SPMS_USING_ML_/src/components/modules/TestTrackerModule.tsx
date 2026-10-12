import React, { useState, useEffect } from 'react';
import { FileText, Plus, TrendingUp, BarChart3, Grid, List } from 'lucide-react';
import { testTrackerService, calculateGrade, getGradeColor } from '../../services/moduleServices';
import { TestTrackerEntry } from '../../types/modules';
import { Student } from '../../types';
import { ViewMode } from '../../types/modules';
import TestTrackerForm from '../forms/TestTrackerForm';

interface TestTrackerModuleProps {
  isAdmin: boolean;
  studentId?: string;
  students: Student[];
}

export default function TestTrackerModule({ isAdmin, studentId, students }: TestTrackerModuleProps) {
  const [entries, setEntries] = useState<TestTrackerEntry[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TestTrackerEntry | null>(null);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEntries();
  }, [studentId]);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const data = studentId 
        ? await testTrackerService.getByStudent(studentId)
        : await testTrackerService.getAll();
      setEntries(data);
    } catch (error) {
      console.error('Error loading test tracker entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = selectedSubject === 'all' 
    ? entries 
    : entries.filter(entry => entry.subject === selectedSubject);

  const subjects = Array.from(new Set(entries.map(entry => entry.subject)));

  // Calculate performance metrics
  const avgPercentage = filteredEntries.length > 0 
    ? (filteredEntries.reduce((sum, entry) => sum + entry.percentage, 0) / filteredEntries.length).toFixed(1)
    : '0';

  const handleFormClose = () => {
    setShowForm(false);
    setEditingEntry(null);
  };

  const handleEntryAdded = () => {
    loadEntries();
    handleFormClose();
  };

  const EntryCard = ({ entry }: { entry: TestTrackerEntry }) => {
    const grade = calculateGrade(entry.percentage);
    
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{entry.subject}</h3>
            <p className="text-sm text-gray-600">{entry.studentName}</p>
          </div>
          <span className={`px-3 py-1 text-sm font-bold rounded-full ${getGradeColor(grade)}`}>
            {grade}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <p><strong>Date:</strong> {new Date(entry.date).toLocaleDateString()}</p>
          <p><strong>Chapter:</strong> {entry.chapter}</p>
          <p><strong>Test Type:</strong> {entry.testType}</p>
          <p><strong>Syllabus:</strong> {entry.syllabus}</p>
          <div className="flex justify-between items-center">
            <span><strong>Marks:</strong> {entry.marksScored}/{entry.totalMarks}</span>
            <span className="text-lg font-bold text-blue-600">{entry.percentage.toFixed(1)}%</span>
          </div>
          <p><strong>Performance Trend:</strong> {entry.performanceTrend}</p>
          {entry.remarks && <p><strong>Remarks:</strong> {entry.remarks}</p>}
        </div>

        {/* Performance Indicator */}
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                entry.percentage >= 80 ? 'bg-green-500' :
                entry.percentage >= 60 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ width: `${entry.percentage}%` }}
            ></div>
          </div>
        </div>

        {isAdmin && (
          <div className="flex space-x-2">
            <button
              onClick={() => setEditingEntry(entry)}
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
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <FileText className="h-6 w-6 mr-2" />
            Test Tracker (Types, Marks, Date, Syllabus)
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {isAdmin ? 'Manage test results and performance analytics' : 'View your test performance'}
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
              <p className="text-2xl font-semibold text-gray-900">{filteredEntries.length}</p>
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
              <p className="text-2xl font-semibold text-gray-900">
                {filteredEntries.filter(e => calculateGrade(e.percentage) === 'A+').length}
              </p>
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
              <p className="text-2xl font-semibold text-gray-900">
                {filteredEntries.filter(e => calculateGrade(e.percentage) === 'F').length}
              </p>
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

      {/* Entries Display */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEntries.map(entry => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Test Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEntries.map(entry => {
                const grade = calculateGrade(entry.percentage);
                return (
                  <tr key={entry.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(entry.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {entry.studentName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.subject}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.testType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.marksScored}/{entry.totalMarks} ({entry.percentage.toFixed(1)}%)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getGradeColor(grade)}`}>
                        {grade}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setEditingEntry(entry)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {filteredEntries.length === 0 && !loading && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No test results found.</p>
        </div>
      )}

      {/* Form Modal */}
      {(showForm || editingEntry) && (
        <TestTrackerForm
          students={students}
          onClose={handleFormClose}
          onEntryAdded={handleEntryAdded}
          editingEntry={editingEntry}
        />
      )}
    </div>
  );
}