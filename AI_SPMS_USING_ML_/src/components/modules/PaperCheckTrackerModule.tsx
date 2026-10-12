import React, { useState, useEffect } from 'react';
import { FileCheck, Plus, CheckCircle, Clock, AlertTriangle, Grid, List } from 'lucide-react';
import { paperCheckService } from '../../services/moduleServices';
import { PaperCheckEntry } from '../../types/modules';
import { Student } from '../../types';
import { ViewMode } from '../../types/modules';
import { getStatusColor } from '../../services/moduleServices';
import PaperCheckForm from '../forms/PaperCheckForm';

interface PaperCheckTrackerModuleProps {
  isAdmin: boolean;
  studentId?: string;
  students: Student[];
}

export default function PaperCheckTrackerModule({ isAdmin, studentId, students }: PaperCheckTrackerModuleProps) {
  const [entries, setEntries] = useState<PaperCheckEntry[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<PaperCheckEntry | null>(null);
  const [filterStudent, setFilterStudent] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEntries();
  }, [studentId]);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const data = studentId 
        ? await paperCheckService.getByStudent(studentId)
        : await paperCheckService.getAll();
      setEntries(data);
    } catch (error) {
      console.error('Error loading paper check entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (entry: PaperCheckEntry, newStatus: PaperCheckEntry['status']) => {
    await paperCheckService.update(entry.id!, { status: newStatus });
    loadEntries();
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingEntry(null);
  };

  const handleEntryAdded = () => {
    loadEntries();
    handleFormClose();
  };

  const filteredEntries = entries.filter(entry => {
    const matchesStudent = filterStudent === 'all' || entry.studentId === filterStudent;
    const matchesSubject = filterSubject === 'all' || entry.subject === filterSubject;
    return matchesStudent && matchesSubject;
  });

  const subjects = Array.from(new Set(entries.map(entry => entry.subject)));

  const EntryCard = ({ entry }: { entry: PaperCheckEntry }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{entry.subject}</h3>
          <p className="text-sm text-gray-600">{entry.studentName}</p>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(entry.status)}`}>
          {entry.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <p><strong>Date:</strong> {new Date(entry.date).toLocaleDateString()}</p>
        <p><strong>Paper Type:</strong> {entry.paperType}</p>
        <p><strong>Checked By:</strong> {entry.checkedBy}</p>
        {entry.remarks && <p><strong>Remarks:</strong> {entry.remarks}</p>}
      </div>

      {isAdmin && (
        <div className="flex flex-wrap gap-2">
          {entry.status === 'Not Checked' && (
            <button
              onClick={() => updateStatus(entry, 'Checked')}
              className="flex-1 bg-green-50 text-green-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-100"
            >
              Mark Checked
            </button>
          )}
          {entry.status === 'Checked' && (
            <button
              onClick={() => updateStatus(entry, 'Recheck Required')}
              className="flex-1 bg-orange-50 text-orange-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-orange-100"
            >
              Needs Recheck
            </button>
          )}
          {entry.status === 'Recheck Required' && (
            <button
              onClick={() => updateStatus(entry, 'Checked')}
              className="flex-1 bg-green-50 text-green-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-100"
            >
              Recheck Done
            </button>
          )}
        </div>
      )}
    </div>
  );

  const statusCounts = entries.reduce((acc, entry) => {
    acc[entry.status] = (acc[entry.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <FileCheck className="h-6 w-6 mr-2" />
            Paper Check/Uncheck Tracker
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

      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paper Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Checked By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEntries.map(entry => (
                <tr key={entry.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(entry.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {entry.studentName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.subject}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.paperType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.checkedBy}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(entry.status)}`}>
                      {entry.status}
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
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredEntries.length === 0 && !loading && (
        <div className="text-center py-12">
          <FileCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No papers to check found.</p>
        </div>
      )}

      {/* Form Modal */}
      {(showForm || editingEntry) && (
        <PaperCheckForm
          students={students}
          onClose={handleFormClose}
          onEntryAdded={handleEntryAdded}
          editingEntry={editingEntry}
        />
      )}
    </div>
  );
}