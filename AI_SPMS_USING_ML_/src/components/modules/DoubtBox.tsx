import React, { useState, useEffect } from 'react';
import { HelpCircle, Plus, MessageCircle, CheckCircle, Clock, Grid, List } from 'lucide-react';
import { doubtService } from '../../services/moduleServices';
import { Doubt } from '../../types/modules';
import { Student } from '../../types';
import { ViewMode } from '../../types/modules';
import { getPriorityColor, getStatusColor } from '../../services/moduleServices';

interface DoubtBoxProps {
  isAdmin: boolean;
  studentId?: string;
  students: Student[];
}

export default function DoubtBox({ isAdmin, studentId, students }: DoubtBoxProps) {
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showForm, setShowForm] = useState(false);
  const [editingDoubt, setEditingDoubt] = useState<Doubt | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDoubts();
  }, [studentId]);

  const loadDoubts = async () => {
    setLoading(true);
    try {
      const data = studentId 
        ? await doubtService.getByStudent(studentId)
        : await doubtService.getAll();
      setDoubts(data);
    } catch (error) {
      console.error('Error loading doubts:', error);
    } finally {
      setLoading(false);
    }
  };

  const resolveDoubt = async (doubt: Doubt, resolution: string) => {
    await doubtService.update(doubt.id!, {
      status: 'Resolved',
      resolvedDate: new Date().toISOString(),
      resolution
    });
    loadDoubts();
  };

  const getDoubtTypeColor = (type: Doubt['type']): string => {
    switch (type) {
      case 'Conceptual': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Careless': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Memory': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Application': return 'bg-green-100 text-green-800 border-green-200';
      case 'Confusion': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDoubtTypeIcon = (type: Doubt['type']) => {
    switch (type) {
      case 'Conceptual': return '🧠';
      case 'Careless': return '⚠️';
      case 'Memory': return '🧩';
      case 'Application': return '🎯';
      case 'Confusion': return '❓';
      default: return '💭';
    }
  };

  const filteredDoubts = selectedType === 'all' 
    ? doubts 
    : doubts.filter(doubt => doubt.type === selectedType);

  const DoubtCard = ({ doubt }: { doubt: Doubt }) => (
    <div className={`bg-white rounded-lg border-2 p-6 hover:shadow-md transition-shadow ${getDoubtTypeColor(doubt.type)}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">{getDoubtTypeIcon(doubt.type)}</span>
            <h3 className="text-lg font-semibold text-gray-900">{doubt.subject}</h3>
          </div>
          <p className="text-sm text-gray-600">{doubt.studentName}</p>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getDoubtTypeColor(doubt.type)}`}>
            {doubt.type}
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(doubt.status)}`}>
            {doubt.status}
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <p><strong>Chapter:</strong> {doubt.chapter}</p>
        <p><strong>Topic:</strong> {doubt.topic}</p>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm"><strong>Question:</strong></p>
          <p className="text-sm text-gray-700 mt-1">{doubt.question}</p>
        </div>
        <p><strong>Submitted:</strong> {new Date(doubt.submittedDate).toLocaleDateString()}</p>
        {doubt.resolvedDate && (
          <p><strong>Resolved:</strong> {new Date(doubt.resolvedDate).toLocaleDateString()}</p>
        )}
        {doubt.resolution && (
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-sm font-medium text-green-800">Resolution:</p>
            <p className="text-sm text-green-700 mt-1">{doubt.resolution}</p>
          </div>
        )}
        {doubt.adminNotes && (
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-sm font-medium text-blue-800">Admin Notes:</p>
            <p className="text-sm text-blue-700 mt-1">{doubt.adminNotes}</p>
          </div>
        )}
      </div>

      {isAdmin && doubt.status !== 'Resolved' && (
        <div className="flex space-x-2">
          <button
            onClick={() => setEditingDoubt(doubt)}
            className="flex-1 bg-blue-50 text-blue-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-100"
          >
            Add Resolution
          </button>
          <button
            onClick={() => doubtService.update(doubt.id!, { status: 'In Progress' })}
            className="flex-1 bg-yellow-50 text-yellow-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-yellow-100"
          >
            Mark In Progress
          </button>
        </div>
      )}
    </div>
  );

  const doubtTypes = ['Conceptual', 'Careless', 'Memory', 'Application', 'Confusion'] as const;
  const typeDistribution = doubtTypes.map(type => ({
    type,
    count: doubts.filter(d => d.type === type).length,
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <MessageCircle className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total Doubts</p>
              <p className="text-2xl font-semibold text-gray-900">{doubts.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">
                {doubts.filter(d => d.status === 'Submitted').length}
              </p>
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
              <p className="text-2xl font-semibold text-gray-900">
                {doubts.filter(d => d.status === 'In Progress').length}
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
                {doubts.filter(d => d.status === 'Resolved').length}
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

      {/* Doubts Display */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoubts.map(doubt => (
            <DoubtCard key={doubt.id} doubt={doubt} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Topic</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDoubts.map(doubt => (
                <tr key={doubt.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {doubt.studentName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doubt.subject}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getDoubtTypeColor(doubt.type)}`}>
                      {getDoubtTypeIcon(doubt.type)} {doubt.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doubt.topic}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(doubt.status)}`}>
                      {doubt.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(doubt.submittedDate).toLocaleDateString()}
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setEditingDoubt(doubt)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Resolve
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredDoubts.length === 0 && !loading && (
        <div className="text-center py-12">
          <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No doubts found.</p>
        </div>
      )}
    </div>
  );
}