import React, { useState, useEffect } from 'react';
import { Award, Plus, CheckCircle, Clock, FileText, Grid, List, Link } from 'lucide-react';
import { cambridgePaperService } from '../../services/moduleServices';
import { CambridgePaperEntry } from '../../types/modules';
import { Student } from '../../types';
import { ViewMode } from '../../types/modules';
import { getStatusColor } from '../../services/moduleServices';
import CambridgePaperForm from '../forms/CambridgePaperForm';

interface CambridgePaperModuleProps {
  isAdmin: boolean;
  studentId?: string;
  students: Student[];
}

export default function CambridgePaperModule({ isAdmin, studentId, students }: CambridgePaperModuleProps) {
  const [entries, setEntries] = useState<CambridgePaperEntry[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CambridgePaperEntry | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEntries();
  }, [studentId]);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const data = studentId 
        ? await cambridgePaperService.getByStudent(studentId)
        : await cambridgePaperService.getAll();
      setEntries(data);
    } catch (error) {
      console.error('Error loading Cambridge paper entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (entry: CambridgePaperEntry, newStatus: CambridgePaperEntry['status']) => {
    await cambridgePaperService.update(entry.id!, { status: newStatus });
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

  const EntryCard = ({ entry }: { entry: CambridgePaperEntry }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{entry.paperNumber}</h3>
          <p className="text-sm text-gray-600">{entry.studentName} • {entry.subject}</p>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(entry.status)}`}>
          {entry.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <p><strong>Date:</strong> {new Date(entry.date).toLocaleDateString()}</p>
        <p><strong>Code:</strong> {entry.code}</p>
        <p><strong>Variant:</strong> {entry.variant}</p>
        <p><strong>Series:</strong> {entry.series}</p>
        {entry.linkToPaper && (
          <div className="flex items-center space-x-2">
            <Link className="h-4 w-4 text-blue-600" />
            <a 
              href={entry.linkToPaper} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              View Paper
            </a>
          </div>
        )}
      </div>

      {/* Progress Indicator */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Assigned</span>
          <span>Attempted</span>
          <span>Checked</span>
          <span>Feedback</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: entry.status === 'Assigned' ? '25%' :
                     entry.status === 'Attempted' ? '50%' :
                     entry.status === 'Checked' ? '75%' : '100%'
            }}
          ></div>
        </div>
      </div>

      {isAdmin && (
        <div className="flex flex-wrap gap-2">
          {entry.status === 'Assigned' && (
            <button
              onClick={() => updateStatus(entry, 'Attempted')}
              className="flex-1 bg-blue-50 text-blue-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-100"
            >
              Mark Attempted
            </button>
          )}
          {entry.status === 'Attempted' && (
            <button
              onClick={() => updateStatus(entry, 'Checked')}
              className="flex-1 bg-green-50 text-green-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-100"
            >
              Mark Checked
            </button>
          )}
          {entry.status === 'Checked' && (
            <button
              onClick={() => updateStatus(entry, 'Feedback Given')}
              className="flex-1 bg-purple-50 text-purple-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-purple-100"
            >
              Give Feedback
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
            <Award className="h-6 w-6 mr-2" />
            Cambridge Paper Coordinator
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {isAdmin ? 'Manage Cambridge paper workflow' : 'Track your Cambridge paper progress'}
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
              Assign Paper
            </button>
          )}
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Assigned</p>
              <p className="text-2xl font-semibold text-gray-900">{statusCounts['Assigned'] || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Attempted</p>
              <p className="text-2xl font-semibold text-gray-900">{statusCounts['Attempted'] || 0}</p>
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
            <Award className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Feedback Given</p>
              <p className="text-2xl font-semibold text-gray-900">{statusCounts['Feedback Given'] || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Entries Display */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entries.map(entry => (
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paper Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Series</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {entries.map(entry => (
                <tr key={entry.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(entry.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {entry.studentName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.subject}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.paperNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.series}</td>
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

      {entries.length === 0 && !loading && (
        <div className="text-center py-12">
          <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No Cambridge papers found.</p>
        </div>
      )}

      {/* Form Modal */}
      {(showForm || editingEntry) && (
        <CambridgePaperForm
          students={students}
          onClose={handleFormClose}
          onEntryAdded={handleEntryAdded}
          editingEntry={editingEntry}
        />
      )}
    </div>
  );
}