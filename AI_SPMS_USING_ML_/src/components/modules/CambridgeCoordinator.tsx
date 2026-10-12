import React, { useState, useEffect } from 'react';
import { Award, Plus, CheckCircle, Clock, FileText, Grid, List } from 'lucide-react';
import { cambridgeService, paperCheckService, testService } from '../../services/moduleServices';
import { CambridgePaper } from '../../types/modules';
import { Student } from '../../types';
import { ViewMode } from '../../types/modules';
import { getStatusColor } from '../../services/moduleServices';

interface CambridgeCoordinatorProps {
  isAdmin: boolean;
  studentId?: string;
  students: Student[];
}

export default function CambridgeCoordinator({ isAdmin, studentId, students }: CambridgeCoordinatorProps) {
  const [papers, setPapers] = useState<CambridgePaper[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showForm, setShowForm] = useState(false);
  const [editingPaper, setEditingPaper] = useState<CambridgePaper | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPapers();
  }, [studentId]);

  const loadPapers = async () => {
    setLoading(true);
    try {
      const data = studentId 
        ? await cambridgeService.getByStudent(studentId)
        : await cambridgeService.getAll();
      setPapers(data);
    } catch (error) {
      console.error('Error loading Cambridge papers:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePaperStatus = async (paper: CambridgePaper, newStatus: CambridgePaper['status']) => {
    const updates: Partial<CambridgePaper> = { status: newStatus };
    const now = new Date().toISOString();

    switch (newStatus) {
      case 'Attempted':
        updates.attemptedDate = now;
        break;
      case 'Checked':
        updates.checkedDate = now;
        // Create paper check entry
        await paperCheckService.add({
          studentId: paper.studentId,
          studentName: paper.studentName,
          subject: paper.subject,
          paperType: 'Cambridge Paper',
          title: `${paper.paperCode} - ${paper.year} ${paper.variant}`,
          submittedDate: paper.attemptedDate || now,
          status: 'Checked',
          priority: 'Medium',
          estimatedTime: 60,
          marks: paper.marks,
          totalMarks: paper.totalMarks
        });
        break;
      case 'Feedback Given':
        updates.feedbackDate = now;
        break;
    }

    await cambridgeService.update(paper.id!, updates);
    loadPapers();
  };

  const addToTestTracker = async (paper: CambridgePaper) => {
    if (!paper.marks || !paper.totalMarks) return;

    const percentage = (paper.marks / paper.totalMarks) * 100;
    const grade = percentage >= 90 ? 'O' : percentage >= 80 ? 'A+' : percentage >= 70 ? 'A' : 
                  percentage >= 60 ? 'B+' : percentage >= 50 ? 'B' : percentage >= 40 ? 'C' : 'F';

    await testService.add({
      studentId: paper.studentId,
      studentName: paper.studentName,
      subject: paper.subject,
      testType: 'Final',
      chapter: `Cambridge ${paper.paperCode}`,
      totalMarks: paper.totalMarks,
      obtainedMarks: paper.marks,
      percentage,
      grade,
      date: paper.checkedDate || new Date().toISOString(),
      remarks: `Cambridge Paper ${paper.year} ${paper.variant}`
    });
  };

  const PaperCard = ({ paper }: { paper: CambridgePaper }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{paper.paperCode}</h3>
          <p className="text-sm text-gray-600">{paper.studentName} • {paper.subject}</p>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(paper.status)}`}>
          {paper.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <p><strong>Year:</strong> {paper.year}</p>
        <p><strong>Variant:</strong> {paper.variant}</p>
        <p><strong>Assigned:</strong> {new Date(paper.assignedDate).toLocaleDateString()}</p>
        
        {paper.attemptedDate && (
          <p><strong>Attempted:</strong> {new Date(paper.attemptedDate).toLocaleDateString()}</p>
        )}
        
        {paper.checkedDate && (
          <p><strong>Checked:</strong> {new Date(paper.checkedDate).toLocaleDateString()}</p>
        )}
        
        {paper.marks && paper.totalMarks && (
          <p><strong>Marks:</strong> {paper.marks}/{paper.totalMarks} ({((paper.marks/paper.totalMarks)*100).toFixed(1)}%)</p>
        )}
        
        {paper.feedback && (
          <p><strong>Feedback:</strong> {paper.feedback}</p>
        )}
      </div>

      {/* Progress Indicator */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Assigned</span>
          <span>Attempted</span>
          <span>Checked</span>
          <span>Feedback</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: paper.status === 'Assigned' ? '25%' :
                     paper.status === 'Attempted' ? '50%' :
                     paper.status === 'Checked' ? '75%' : '100%'
            }}
          ></div>
        </div>
      </div>

      {isAdmin && (
        <div className="flex flex-wrap gap-2">
          {paper.status === 'Assigned' && (
            <button
              onClick={() => updatePaperStatus(paper, 'Attempted')}
              className="flex-1 bg-blue-50 text-blue-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-100"
            >
              Mark Attempted
            </button>
          )}
          {paper.status === 'Attempted' && (
            <button
              onClick={() => updatePaperStatus(paper, 'Checked')}
              className="flex-1 bg-green-50 text-green-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-100"
            >
              Mark Checked
            </button>
          )}
          {paper.status === 'Checked' && (
            <>
              <button
                onClick={() => updatePaperStatus(paper, 'Feedback Given')}
                className="flex-1 bg-purple-50 text-purple-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-purple-100"
              >
                Give Feedback
              </button>
              <button
                onClick={() => addToTestTracker(paper)}
                className="flex-1 bg-orange-50 text-orange-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-orange-100"
              >
                Add to Tests
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );

  const statusCounts = papers.reduce((acc, paper) => {
    acc[paper.status] = (acc[paper.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Award className="h-6 w-6 mr-2" />
            Cambridge Paper Coordinator
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {isAdmin ? 'Manage Cambridge paper workflow' : 'Track your Cambridge paper progress'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Assign Paper
            </button>
          )}
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Assigned</p>
              <p className="text-2xl font-semibold text-gray-900">{statusCounts['Assigned'] || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Attempted</p>
              <p className="text-2xl font-semibold text-gray-900">{statusCounts['Attempted'] || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Checked</p>
              <p className="text-2xl font-semibold text-gray-900">{statusCounts['Checked'] || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <Award className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Feedback Given</p>
              <p className="text-2xl font-semibold text-gray-900">{statusCounts['Feedback Given'] || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Papers Display */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {papers.map(paper => (
            <PaperCard key={paper.id} paper={paper} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paper Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned Date</th>
                {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {papers.map(paper => (
                <tr key={paper.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {paper.studentName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{paper.subject}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{paper.paperCode}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{paper.year}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(paper.status)}`}>
                      {paper.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(paper.assignedDate).toLocaleDateString()}
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setEditingPaper(paper)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {papers.length === 0 && !loading && (
        <div className="text-center py-12">
          <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No Cambridge papers found.</p>
        </div>
      )}
    </div>
  );
}