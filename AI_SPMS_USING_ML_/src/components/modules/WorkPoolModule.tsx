import React, { useState, useEffect } from 'react';
import { Target, Plus, Grid, List, Clock, Filter, Search, Calendar, User, BookOpen } from 'lucide-react';
import { workPoolService } from '../../services/moduleServices';
import { WorkPoolEntry } from '../../types/modules';
import { Student } from '../../types';
import { ViewMode } from '../../types/modules';
import { getStatusColor } from '../../services/moduleServices';
import WorkPoolForm from '../forms/WorkPoolForm';

interface WorkPoolModuleProps {
  isAdmin: boolean;
  studentId?: string;
  students: Student[];
}

export default function WorkPoolModule({ isAdmin, studentId, students }: WorkPoolModuleProps) {
  const [entries, setEntries] = useState<WorkPoolEntry[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WorkPoolEntry | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Smart Filters
  const [filterDate, setFilterDate] = useState('');
  const [filterBatch, setFilterBatch] = useState('all');
  const [filterStudent, setFilterStudent] = useState('all');
  const [filterWorkType, setFilterWorkType] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadEntries();
  }, [studentId]);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const data = studentId 
        ? await workPoolService.getByStudent(studentId)
        : await workPoolService.getAll();
      setEntries(data);
    } catch (error) {
      console.error('Error loading work pool entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingEntry(null);
  };

  const handleEntryAdded = () => {
    loadEntries();
    handleFormClose();
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  // Apply smart filters
  const filteredEntries = entries.filter(entry => {
    const matchesDate = !filterDate || entry.date === filterDate;
    const matchesBatch = filterBatch === 'all' || entry.batch === filterBatch;
    const matchesStudent = filterStudent === 'all' || entry.studentId === filterStudent;
    const matchesWorkType = filterWorkType === 'all' || entry.workType === filterWorkType;
    const matchesSubject = filterSubject === 'all' || entry.subject === filterSubject;
    const matchesSearch = !searchTerm || 
      entry.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.chapterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.topic.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesDate && matchesBatch && matchesStudent && matchesWorkType && matchesSubject && matchesSearch;
  });

  const batches = Array.from(new Set(students.map(s => s.batch)));
  const subjects = Array.from(new Set(entries.map(e => e.subject)));
  const batchStudents = filterBatch === 'all' ? students : students.filter(s => s.batch === filterBatch);

  const EntryCard = ({ entry }: { entry: WorkPoolEntry }) => {
    const overdue = isOverdue(entry.dueDate);
    
    return (
      <div className={`bg-white rounded-lg border-2 p-6 hover:shadow-md transition-shadow ${
        overdue && entry.status !== 'Completed' ? 'border-red-300 bg-red-50' : 'border-gray-200'
      }`}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Ch.{entry.chapterNumber}: {entry.chapterName}
            </h3>
            <p className="text-sm text-gray-600">{entry.studentName} • {entry.subject}</p>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              entry.workType === 'School Work' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
            }`}>
              {entry.workType}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(entry.status)}`}>
              {entry.status}
            </span>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <p><strong>Topic:</strong> {entry.topic}</p>
          <p><strong>Description:</strong> {entry.description}</p>
          <p><strong>Batch:</strong> {entry.batch}</p>
          <p className={`${overdue && entry.status !== 'Completed' ? 'text-red-600 font-semibold' : ''}`}>
            <strong>Due Date:</strong> {new Date(entry.dueDate).toLocaleDateString()}
            {overdue && entry.status !== 'Completed' && <span className="ml-2 text-red-500">(OVERDUE)</span>}
          </p>
          {entry.url && (
            <p>
              <strong>URL:</strong> 
              <a href={entry.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 ml-1">
                View Resource
              </a>
            </p>
          )}
          {entry.files && entry.files.length > 0 && (
            <p><strong>Files:</strong> {entry.files.length} attached</p>
          )}
          {isAdmin && entry.commentByMentor && (
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-sm font-medium text-blue-800">Mentor Comment:</p>
              <p className="text-sm text-blue-700 mt-1">{entry.commentByMentor}</p>
            </div>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                entry.status === 'Completed' ? 'bg-green-500' :
                entry.status === 'Pending' ? 'bg-blue-500' :
                overdue ? 'bg-red-500' : 'bg-yellow-500'
              }`}
              style={{ 
                width: entry.status === 'Completed' ? '100%' :
                       entry.status === 'Pending' ? '50%' : '25%'
              }}
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
            {entry.status !== 'Completed' && (
              <button
                onClick={() => {
                  workPoolService.update(entry.id!, { status: 'Completed' });
                  loadEntries();
                }}
                className="flex-1 bg-green-50 text-green-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-100"
              >
                Mark Complete
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  const StudentGridCard = ({ student }: { student: Student }) => {
    const studentEntries = entries.filter(e => e.studentId === student.id);
    const assignedCount = studentEntries.filter(e => e.status === 'Assign').length;
    const pendingCount = studentEntries.filter(e => e.status === 'Pending').length;
    const completedCount = studentEntries.filter(e => e.status === 'Completed').length;
    const overdueCount = studentEntries.filter(e => isOverdue(e.dueDate) && e.status !== 'Completed').length;

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-xl font-bold text-white">
              {student.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
            <p className="text-sm text-gray-500">{student.school}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-sm text-gray-600">Batch</p>
            <p className="font-semibold text-blue-900">{student.batch}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-sm text-gray-600">Grade</p>
            <p className="font-semibold text-green-900">{student.grade}th</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <p className="text-sm text-gray-600">Board</p>
            <p className="font-semibold text-purple-900">{student.schoolType}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 text-center">
            <p className="text-sm text-gray-600">Subjects</p>
            <p className="font-semibold text-orange-900">{student.subjects.length}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Assigned:</span>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
              {assignedCount}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Pending:</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              {pendingCount}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Completed:</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
              {completedCount}
            </span>
          </div>
          {overdueCount > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Overdue:</span>
              <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                {overdueCount}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Target className="h-6 w-6 mr-2" />
            Work Pool - Intelligent Task Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {isAdmin ? 'Comprehensive work assignment and tracking system' : 'View your assigned work'}
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
              Create Work
            </button>
          )}
        </div>
      </div>

      {/* Smart Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center space-x-4 mb-4">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Smart Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
            <select
              value={filterBatch}
              onChange={(e) => setFilterBatch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Batches</option>
              {batches.map(batch => (
                <option key={batch} value={batch}>{batch}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
            <select
              value={filterStudent}
              onChange={(e) => setFilterStudent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Students</option>
              {batchStudents.map(student => (
                <option key={student.id} value={student.id}>{student.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Work Type</label>
            <select
              value={filterWorkType}
              onChange={(e) => setFilterWorkType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="School Work">School Work</option>
              <option value="Tuition Work">Tuition Work</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total Work</p>
              <p className="text-2xl font-semibold text-gray-900">{filteredEntries.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Assigned</p>
              <p className="text-2xl font-semibold text-gray-900">
                {filteredEntries.filter(e => e.status === 'Assign').length}
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
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">
                {filteredEntries.filter(e => e.status === 'Pending').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Target className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">
                {filteredEntries.filter(e => e.status === 'Completed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Student Grid View (Admin Only) */}
      {isAdmin && entries.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Student Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {students.map(student => (
              <StudentGridCard key={student.id} student={student} />
            ))}
          </div>
        </div>
      )}

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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Work Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chapter</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEntries.map(entry => {
                const overdue = isOverdue(entry.dueDate);
                return (
                  <tr key={entry.id} className={overdue && entry.status !== 'Completed' ? 'bg-red-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(entry.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {entry.studentName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        entry.workType === 'School Work' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {entry.workType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.subject}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Ch.{entry.chapterNumber}: {entry.chapterName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(entry.status)}`}>
                        {entry.status}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      overdue && entry.status !== 'Completed' ? 'text-red-600 font-semibold' : 'text-gray-500'
                    }`}>
                      {new Date(entry.dueDate).toLocaleDateString()}
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
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No work entries found.</p>
        </div>
      )}

      {/* Form Modal */}
      {(showForm || editingEntry) && (
        <WorkPoolForm
          students={students}
          onClose={handleFormClose}
          onEntryAdded={handleEntryAdded}
          editingEntry={editingEntry}
        />
      )}
    </div>
  );
}