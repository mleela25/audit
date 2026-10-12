import React, { useState, useEffect } from 'react';
import { AlertCircle, Plus, Bell, CheckCircle, Grid, List, Clock } from 'lucide-react';
import { pendingWorkService } from '../../services/moduleServices';
import { PendingWork } from '../../types/modules';
import { Student } from '../../types';
import { ViewMode } from '../../types/modules';
import { getPriorityColor, getStatusColor } from '../../services/moduleServices';

interface PendingWorkTrackerProps {
  isAdmin: boolean;
  studentId?: string;
  students: Student[];
}

export default function PendingWorkTracker({ isAdmin, studentId, students }: PendingWorkTrackerProps) {
  const [pendingWork, setPendingWork] = useState<PendingWork[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showForm, setShowForm] = useState(false);
  const [editingWork, setEditingWork] = useState<PendingWork | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPendingWork();
  }, [studentId]);

  const loadPendingWork = async () => {
    setLoading(true);
    try {
      const data = studentId 
        ? await pendingWorkService.getByStudent(studentId)
        : await pendingWorkService.getAll();
      setPendingWork(data);
    } catch (error) {
      console.error('Error loading pending work:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendReminder = async (work: PendingWork) => {
    await pendingWorkService.update(work.id!, {
      reminderCount: work.reminderCount + 1,
      lastReminderDate: new Date().toISOString()
    });
    loadPendingWork();
  };

  const markCompleted = async (work: PendingWork) => {
    await pendingWorkService.update(work.id!, {
      status: 'Completed'
    });
    loadPendingWork();
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const PendingWorkCard = ({ work }: { work: PendingWork }) => (
    <div className={`bg-white rounded-lg border-2 p-6 hover:shadow-md transition-shadow ${
      isOverdue(work.dueDate) ? 'border-red-200 bg-red-50' : 'border-gray-200'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{work.task}</h3>
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
        <p><strong>Assigned:</strong> {new Date(work.assignedDate).toLocaleDateString()}</p>
        <p className={`${isOverdue(work.dueDate) ? 'text-red-600 font-semibold' : ''}`}>
          <strong>Due Date:</strong> {new Date(work.dueDate).toLocaleDateString()}
          {isOverdue(work.dueDate) && <span className="ml-2 text-red-500">(OVERDUE)</span>}
        </p>
        <p><strong>Source:</strong> {work.sourceModule}</p>
        {work.reminderCount > 0 && (
          <p><strong>Reminders Sent:</strong> {work.reminderCount}</p>
        )}
        {work.lastReminderDate && (
          <p><strong>Last Reminder:</strong> {new Date(work.lastReminderDate).toLocaleDateString()}</p>
        )}
      </div>

      {/* Urgency Indicator */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Assigned</span>
          <span>Due</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${
              isOverdue(work.dueDate) ? 'bg-red-500' :
              work.priority === 'High' ? 'bg-orange-500' :
              'bg-yellow-500'
            }`}
            style={{ 
              width: isOverdue(work.dueDate) ? '100%' : 
                     work.priority === 'High' ? '80%' : '60%'
            }}
          ></div>
        </div>
      </div>

      {isAdmin && work.status === 'Pending' && (
        <div className="flex space-x-2">
          <button
            onClick={() => sendReminder(work)}
            className="flex-1 bg-orange-50 text-orange-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-orange-100 flex items-center justify-center"
          >
            <Bell className="h-4 w-4 mr-1" />
            Send Reminder
          </button>
          <button
            onClick={() => markCompleted(work)}
            className="flex-1 bg-green-50 text-green-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-100 flex items-center justify-center"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Mark Complete
          </button>
        </div>
      )}
    </div>
  );

  const pendingCount = pendingWork.filter(w => w.status === 'Pending').length;
  const overdueCount = pendingWork.filter(w => w.status === 'Pending' && isOverdue(w.dueDate)).length;
  const highPriorityCount = pendingWork.filter(w => w.status === 'Pending' && w.priority === 'High').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <AlertCircle className="h-6 w-6 mr-2" />
            Pending Work Tracker
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {isAdmin ? 'Manage incomplete tasks and reminders' : 'View your pending assignments'}
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
              Add Task
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total Pending</p>
              <p className="text-2xl font-semibold text-gray-900">{pendingCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-2xl font-semibold text-red-600">{overdueCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-red-600 font-bold text-sm">H</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">High Priority</p>
              <p className="text-2xl font-semibold text-gray-900">{highPriorityCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">
                {pendingWork.filter(w => w.status === 'Completed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Filter */}
      <div className="flex space-x-2">
        <button className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">High Priority</button>
        <button className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">Overdue</button>
        <button className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">This Week</button>
      </div>

      {/* Pending Work Display */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingWork.map(work => (
            <PendingWorkCard key={work.id} work={work} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reminders</th>
                {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingWork.map(work => (
                <tr key={work.id} className={isOverdue(work.dueDate) ? 'bg-red-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{work.task}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{work.studentName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{work.subject}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(work.priority)}`}>
                      {work.priority}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isOverdue(work.dueDate) ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                    {new Date(work.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{work.reminderCount}</td>
                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {work.status === 'Pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => sendReminder(work)}
                            className="text-orange-600 hover:text-orange-900"
                          >
                            Remind
                          </button>
                          <button
                            onClick={() => markCompleted(work)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Complete
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pendingWork.length === 0 && !loading && (
        <div className="text-center py-12">
          <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
          <p className="text-gray-500">No pending work found. Great job!</p>
        </div>
      )}
    </div>
  );
}