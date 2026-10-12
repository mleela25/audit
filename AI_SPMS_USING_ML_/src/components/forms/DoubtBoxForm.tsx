import React, { useState } from 'react';
import { X, HelpCircle, Calendar, User, Save } from 'lucide-react';
import { doubtBoxService } from '../../services/moduleServices';
import { Student } from '../../types';

interface DoubtBoxFormProps {
  students: Student[];
  onClose: () => void;
  onEntryAdded: () => void;
  editingEntry?: any;
}

export default function DoubtBoxForm({ students, onClose, onEntryAdded, editingEntry }: DoubtBoxFormProps) {
  const [formData, setFormData] = useState({
    date: editingEntry?.date || new Date().toISOString().split('T')[0],
    studentId: editingEntry?.studentId || '',
    subject: editingEntry?.subject || '',
    chapter: editingEntry?.chapter || '',
    topic: editingEntry?.topic || '',
    doubtType: editingEntry?.doubtType || 'Conceptual' as 'Conceptual' | 'Careless' | 'Memory' | 'Application' | 'Confusion',
    doubtDescription: editingEntry?.doubtDescription || '',
    resolved: editingEntry?.resolved || false,
    resolvedBy: editingEntry?.resolvedBy || ''
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
        await doubtBoxService.update(editingEntry.id!, entryData);
      } else {
        await doubtBoxService.add(entryData);
      }
      
      onEntryAdded();
    } catch (error) {
      console.error('Error saving doubt box entry:', error);
      alert('Error saving entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedStudent = students.find(s => s.id === formData.studentId);

  const getDoubtTypeColor = (type: string) => {
    switch (type) {
      case 'Conceptual': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Careless': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Memory': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Application': return 'bg-green-100 text-green-800 border-green-200';
      case 'Confusion': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <HelpCircle className="h-5 w-5 mr-2" />
              {editingEntry ? 'Edit' : 'Add'} Doubt Entry
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

          {/* Topic and Doubt Type */}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Doubt Type *</label>
              <select
                value={formData.doubtType}
                onChange={(e) => setFormData(prev => ({ ...prev, doubtType: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="Conceptual">🧠 Conceptual</option>
                <option value="Careless">⚠️ Careless</option>
                <option value="Memory">🧩 Memory</option>
                <option value="Application">🎯 Application</option>
                <option value="Confusion">❓ Confusion</option>
              </select>
            </div>
          </div>

          {/* Doubt Type Preview */}
          <div className={`p-3 rounded-lg border-2 ${getDoubtTypeColor(formData.doubtType)}`}>
            <p className="text-sm font-medium">Selected Doubt Type: {formData.doubtType}</p>
          </div>

          {/* Doubt Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Doubt Description *</label>
            <textarea
              value={formData.doubtDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, doubtDescription: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              placeholder="Describe the doubt in detail..."
              required
            />
          </div>

          {/* Resolution Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.resolved}
                  onChange={(e) => setFormData(prev => ({ ...prev, resolved: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Resolved</span>
              </label>
            </div>
            {formData.resolved && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Resolved By</label>
                <input
                  type="text"
                  value={formData.resolvedBy}
                  onChange={(e) => setFormData(prev => ({ ...prev, resolvedBy: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Mentor name"
                />
              </div>
            )}
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