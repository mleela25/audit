import React, { useState } from 'react';
import { X, Calendar, BookOpen, Clock } from 'lucide-react';

interface ExamFormProps {
  studentId: string;
  onClose: () => void;
}

export default function ExamForm({ studentId, onClose }: ExamFormProps) {
  const student = null; // TODO: Fetch from Firebase
  const [formData, setFormData] = useState({
    subject: '',
    examType: 'Weekly' as 'Weekly' | 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Annual',
    scheduledDate: '',
    chapters: [] as string[],
    syllabus: '',
    preparationStatus: 'Not Started' as 'Not Started' | 'In Progress' | 'Completed',
    estimatedPrepTime: ''
  });

  const [newChapter, setNewChapter] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically save the exam data
    console.log('Exam data:', formData);
    onClose();
  };

  const addChapter = () => {
    if (newChapter.trim() && !formData.chapters.includes(newChapter.trim())) {
      setFormData(prev => ({
        ...prev,
        chapters: [...prev.chapters, newChapter.trim()]
      }));
      setNewChapter('');
    }
  };

  const removeChapter = (chapter: string) => {
    setFormData(prev => ({
      ...prev,
      chapters: prev.chapters.filter(c => c !== chapter)
    }));
  };

  if (!student) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Add Upcoming Exam
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
              >
                <option value="">Select Subject</option>
                {student?.subjects?.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                )) || <option disabled>No subjects available</option>}
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
                <option value="Weekly">Weekly Test</option>
                <option value="Monthly">Monthly Test</option>
                <option value="Quarterly">Quarterly Exam</option>
                <option value="Half-Yearly">Half-Yearly Exam</option>
                <option value="Annual">Annual Exam</option>
              </select>
            </div>
          </div>

          {/* Scheduled Date and Prep Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scheduled Date *
              </label>
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Estimated Prep Time (days) *
              </label>
              <input
                type="number"
                value={formData.estimatedPrepTime}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedPrepTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 7"
                min="1"
                required
              />
            </div>
          </div>

          {/* Chapters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <BookOpen className="h-4 w-4 mr-1" />
              Chapters Included *
            </label>
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={newChapter}
                onChange={(e) => setNewChapter(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter chapter name"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addChapter())}
              />
              <button
                type="button"
                onClick={addChapter}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            {formData.chapters.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.chapters.map((chapter, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {chapter}
                    <button
                      type="button"
                      onClick={() => removeChapter(chapter)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Syllabus */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Syllabus Details *
            </label>
            <textarea
              value={formData.syllabus}
              onChange={(e) => setFormData(prev => ({ ...prev, syllabus: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Describe the exam syllabus and important topics..."
              required
            />
          </div>

          {/* Preparation Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Preparation Status
            </label>
            <select
              value={formData.preparationStatus}
              onChange={(e) => setFormData(prev => ({ ...prev, preparationStatus: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-lg hover:bg-orange-700"
            >
              Schedule Exam
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}