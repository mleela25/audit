import React, { useState } from 'react';
import { X, Target, User, Save, Clock, Calendar, Upload, Link, MessageCircle } from 'lucide-react';
import { workPoolService } from '../../services/moduleServices';
import { Student } from '../../types';

interface WorkPoolFormProps {
  students: Student[];
  onClose: () => void;
  onEntryAdded: () => void;
  editingEntry?: any;
}

export default function WorkPoolForm({ students, onClose, onEntryAdded, editingEntry }: WorkPoolFormProps) {
  const [formData, setFormData] = useState({
    date: editingEntry?.date || new Date().toISOString().split('T')[0],
    batch: editingEntry?.batch || '',
    studentId: editingEntry?.studentId || '',
    workType: editingEntry?.workType || 'School Work' as 'School Work' | 'Tuition Work',
    subject: editingEntry?.subject || '',
    chapterNumber: editingEntry?.chapterNumber || 1,
    chapterName: editingEntry?.chapterName || '',
    topic: editingEntry?.topic || '',
    description: editingEntry?.description || '',
    status: editingEntry?.status || 'Assign' as 'Assign' | 'Pending' | 'Completed',
    dueDate: editingEntry?.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    url: editingEntry?.url || '',
    files: editingEntry?.files || [],
    commentByMentor: editingEntry?.commentByMentor || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedStudent = students.find(s => s.id === formData.studentId);
    if (!selectedStudent) {
      alert('Please select a valid student');
      return;
    }

    try {
      setLoading(true);
      
      const entryData = {
        ...formData,
        studentName: selectedStudent.name,
        batch: selectedStudent.batch
      };

      if (editingEntry) {
        await workPoolService.update(editingEntry.id!, entryData);
      } else {
        await workPoolService.add(entryData);
      }
      
      onEntryAdded();
    } catch (error) {
      console.error('Error saving work pool entry:', error);
      alert('Error saving entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedStudent = students.find(s => s.id === formData.studentId);
  const batches = Array.from(new Set(students.map(s => s.batch)));

  // Filter students by selected batch
  const batchStudents = formData.batch 
    ? students.filter(s => s.batch === formData.batch)
    : students;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Target className="h-5 w-5 mr-2" />
              {editingEntry ? 'Edit' : 'Add'} Work Pool Entry
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Date and Batch */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Current Date *
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Batch *
              </label>
              <select
                value={formData.batch}
                onChange={(e) => setFormData(prev => ({ ...prev, batch: e.target.value, studentId: '' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Batch</option>
                {batches.map(batch => (
                  <option key={batch} value={batch}>{batch}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Student and Work Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <User className="h-4 w-4 mr-1" />
                Student Name (Batch-wise) *
              </label>
              <select
                value={formData.studentId}
                onChange={(e) => setFormData(prev => ({ ...prev, studentId: e.target.value, subject: '' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={!formData.batch}
              >
                <option value="">Select Student</option>
                {batchStudents.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.name} - Grade {student.grade}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Work Type *
              </label>
              <select
                value={formData.workType}
                onChange={(e) => setFormData(prev => ({ ...prev, workType: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="School Work">School Work</option>
                <option value="Tuition Work">Tuition Work</option>
              </select>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Student Subject *</label>
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

          {/* Chapter Number and Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chapter Number *</label>
              <select
                value={formData.chapterNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, chapterNumber: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {Array.from({ length: 40 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>Chapter {i + 1}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chapter Name *</label>
              <input
                type="text"
                value={formData.chapterName}
                onChange={(e) => setFormData(prev => ({ ...prev, chapterName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Real Numbers"
                required
              />
            </div>
          </div>

          {/* Topic and Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Topic *</label>
              <input
                type="text"
                value={formData.topic}
                onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Euclid's Division Algorithm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="Assign">Assign</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Describe the work to be done..."
              required
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Due Date *</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* URL and Files */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Link className="h-4 w-4 mr-1" />
                URL (Optional)
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/resource"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Upload className="h-4 w-4 mr-1" />
                Files (Optional)
              </label>
              <input
                type="file"
                multiple
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            </div>
          </div>

          {/* Comment by Mentor (Admin Only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <MessageCircle className="h-4 w-4 mr-1" />
              Comment by Mentor (Admin Only)
            </label>
            <textarea
              value={formData.commentByMentor}
              onChange={(e) => setFormData(prev => ({ ...prev, commentByMentor: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Mentor's comments about the work..."
            />
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