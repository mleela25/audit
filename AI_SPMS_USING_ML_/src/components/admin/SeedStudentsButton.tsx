import React, { useState } from 'react';
import { Upload, CheckCircle, XCircle, Loader } from 'lucide-react';
import { studentService } from '../../services/studentService';
import { sampleStudents } from '../../data/seedStudents';

export default function SeedStudentsButton() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSeedStudents = async () => {
    setLoading(true);
    setStatus('idle');
    setMessage('');
    
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const studentData of sampleStudents) {
        try {
          await studentService.addStudent(studentData);
          successCount++;
        } catch (error) {
          console.error('Error adding student:', error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        setStatus('success');
        setMessage(`Successfully added ${successCount} students${errorCount > 0 ? ` (${errorCount} failed)` : ''}`);
      } else {
        setStatus('error');
        setMessage('Failed to add students. They may already exist.');
      }
    } catch (error) {
      console.error('Error seeding students:', error);
      setStatus('error');
      setMessage('An error occurred while adding students.');
    } finally {
      setLoading(false);
      // Clear message after 5 seconds
      setTimeout(() => {
        setMessage('');
        setStatus('idle');
      }, 5000);
    }
  };

  return (
    <div className="mb-6">
      <button
        onClick={handleSeedStudents}
        disabled={loading}
        className={`
          w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all
          ${loading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
          }
          ${status === 'success' ? 'bg-green-600' : ''}
          ${status === 'error' ? 'bg-red-600' : ''}
          text-white
        `}
      >
        {loading ? (
          <>
            <Loader className="h-5 w-5 animate-spin" />
            <span>Adding Students...</span>
          </>
        ) : status === 'success' ? (
          <>
            <CheckCircle className="h-5 w-5" />
            <span>Students Added!</span>
          </>
        ) : status === 'error' ? (
          <>
            <XCircle className="h-5 w-5" />
            <span>Error Adding Students</span>
          </>
        ) : (
          <>
            <Upload className="h-5 w-5" />
            <span>Add Sample Students (15)</span>
          </>
        )}
      </button>
      
      {message && (
        <div className={`mt-2 px-4 py-2 rounded-lg ${
          status === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}

