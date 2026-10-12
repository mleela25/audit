import React, { useState } from 'react';
import { X, FileCheck, Calendar, User, Save } from 'lucide-react';
import { paperCheckService } from '../../services/moduleServices';
import { Student } from '../../types';

interface PaperCheckFormProps {
  students: Student[];
  onClose: () => void;
  onEntryAdded: () => void;
  editingEntry?: any;
}

export default function PaperCheckForm({ students, onClose, onEntryAdded, editingEntry }: PaperCheckFormProps) {
  const [formData, setFormData] = useState({
    date: editingEntry?.date || new Date().toISOString().split('T')[0],
    studentId: editingEntry?.studentId || '',
    subject: editingEntry?.subject || '',
    paperType: editingEntry?.paperType || 'Homework' as 'Homework' | 'Classwork' | 'Test' | 'Practice Paper',
    checkedBy: editingEntry?.checkedBy || '',
    status: editingEntry?.status || 'Not Checked' as 'Checked' | 'Not Checked' | 'Recheck Required',
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

    try {
      setLoading(true);
      
      const entryData = {
        ...formData,
        studentName: selectedStudent.name
      };

      if (editingEntry) {
        await paperCheckService.update(editingEntry.id!, entryData);
      } else {
        await paperCheckService.add(entryData);
      }
      
      onEntryAdded();
    } catch (error) {
      console.error('Error saving paper check entry:', error);
      alert('Error saving entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedStudent = students.find(s => s.id === formData.studentId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <FileCheck className="h-5 w-5 mr-2" />
              {editingEntry ? 'Edit' : 'Add'} Paper Check Entry
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

          {/* Subject and Paper Type */}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Paper Type *</label>
              <select
                value={formData.paperType}
                onChange={(e) => setFormData(prev => ({ ...prev, paperType: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="Homework">Homework</option>
                <option value="Classwork">Classwork</option>
                <option value="Test">Test</option>
                <option value="Practice Paper">Practice Paper</option>
              </select>
            </div>
          </div>

          {/* Checked By and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Checked By (Mentor) *</label>
              <input
                type="text"
                value={formData.checkedBy}
                onChange={(e) => setFormData(prev => ({ ...prev, checkedBy: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Mentor name"
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
                <option value="Not Checked">Not Checked</option>
                <option value="Checked">Checked</option>
                <option value="Recheck Required">Recheck Required</option>
              </select>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
            <textarea
              value={formData.remarks}
              onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Optional remarks about the paper checking..."
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