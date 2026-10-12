import React, { useState, useEffect } from 'react';
import { HelpCircle, Plus, MessageCircle, CheckCircle, Clock, Grid, List } from 'lucide-react';
import { doubtBoxService } from '../../services/moduleServices';
import { DoubtBoxEntry } from '../../types/modules';
import { Student } from '../../types';
import { ViewMode } from '../../types/modules';
import { getDoubtTypeColor } from '../../services/moduleServices';
import DoubtBoxForm from '../forms/DoubtBoxForm';

interface DoubtBoxModuleProps {
  isAdmin: boolean;
  studentId?: string;
  students: Student[];
}

export default function DoubtBoxModule({ isAdmin, studentId, students }: DoubtBoxModuleProps) {
  const [entries, setEntries] = useState<DoubtBoxEntry[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DoubtBoxEntry | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEntries();
  }, [studentId]);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const data = studentId 
        ? await doubtBoxService.getByStudent(studentId)
        : await doubtBoxService.getAll();
      setEntries(data);
    } catch (error) {
      console.error('Error loading doubt box entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const resolveDoubt = async (entry: DoubtBoxEntry, resolvedBy: string) => {
    await doubtBoxService.update(entry.id!, {
      resolved: true,
      resolvedBy
    });
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

  const getDoubtTypeIcon = (type: DoubtBoxEntry['doubtType']) => {
    switch (type) {
      case 'Conceptual': return '🧠';
      case 'Careless': return '⚠️';
      case 'Memory': return '🧩';
      case 'Application': return '🎯';
      case 'Confusion': return '❓';
      default: return '💭';
    }
  };

  const filteredEntries = selectedType === 'all' 
    ? entries 
    : entries.filter(entry => entry.doubtType === selectedType);

  const EntryCard = ({ entry }: { entry: DoubtBoxEntry }) => (
    <div className={`bg-white rounded-lg border-2 p-6 hover:shadow-md transition-shadow ${getDoubtTypeColor(entry.doubtType)}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">{getDoubtTypeIcon(entry.doubtType)}</span>
            <h3 className="text-lg font-semibold text-gray-900">{entry.subject}</h3>
          </div>
          <p className="text-sm text-gray-600">{entry.studentName}</p>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getDoubtTypeColor(entry.doubtType)}`}>
            {entry.doubtType}
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            entry.resolved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {entry.resolved ? 'Resolved' : 'Pending'}
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <p><strong>Date:</strong> {new Date(entry.date).toLocaleDateString()}</p>
        <p><strong>Chapter:</strong> {entry.chapter}</p>
        <p><strong>Topic:</strong> {entry.topic}</p>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm"><strong>Doubt Description:</strong></p>
          <p className="text-sm text-gray-700 mt-1">{entry.doubtDescription}</p>
        </div>
        {entry.resolved && entry.resolvedBy && (
          <p><strong>Resolved By:</strong> {entry.resolvedBy}</p>
        )}
      </div>

      {isAdmin && !entry.resolved && (
        <div className="flex space-x-2">
          <button
            onClick={() => setEditingEntry(entry)}
            className="flex-1 bg-blue-50 text-blue-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-100"
          >
            Resolve
          </button>
        </div>
      )}
    </div>
  );

  const doubtTypes = ['Conceptual', 'Careless', 'Memory', 'Application', 'Confusion'] as const;
  const typeDistribution = doubtTypes.map(type => ({
    type,
    count: entries.filter(e => e.doubtType === type).length,
    color: getDoubtTypeColor(type),
    icon: getDoubtTypeIcon(type)
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <HelpCircle className="h-6 w-6 mr-2" />
            Doubt Box
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {isAdmin ? 'Systematic doubt collection and resolution' : 'Submit and track your doubts'}
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
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            {isAdmin ? 'Add Doubt' : 'Submit Doubt'}
          </button>
        </div>
      </div>

      {/* Doubt Type Distribution */}
      <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-green-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Doubt Type Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {typeDistribution.map(({ type, count, color, icon }) => (
            <div key={type} className={`rounded-lg border-2 p-4 text-center ${color}`}>
              <div className="text-2xl mb-2">{icon}</div>
              <p className="font-semibold text-lg">{count}</p>
              <p className="text-sm font-medium">{type}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <MessageCircle className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total Doubts</p>
              <p className="text-2xl font-semibold text-gray-900">{entries.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">
                {entries.filter(e => !e.resolved).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Resolved</p>
              <p className="text-2xl font-semibold text-gray-900">
                {entries.filter(e => e.resolved).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Type Filter */}
      <div className="flex space-x-2">
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Types</option>
          {doubtTypes.map(type => (
            <option key={type} value={type}>{getDoubtTypeIcon(type)} {type}</option>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Topic</th>
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getDoubtTypeColor(entry.doubtType)}`}>
                      {getDoubtTypeIcon(entry.doubtType)} {entry.doubtType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.topic}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      entry.resolved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {entry.resolved ? 'Resolved' : 'Pending'}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setEditingEntry(entry)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        {entry.resolved ? 'View' : 'Resolve'}
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
          <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No doubts found.</p>
        </div>
      )}

      {/* Form Modal */}
      {(showForm || editingEntry) && (
        <DoubtBoxForm
          students={students}
          onClose={handleFormClose}
          onEntryAdded={handleEntryAdded}
          editingEntry={editingEntry}
        />
      )}
    </div>
  );
}