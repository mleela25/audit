import React, { useState, useEffect } from 'react';
import { School, Plus, Upload, Link, Calendar, Grid, List, Download } from 'lucide-react';
import { schoolworkService } from '../../services/moduleServices';
import { SchoolWork } from '../../types/modules';
import { Student } from '../../types';
import { ViewMode } from '../../types/modules';
import { getPriorityColor, getStatusColor } from '../../services/moduleServices';

interface SchoolworkTrackerProps {
  isAdmin: boolean;
  studentId?: string;
  students: Student[];
}

export default function SchoolworkTracker({ isAdmin, studentId, students }: SchoolworkTrackerProps) {
  const [schoolwork, setSchoolwork] = useState<SchoolWork[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showForm, setShowForm] = useState(false);
  const [editingWork, setEditingWork] = useState<SchoolWork | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSchoolwork();
  }, [studentId]);

  const loadSchoolwork = async () => {
    setLoading(true);
    try {
      const data = studentId 
        ? await schoolworkService.getByStudent(studentId)
        : await schoolworkService.getAll();
      setSchoolwork(data);
    } catch (error) {
      console.error('Error loading schoolwork:', error);
    } finally {
      setLoading(false);
    }
  };

  const SchoolworkCard = ({ work }: { work: SchoolWork }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{work.title}</h3>
          <p className="text-sm text-gray-600">{work.studentName} • {work.subject}</p>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(work.priority)}`}>
            {work.priority}
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(work.status)}`}>
            {work.status}
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <p className="text-sm text-gray-700">{work.description}</p>
        <p className="text-sm"><strong>Due Date:</strong> {new Date(work.dueDate).toLocaleDateString()}</p>
        
        {work.attachments.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Attachments:</p>
            <div className="flex flex-wrap gap-2">
              {work.attachments.map((attachment, index) => (
                <a
                  key={index}
                  href={attachment}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs hover:bg-blue-100"
                >
                  <Download className="h-3 w-3 mr-1" />
                  File {index + 1}
                </a>
              ))}
            </div>
          </div>
        )}

        {work.links.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Links:</p>
            <div className="flex flex-wrap gap-2">
              {work.links.map((link, index) => (
                <a
                  key={index}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-2 py-1 bg-green-50 text-green-700 rounded text-xs hover:bg-green-100"
                >
                  <Link className="h-3 w-3 mr-1" />
                  Link {index + 1}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="flex space-x-2">
          <button
            onClick={() => setEditingWork(work)}
            className="flex-1 bg-blue-50 text-blue-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-100"
          >
            Edit
          </button>
          <button
            onClick={() => {
              if (work.status !== 'Completed') {
                schoolworkService.update(work.id!, { status: 'Completed' });
                loadSchoolwork();
              }
            }}
            className="flex-1 bg-green-50 text-green-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-100"
            disabled={work.status === 'Completed'}
          >
            Mark Complete
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
            <School className="h-6 w-6 mr-2" />
            Schoolwork Tracker
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {isAdmin ? 'Manage school assignments' : 'View your school assignments'}
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
              Add Assignment
            </button>
          )}
        </div>
      </div>

      {/* Priority Filter */}
      <div className="flex space-x-2">
        <button className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">High Priority</button>
        <button className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Medium Priority</button>
        <button className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Low Priority</button>
      </div>

      {/* Schoolwork Display */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schoolwork.map(work => (
            <SchoolworkCard key={work.id} work={work} />
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {schoolwork.map(work => (
                <tr key={work.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{work.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{work.studentName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{work.subject}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(work.priority)}`}>
                      {work.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(work.status)}`}>
                      {work.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(work.dueDate).toLocaleDateString()}
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setEditingWork(work)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
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

      {schoolwork.length === 0 && !loading && (
        <div className="text-center py-12">
          <School className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No school assignments found.</p>
        </div>
      )}
    </div>
  );
}