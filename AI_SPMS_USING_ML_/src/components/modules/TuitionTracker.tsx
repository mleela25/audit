import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Clock, Flag, Eye, Edit, Trash2, Grid, List } from 'lucide-react';
import { tuitionService, pendingWorkService } from '../../services/moduleServices';
import { TuitionSession } from '../../types/modules';
import { Student } from '../../types';
import { ViewMode } from '../../types/modules';

interface TuitionTrackerProps {
  isAdmin: boolean;
  studentId?: string;
  students: Student[];
}

export default function TuitionTracker({ isAdmin, studentId, students }: TuitionTrackerProps) {
  const [sessions, setSessions] = useState<TuitionSession[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState<TuitionSession | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSessions();
  }, [studentId]);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const data = studentId 
        ? await tuitionService.getByStudent(studentId)
        : await tuitionService.getAll();
      setSessions(data);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFlagAsPending = async (session: TuitionSession) => {
    if (session.status === 'Completed') return;
    
    try {
      await pendingWorkService.add({
        studentId: session.studentId,
        studentName: session.studentName,
        subject: session.subject,
        task: `${session.topic} - ${session.chapter}`,
        priority: session.status === 'Not Started' ? 'High' : 'Medium',
        assignedDate: session.date,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Pending',
        reminderCount: 0,
        sourceModule: 'Tuition',
        sourceId: session.id
      });

      await tuitionService.update(session.id!, { flaggedAsPending: true });
      loadSessions();
    } catch (error) {
      console.error('Error flagging as pending:', error);
    }
  };

  const SessionCard = ({ session }: { session: TuitionSession }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{session.subject}</h3>
          <p className="text-sm text-gray-600">{session.studentName}</p>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          session.status === 'Completed' ? 'bg-green-100 text-green-800' :
          session.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {session.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <p><strong>Chapter:</strong> {session.chapter}</p>
        <p><strong>Topic:</strong> {session.topic}</p>
        <p><strong>Date:</strong> {new Date(session.date).toLocaleDateString()}</p>
        <p><strong>Time Spent:</strong> {session.timeSpent} minutes</p>
        {session.notes && <p><strong>Notes:</strong> {session.notes}</p>}
      </div>

      {isAdmin && (
        <div className="flex space-x-2">
          <button
            onClick={() => setEditingSession(session)}
            className="flex-1 bg-blue-50 text-blue-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-100"
          >
            <Edit className="h-4 w-4 inline mr-1" />
            Edit
          </button>
          {session.status !== 'Completed' && !session.flaggedAsPending && (
            <button
              onClick={() => handleFlagAsPending(session)}
              className="flex-1 bg-orange-50 text-orange-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-orange-100"
            >
              <Flag className="h-4 w-4 inline mr-1" />
              Flag as Pending
            </button>
          )}
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
            <BookOpen className="h-6 w-6 mr-2" />
            Tuition Tracker
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {isAdmin ? 'Manage tuition sessions' : 'View your tuition progress'}
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
              Add Session
            </button>
          )}
        </div>
      </div>

      {/* Sessions Display */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map(session => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Topic</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sessions.map(session => (
                <tr key={session.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {session.studentName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{session.subject}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{session.topic}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      session.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      session.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {session.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(session.date).toLocaleDateString()}
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setEditingSession(session)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Edit
                      </button>
                      {session.status !== 'Completed' && !session.flaggedAsPending && (
                        <button
                          onClick={() => handleFlagAsPending(session)}
                          className="text-orange-600 hover:text-orange-900"
                        >
                          Flag
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {sessions.length === 0 && !loading && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No tuition sessions found.</p>
        </div>
      )}
    </div>
  );
}