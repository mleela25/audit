import React, { useState } from 'react';
import { Plus, Search, Filter, Grid, List, Phone, Mail, Edit, Trash2, Users } from 'lucide-react';
import { Student } from '../../types';
import { User } from 'firebase/auth';
import StudentForm from '../admin/StudentForm';
import StudentEditForm from '../admin/StudentEditForm';
import SeedStudentsButton from '../admin/SeedStudentsButton';
import { studentService } from '../../services/studentService';

interface StudentsManagementProps {
  isAdmin: boolean;
  studentId?: string;
  students: Student[];
  currentUser?: User | null;
  onStudentsUpdate?: () => void;
}

export default function StudentsManagement({ isAdmin, students, onStudentsUpdate }: StudentsManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBoard, setSelectedBoard] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);

  const handleStudentAdded = () => {
    setShowAddForm(false);
    if (onStudentsUpdate) {
      onStudentsUpdate();
    }
  };

  const handleStudentUpdated = () => {
    setEditingStudent(null);
    if (onStudentsUpdate) {
      onStudentsUpdate();
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        setLoading(true);
        await studentService.deleteStudent(studentId);
        if (onStudentsUpdate) {
          onStudentsUpdate();
        }
      } catch (error) {
        console.error('Error deleting student:', error);
        alert('Error deleting student. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.school.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBoard = selectedBoard === 'all' || student.schoolType === selectedBoard;
    return matchesSearch && matchesBoard;
  });

  const boards = ['all', ...Array.from(new Set(students.map(s => s.schoolType)))];

  const StudentCard = ({ student }: { student: Student }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
          <span className="text-lg font-bold text-white">
            {student.name.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {student.name}
          </h3>
          <p className="text-sm text-gray-500">{student.school}</p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Grade:</span>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
            {student.grade}th
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Board:</span>
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
            {student.schoolType}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Batch:</span>
          <span className="text-sm font-medium text-gray-900">{student.batch}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Subjects:</span>
          <span className="text-sm font-medium text-gray-900">{student.subjects.length}</span>
        </div>
      </div>

      {isAdmin && (
        <div className="flex space-x-2 pt-4 border-t border-gray-100">
          <button 
            onClick={() => setEditingStudent(student)}
            className="flex-1 bg-blue-50 text-blue-700 py-2 px-3 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors flex items-center justify-center"
            disabled={loading}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </button>
          <button 
            onClick={() => handleDeleteStudent(student.id)}
            className="flex-1 bg-red-50 text-red-700 py-2 px-3 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors flex items-center justify-center"
            disabled={loading}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Student Management</h2>
          <p className="text-sm text-gray-500 mt-1">{filteredStudents.length} students found</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
          {students.length === 0 && isAdmin && (
            <SeedStudentsButton />
          )}
          {isAdmin && (
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              disabled={loading}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search students..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <select
            value={selectedBoard}
            onChange={(e) => setSelectedBoard(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            disabled={loading}
          >
            <option value="all">All Boards</option>
            {boards.slice(1).map(board => (
              <option key={board} value={board}>{board}</option>
            ))}
          </select>
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Grid className="h-4 w-4 mx-auto" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <List className="h-4 w-4 mx-auto" />
            </button>
          </div>
        </div>
      </div>

      {/* Students Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map(student => (
            <StudentCard key={student.id} student={student} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Board</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                {isAdmin && <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map(student => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.parentName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.school}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                      {student.schoolType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                      {student.grade}th
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {student.parentPhone}
                      </div>
                      {student.email && (
                        <div className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {student.email}
                        </div>
                      )}
                    </div>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => setEditingStudent(student)}
                          className="text-blue-600 hover:text-blue-900"
                          disabled={loading}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteStudent(student.id)}
                          className="text-red-600 hover:text-red-900"
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No students found matching your criteria.</p>
        </div>
      )}

      {/* Add Student Form Modal */}
      {showAddForm && (
        <StudentForm
          onClose={() => setShowAddForm(false)}
          onStudentAdded={handleStudentAdded}
        />
      )}

      {/* Edit Student Form Modal */}
      {editingStudent && (
        <StudentEditForm
          student={editingStudent}
          onClose={() => setEditingStudent(null)}
          onStudentUpdated={handleStudentUpdated}
        />
      )}
    </div>
  );
}