import React, { useState } from 'react';
import { X, FileText, Calendar, User, Save } from 'lucide-react';
import { testTrackerService, calculateGrade } from '../../services/moduleServices';
import { Student } from '../../types';

interface TestTrackerFormProps {
  students: Student[];
  onClose: () => void;
  onEntryAdded: () => void;
  editingEntry?: any;
}

export default function TestTrackerForm({ students, onClose, onEntryAdded, editingEntry }: TestTrackerFormProps) {
  const [formData, setFormData] = useState({
    date: editingEntry?.date || new Date().toISOString().split('T')[0],
    studentId: editingEntry?.studentId || '',
    subject: editingEntry?.subject || '',
    chapter: editingEntry?.chapter || '',
    testType: editingEntry?.testType || 'School Test' as 'School Test' | 'Practice Test' | 'Past Paper' | 'Mock Test',
    syllabus: editingEntry?.syllabus || '',
    marksScored: editingEntry?.marksScored || '',
    totalMarks: editingEntry?.totalMarks || '',
    performanceTrend: editingEntry?.performanceTrend || '',
    remarks: editingEntry?.remarks || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedStudent = students.find(s => s.id === formData.studentId);
    if (!selectedStudent) {
      alert('Please select a valid student');
      return;
    }

    const marksScored = parseInt(formData.marksScored);
    const totalMarks = parseInt(formData.totalMarks);
    
    if (marksScored > totalMarks) {
      alert('Marks scored cannot be greater than total marks');
      return;
    }

    try {
      setLoading(true);
      
      const percentage = (marksScored / totalMarks) * 100;
      
      const entryData = {
        ...formData,
        studentName: selectedStudent.name,
        marksScored,
        totalMarks,
        percentage
      };

      if (editingEntry) {
        await testTrackerService.update(editingEntry.id!, entryData);
      } else {
        await testTrackerService.add(entryData);
      }
      
      onEntryAdded();
    } catch (error) {
      console.error('Error saving test tracker entry:', error);
      alert('Error saving entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedStudent = students.find(s => s.id === formData.studentId);
  const percentage = formData.marksScored && formData.totalMarks 
    ? (parseInt(formData.marksScored) / parseInt(formData.totalMarks)) * 100 
    : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              {editingEntry ? 'Edit' : 'Add'} Test Result
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Date and Student */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <User className="h-4 w-4 mr-1" />
                Student Name *
              </label>
              <select
                value={formData.studentId}
                onChange={(e) => setFormData(prev => ({ ...prev, studentId: e.target.value, subject: '' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Student</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.name} - {student.school} (Grade {student.grade})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subject and Chapter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={!selectedStudent}
              >
                <option value="">Select Subject</option>
                {selectedStudent?.subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chapter *</label>
              <input
                type="text"
                value={formData.chapter}
                onChange={(e) => setFormData(prev => ({ ...prev, chapter: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Real Numbers"
                required
              />
            </div>
          </div>

          {/* Test Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Test Type *</label>
            <select
              value={formData.testType}
              onChange={(e) => setFormData(prev => ({ ...prev, testType: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="School Test">School Test</option>
              <option value="Practice Test">Practice Test</option>
              <option value="Past Paper">Past Paper</option>
              <option value="Mock Test">Mock Test</option>
            </select>
          </div>

          {/* Syllabus */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Syllabus *</label>
            <textarea
              value={formData.syllabus}
              onChange={(e) => setFormData(prev => ({ ...prev, syllabus: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Describe the test syllabus..."
              required
            />
          </div>

          {/* Marks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Marks Scored *</label>
              <input
                type="number"
                value={formData.marksScored}
                onChange={(e) => setFormData(prev => ({ ...prev, marksScored: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 85"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total Marks *</label>
              <input
                type="number"
                value={formData.totalMarks}
                onChange={(e) => setFormData(prev => ({ ...prev, totalMarks: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 100"
                min="1"
                required
              />
            </div>
          </div>

          {/* Grade Preview */}
          {formData.marksScored && formData.totalMarks && (
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-900">Calculated Results:</span>
                <div className="flex space-x-4">
                  <span className="text-sm text-blue-700">
                    Percentage: {percentage.toFixed(1)}%
                  </span>
                  <span className="text-sm font-medium text-blue-900">
                    Grade: {calculateGrade(percentage)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Performance Trend and Remarks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Performance Trend</label>
              <input
                type="text"
                value={formData.performanceTrend}
                onChange={(e) => setFormData(prev => ({ ...prev, performanceTrend: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Improving, Declining, Stable"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
              <input
                type="text"
                value={formData.remarks}
                onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Additional remarks..."
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
              disabled={loading}
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : (editingEntry ? 'Update Entry' : 'Add Entry')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}