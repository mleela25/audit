import React, { useState } from 'react';
import { X, FileText, Calendar, User } from 'lucide-react';
import { examService } from '../../services/examService';
import { Student } from '../../types';

interface ExamFormProps {
  students: Student[];
  onClose: () => void;
  onExamAdded: () => void;
}

export default function ExamForm({ students, onClose, onExamAdded }: ExamFormProps) {
  const [formData, setFormData] = useState({
    studentId: '',
    subject: '',
    examType: 'Monthly' as 'Weekly' | 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Annual' | 'Unit Test' | 'Pre-Board' | 'Board Exam',
    chapter: '',
    totalMarks: '',
    obtainedMarks: '',
    date: new Date().toISOString().split('T')[0],
    remarks: ''
  });
  const [loading, setLoading] = useState(false);

  const examTypes = ['Weekly', 'Monthly', 'Quarterly', 'Half-Yearly', 'Annual', 'Unit Test', 'Pre-Board', 'Board Exam'];

  const calculateGrade = (percentage: number): string => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    if (percentage >= 33) return 'D';
    return 'F';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const totalMarks = parseInt(formData.totalMarks);
    const obtainedMarks = parseInt(formData.obtainedMarks);
    
    if (obtainedMarks > totalMarks) {
      alert('Obtained marks cannot be greater than total marks');
      return;
    }

    const percentage = (obtainedMarks / totalMarks) * 100;
    const grade = calculateGrade(percentage);
    const student = students.find(s => s.id === formData.studentId);

    if (!student) {
      alert('Please select a valid student');
      return;
    }

    try {
      setLoading(true);
      await examService.addExamResult({
        studentId: formData.studentId,
        studentName: student.name,
        subject: formData.subject,
        examType: formData.examType,
        chapter: formData.chapter,
        totalMarks,
        obtainedMarks,
        grade,
        percentage: Math.round(percentage * 100) / 100,
        date: formData.date,
        remarks: formData.remarks
      });
      onExamAdded();
    } catch (error) {
      console.error('Error adding exam result:', error);
      alert('Error adding exam result. Please try again.');
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
              <FileText className="h-5 w-5 mr-2" />
              Add Exam Result
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Student Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <User className="h-4 w-4 mr-1" />
              Select Student *
            </label>
            <select
              value={formData.studentId}
              onChange={(e) => setFormData(prev => ({ ...prev, studentId: e.target.value, subject: '' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Choose a student</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.name} - {student.school} (Grade {student.grade})
                </option>
              ))}
            </select>
          </div>

          {/* Subject and Exam Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exam Type *
              </label>
              <select
                value={formData.examType}
                onChange={(e) => setFormData(prev => ({ ...prev, examType: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {examTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Chapter and Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chapter/Topic *
              </label>
              <input
                type="text"
                value={formData.chapter}
                onChange={(e) => setFormData(prev => ({ ...prev, chapter: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Real Numbers, Photosynthesis"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Exam Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Marks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Marks *
              </label>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Obtained Marks *
              </label>
              <input
                type="number"
                value={formData.obtainedMarks}
                onChange={(e) => setFormData(prev => ({ ...prev, obtainedMarks: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 85"
                min="0"
                max={formData.totalMarks || undefined}
                required
              />
            </div>
          </div>

          {/* Grade Preview */}
          {formData.totalMarks && formData.obtainedMarks && (
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-900">Calculated Results:</span>
                <div className="flex space-x-4">
                  <span className="text-sm text-blue-700">
                    Percentage: {((parseInt(formData.obtainedMarks) / parseInt(formData.totalMarks)) * 100).toFixed(1)}%
                  </span>
                  <span className="text-sm font-medium text-blue-900">
                    Grade: {calculateGrade((parseInt(formData.obtainedMarks) / parseInt(formData.totalMarks)) * 100)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remarks (Optional)
            </label>
            <textarea
              value={formData.remarks}
              onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Any additional comments about the exam performance..."
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
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Exam Result'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}