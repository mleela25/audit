import React, { useState, useEffect } from 'react';
import { X, User, School, Phone, Mail, MapPin, Save } from 'lucide-react';
import { studentService } from '../../services/studentService';
import { Student } from '../../types';

interface StudentEditFormProps {
  student: Student;
  onClose: () => void;
  onStudentUpdated: () => void;
}

export default function StudentEditForm({ student, onClose, onStudentUpdated }: StudentEditFormProps) {
  const [formData, setFormData] = useState({
    name: student.name,
    school: student.school,
    class: student.class,
    grade: student.grade,
    batch: student.batch,
    parentName: student.parentName,
    parentPhone: student.parentPhone,
    email: student.email || '',
    address: student.address,
    schoolType: student.schoolType,
    examPattern: student.examPattern,
    subjects: student.subjects
  });
  const [loading, setLoading] = useState(false);

  const schoolTypes = ['CBSE', 'ICSE', 'IGCSE', 'GSEB', 'IB', 'Cambridge', 'State Board'];
  const examPatterns = ['Monthly', 'Quarterly', 'Half-Yearly', 'Annual', 'Continuous'];
  const timeSlots = ['3:00 PM - 4:30 PM', '4:30 PM - 6:00 PM', '6:00 PM - 8:00 PM'];
  const availableSubjects = [
    'Mathematics', 'Science', 'English', 'Physics', 'Chemistry', 'Biology', 
    'History', 'Geography', 'Hindi', 'Gujarati', 'Sanskrit', 'Computer Science',
    'Physical Education', 'Social Studies', 'Global Perspectives', 'ICT',
    'Theory of Knowledge', 'Extended Essay', 'Business Studies', 'Economics',
    'Art & Design', 'Music', 'Drama'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.subjects.length === 0) {
      alert('Please select at least one subject');
      return;
    }

    try {
      setLoading(true);
      await studentService.updateStudent(student.id, formData);
      onStudentUpdated();
    } catch (error) {
      console.error('Error updating student:', error);
      alert('Error updating student. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectChange = (subject: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        subjects: [...prev.subjects, subject]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        subjects: prev.subjects.filter(s => s !== subject)
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Edit Student Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade *
                </label>
                <select
                  value={formData.grade}
                  onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value, class: `${e.target.value}th` }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Grade</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* School Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <School className="h-5 w-5 mr-2" />
              School Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School Name *
                </label>
                <input
                  type="text"
                  value={formData.school}
                  onChange={(e) => setFormData(prev => ({ ...prev, school: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Board *
                </label>
                <select
                  value={formData.schoolType}
                  onChange={(e) => setFormData(prev => ({ ...prev, schoolType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {schoolTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exam Pattern *
                </label>
                <select
                  value={formData.examPattern}
                  onChange={(e) => setFormData(prev => ({ ...prev, examPattern: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {examPatterns.map(pattern => (
                    <option key={pattern} value={pattern}>{pattern}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Slot *
                </label>
                <select
                  value={formData.batch}
                  onChange={(e) => setFormData(prev => ({ ...prev, batch: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Time Slot</option>
                  {timeSlots.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Subjects */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Subjects * (Select all applicable subjects)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-4">
              {availableSubjects.map(subject => (
                <label key={subject} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.subjects.includes(subject)}
                    onChange={(e) => handleSubjectChange(subject, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{subject}</span>
                </label>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Selected: {formData.subjects.length} subjects
            </p>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Phone className="h-5 w-5 mr-2" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parent Name *
                </label>
                <input
                  type="text"
                  value={formData.parentName}
                  onChange={(e) => setFormData(prev => ({ ...prev, parentName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parent Phone *
                </label>
                <input
                  type="tel"
                  value={formData.parentPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, parentPhone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  required
                />
              </div>
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
              {loading ? 'Updating...' : 'Update Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}