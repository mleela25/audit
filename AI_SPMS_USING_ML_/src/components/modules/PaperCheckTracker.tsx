import React, { useState, useEffect } from 'react';
import { FileCheck, Plus, Clock, CheckCircle, AlertTriangle, Grid, List, Filter } from 'lucide-react';
import { paperCheckService } from '../../services/moduleServices';
import { PaperCheck } from '../../types/modules';
import { Student } from '../../types';
import { ViewMode } from '../../types/modules';
import { getPriorityColor, getStatusColor } from '../../services/moduleServices';

interface PaperCheckTrackerProps {
  isAdmin: boolean;
  studentId?: string;
  students: Student[];
}

export default function PaperCheckTracker({ isAdmin, studentId, students }: PaperCheckTrackerProps) {
  const [paperChecks, setPaperChecks] = useState<PaperCheck[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showForm, setShowForm] = useState(false);
  const [editingCheck, setEditingCheck] = useState<PaperCheck | null>(null);
  const [filterStudent, setFilterStudent] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPaperChecks();
  }, [studentId]);

  const loadPaperChecks = async () => {
    setLoading(true);
    try {
      const data = studentId 
        ? await paperCheckService.getByStudent(studentId)
        : await paperCheckService.getAll();
      setPaperChecks(data);
    } catch (error) {
      console.error('Error loading paper checks:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCheckStatus = async (check: PaperCheck, newStatus: PaperCheck['status']) => {
    const updates: Partial<PaperCheck> = { status: newStatus };
    
    if (newStatus === 'In Progress') {
      updates.actualTime = 0; // Start timing
    } else if (newStatus === 'Checked') {
      updates.actualTime = check.estimatedTime; // For demo purposes
    }

    await paperCheckService.update(check.id!, updates);
    loadPaperChecks();
  };

  const filteredChecks = paperChecks.filter(check => {
    const matchesStudent = filterStudent === 'all' || check.studentId === filterStudent;
    const matchesSubject = filterSubject === 'all' || check.subject === filterSubject;
    return matchesStudent && matchesSubject;
  });

  const subjects = Array.from(new Set(paperChecks.map(check => check.subject)));

  const PaperCheckCard = ({ check }: { check: PaperCheck }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{check.title}</h3>
          <p className="text-sm text-gray-600">{check.studentName} • {check.subject}</p>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(check.priority)}`}>
            {check.priority}
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(check.status)}`}>
            {check.status}
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <p><strong>Paper Type:</strong> {check.paperType}</p>
        <p><strong>Submitted:</strong> {new Date(check.submittedDate).toLocaleDateString()}</p>
        <p><strong>Estimated Time:</strong> {check.estimatedTime} minutes</p>
        {check.actualTime && (
          <p><strong>Actual Time:</strong> {check.actualTime} minutes</p>
        )}
        {check.marks && check.totalMarks && (
          <p><strong>Marks:</strong> {check.marks}/{check.totalMarks}</p>
        )}
        {check.feedback && (
          <p><strong>Feedback:</strong> {check.feedback}</p>
        )}
      </div>

      {/* Time Efficiency Indicator */}
      {check.actualTime && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Estimated: {check.estimatedTime}min</span>
            <span>Actual: {check.actualTime}min</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                check.actualTime <= check.estimatedTime ? 'bg-green-500' : 'bg-red-500'
              }`}
              style={{ 
                width: `${Math.min((check.actualTime / check.estimatedTime) * 100, 100)}%`
              }}
            ></div>
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="flex flex-wrap gap-2">
          {check.status === 'Not Checked' && (
            <button
              onClick={() => updateCheckStatus(check, 'In Progress')}
              className="flex-1 bg-blue-50 text-blue-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-100"
            >
              Start Checking
            </button>
          )}
          {check.status === 'In Progress' && (
            <>
              <button
                onClick={() => updateCheckStatus(check, 'Checked')}
                className="flex-1 bg-green-50 text-green-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-100"
              >
                Mark Checked
              </button>
              <button
                onClick={() => updateCheckStatus(check, 'Recheck Required')}
                className="flex-1 bg-orange-50 text-orange-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-orange-100"
              >
                Needs Recheck
              </button>
            </>
          )}
          {check.status === 'Recheck Required' && (
            <button
              onClick={() => updateCheckStatus(check, 'In Progress')}
              className="flex-1 bg-blue-50 text-blue-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-100"
            >
              Start Recheck
            </button>
          )}
        </div>
      )}
    </div>
  );

  const statusCounts = paperChecks.reduce((acc, check) => {
    acc[check.status] = (acc[check.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalEstimatedTime = paperChecks
    .filter(c => c.status === 'Not Checked')
    .reduce((sum, c) => sum + c.estimatedTime, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <FileCheck className="h-6 w-6 mr-2" />
            Paper Check Tracker
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {isAdmin ? 'Manage paper checking workload' : 'Track your paper checking status'}
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
              Add Paper
            </button>
          )}
        </div>
      </div>

      {/* Workload Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Not Checked</p>
              <p className="text-2xl font-semibold text-gray-900">{statusCounts['Not Checked'] || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-semibold text-gray-900">{statusCounts['In Progress'] || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Checked</p>
              <p className="text-2xl font-semibold text-gray-900">{statusCounts['Checked'] || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Recheck Required</p>
              <p className="text-2xl font-semibold text-gray-900">{statusCounts['Recheck Required'] || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Time Estimate */}
      {isAdmin && totalEstimatedTime > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-blue-600 mr-2" />
            <p className="text-blue-800">
              <strong>Estimated checking time remaining:</strong> {Math.round(totalEstimatedTime / 60)} hours {totalEstimatedTime % 60} minutes
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex space-x-4">
        <select
          value={filterStudent}
          onChange={(e) => setFilterStudent(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Students</option>
          {students.map(student => (
            <option key={student.id} value={student.id}>{student.name}</option>
          ))}
        </select>
        <select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Subjects</option>
          {subjects.map(subject => (
            <option key={subject} value={subject}>{subject}</option>
          ))}
        </select>
      </div>

      {/* Paper Checks Display */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChecks.map(check => (
            <PaperCheckCard key={check.id} check={check} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Est. Time</th>
                {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredChecks.map(check => (
                <tr key={check.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{check.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{check.studentName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{check.subject}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{check.paperType}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(check.status)}`}>
                      {check.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{check.estimatedTime}min</td>
                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setEditingCheck(check)}
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

      {filteredChecks.length === 0 && !loading && (
        <div className="text-center py-12">
          <FileCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No papers to check found.</p>
        </div>
      )}
    </div>
  );
}