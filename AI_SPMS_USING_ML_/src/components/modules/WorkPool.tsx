import React, { useState, useEffect } from 'react';
import { Target, Plus, TrendingUp, Zap, Grid, List, ArrowUp, ArrowDown } from 'lucide-react';
import { workPoolService, testService } from '../../services/moduleServices';
import { WorkPoolTask, TestResult } from '../../types/modules';
import { Student } from '../../types';
import { ViewMode } from '../../types/modules';
import { getPriorityColor, getStatusColor } from '../../services/moduleServices';

interface WorkPoolProps {
  isAdmin: boolean;
  studentId?: string;
  students: Student[];
}

export default function WorkPool({ isAdmin, studentId, students }: WorkPoolProps) {
  const [tasks, setTasks] = useState<WorkPoolTask[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<WorkPoolTask | null>(null);
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate' | 'subject'>('priority');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTasks();
    loadTestResults();
  }, [studentId]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = studentId 
        ? await workPoolService.getByStudent(studentId)
        : await workPoolService.getAll();
      setTasks(data);
    } catch (error) {
      console.error('Error loading work pool tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTestResults = async () => {
    try {
      const data = await testService.getAll();
      setTestResults(data);
    } catch (error) {
      console.error('Error loading test results:', error);
    }
  };

  // Intelligent priority adjustment based on test performance
  const adjustTaskPriority = (task: WorkPoolTask): WorkPoolTask => {
    const studentTests = testResults.filter(test => 
      test.studentId === task.studentId && test.subject === task.subject
    );
    
    if (studentTests.length === 0) return task;
    
    const latestTest = studentTests.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
    
    const avgPercentage = studentTests.reduce((sum, test) => sum + test.percentage, 0) / studentTests.length;
    
    let adjustedPriority = task.priority;
    
    if (latestTest.percentage < 40 || avgPercentage < 50) {
      adjustedPriority = 'High';
    } else if (latestTest.percentage < 60 || avgPercentage < 70) {
      adjustedPriority = 'Medium';
    } else {
      adjustedPriority = 'Low';
    }
    
    return { ...task, priority: adjustedPriority, autoPriority: true };
  };

  const sortedTasks = [...tasks]
    .map(adjustTaskPriority)
    .sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'dueDate':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'subject':
          return a.subject.localeCompare(b.subject);
        default:
          return 0;
      }
    });

  const TaskCard = ({ task }: { task: WorkPoolTask }) => {
    const adjustedTask = adjustTaskPriority(task);
    const isOverdue = new Date(task.dueDate) < new Date();
    
    return (
      <div className={`bg-white rounded-lg border-2 p-6 hover:shadow-md transition-shadow ${
        isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200'
      }`}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{task.task}</h3>
            <p className="text-sm text-gray-600">{task.studentName} • {task.subject}</p>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <div className="flex items-center space-x-1">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(adjustedTask.priority)}`}>
                {adjustedTask.priority}
              </span>
              {adjustedTask.autoPriority && (
                <Zap className="h-3 w-3 text-yellow-500" title="Auto-adjusted priority" />
              )}
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
              {task.status}
            </span>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <p className="text-sm text-gray-700">{task.description}</p>
          <p className={`text-sm ${isOverdue ? 'text-red-600 font-semibold' : ''}`}>
            <strong>Due Date:</strong> {new Date(task.dueDate).toLocaleDateString()}
            {isOverdue && <span className="ml-2 text-red-500">(OVERDUE)</span>}
          </p>
          <p><strong>Estimated Time:</strong> {task.estimatedTime} minutes</p>
          {task.actualTime && (
            <p><strong>Actual Time:</strong> {task.actualTime} minutes</p>
          )}
        </div>

        {/* Priority Justification */}
        {adjustedTask.autoPriority && adjustedTask.priority !== task.priority && (
          <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
            <div className="flex items-center">
              <Zap className="h-3 w-3 text-yellow-600 mr-1" />
              <span className="text-yellow-800">
                Priority auto-adjusted based on recent test performance
              </span>
            </div>
          </div>
        )}

        {/* Progress Indicator */}
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                task.status === 'Completed' ? 'bg-green-500' :
                task.status === 'In Progress' ? 'bg-blue-500' :
                isOverdue ? 'bg-red-500' : 'bg-yellow-500'
              }`}
              style={{ 
                width: task.status === 'Completed' ? '100%' :
                       task.status === 'In Progress' ? '50%' :
                       isOverdue ? '100%' : '25%'
              }}
            ></div>
          </div>
        </div>

        {isAdmin && (
          <div className="flex space-x-2">
            <button
              onClick={() => setEditingTask(task)}
              className="flex-1 bg-blue-50 text-blue-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-100"
            >
              Edit
            </button>
            {task.status !== 'Completed' && (
              <button
                onClick={() => {
                  workPoolService.update(task.id!, { status: 'Completed', actualTime: task.estimatedTime });
                  loadTasks();
                }}
                className="flex-1 bg-green-50 text-green-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-100"
              >
                Mark Complete
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  const priorityCounts = sortedTasks.reduce((acc, task) => {
    const adjustedTask = adjustTaskPriority(task);
    acc[adjustedTask.priority] = (acc[adjustedTask.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Target className="h-6 w-6 mr-2" />
            Student Work Pool
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {isAdmin ? 'Intelligent task assignment with auto-prioritization' : 'View your assigned tasks'}
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
              Create Task
            </button>
          )}
        </div>
      </div>

      {/* Smart Priority Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total Tasks</p>
              <p className="text-2xl font-semibold text-gray-900">{tasks.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
              <ArrowUp className="h-5 w-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">High Priority</p>
              <p className="text-2xl font-semibold text-red-600">{priorityCounts['High'] || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">
                {tasks.filter(t => t.status === 'Completed').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <Zap className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Auto-Prioritized</p>
              <p className="text-2xl font-semibold text-gray-900">
                {sortedTasks.filter(t => adjustTaskPriority(t).autoPriority).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Algorithm Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <Zap className="h-5 w-5 text-blue-600 mr-2" />
          <div>
            <p className="text-blue-800 font-medium">Smart Prioritization Active</p>
            <p className="text-blue-700 text-sm">
              Task priorities are automatically adjusted based on recent test performance. 
              Tasks for subjects with low scores get higher priority.
            </p>
          </div>
        </div>
      </div>

      {/* Sorting Controls */}
      <div className="flex space-x-4">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="priority">Sort by Priority</option>
          <option value="dueDate">Sort by Due Date</option>
          <option value="subject">Sort by Subject</option>
        </select>
        <div className="flex space-x-2">
          <button className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">High Priority</button>
          <button className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Auto-Adjusted</button>
          <button className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Due This Week</button>
        </div>
      </div>

      {/* Tasks Display */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedTasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedTasks.map(task => {
                const adjustedTask = adjustTaskPriority(task);
                const isOverdue = new Date(task.dueDate) < new Date();
                return (
                  <tr key={task.id} className={isOverdue ? 'bg-red-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{task.task}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.studentName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.subject}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(adjustedTask.priority)}`}>
                          {adjustedTask.priority}
                        </span>
                        {adjustedTask.autoPriority && (
                          <Zap className="h-3 w-3 text-yellow-500" title="Auto-adjusted" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                      {new Date(task.dueDate).toLocaleDateString()}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setEditingTask(task)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tasks.length === 0 && !loading && (
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No tasks found in the work pool.</p>
        </div>
      )}
    </div>
  );
}