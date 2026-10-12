import React, { useState } from 'react';
import { Plus, Filter, Grid, List, Phone, Mail } from 'lucide-react';
import { Student, FilterType, ViewMode } from '../types';
import { clsx } from 'clsx';

interface StudentListProps {
  searchTerm: string;
}

export default function StudentList({ searchTerm }: StudentListProps) {
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedBatch, setSelectedBatch] = useState<string>('all');

  const filteredStudents: Student[] = [];

  const batches = ['all'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Students</h2>
          <p className="text-sm text-gray-500 mt-1">{filteredStudents.length} students found</p>
        </div>
        <button className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
          <Plus className="h-4 w-4 mr-2" />
          Add Student
        </button>
      </div>

      {/* Filters and View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Batches</option>
              {batches.slice(1).map(batch => (
                <option key={batch} value={batch}>{batch}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={clsx(
              'p-2 rounded-lg transition-colors',
              viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
            )}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={clsx(
              'p-2 rounded-lg transition-colors',
              viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
            )}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Students Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No students found. Please add students to get started.</p>
            </div>
          ) : (
            filteredStudents.map((student) => (
              <StudentCard key={student.id} student={student} />
            ))
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  School & Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Batch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No students found. Please add students to get started.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">{student.parentName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.school}</div>
                      <div className="text-sm text-gray-500">Class {student.class}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {student.batch}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4" />
                        <span>{student.parentPhone}</span>
                      </div>
                      {student.email && (
                        <div className="flex items-center space-x-2 mt-1">
                          <Mail className="h-4 w-4" />
                          <span>{student.email}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                      <button className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StudentCard({ student }: { student: Student }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex items-center space-x-2">
          <img 
            src="/shreeji education- zone.jpeg" 
            alt="Shreeji Education Zone" 
            className="h-12 w-12 rounded-full object-cover border-2 border-blue-200"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center hidden">
            <span className="text-sm font-medium text-blue-600">
              {student.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">{student.name}</h3>
          <p className="text-sm text-gray-500">{student.school} • Class {student.class}</p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Batch:</span>
          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
            {student.batch}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Parent:</span>
          <span className="text-sm text-gray-900">{student.parentName}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Phone:</span>
          <span className="text-sm text-gray-900">{student.parentPhone}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          View Details
        </button>
        <div className="flex space-x-2">
          <button className="text-sm text-gray-600 hover:text-gray-700">Edit</button>
          <button className="text-sm text-red-600 hover:text-red-700">Delete</button>
        </div>
      </div>
    </div>
  );
}