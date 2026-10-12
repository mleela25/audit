import React from 'react';
import { Users, BookOpen, ClipboardCheck, TrendingUp } from 'lucide-react';

const stats = [
  {
    name: 'Total Students',
    value: '0',
    icon: Users,
    change: '+4.75%',
    changeType: 'positive' as const,
    color: 'bg-blue-500',
  },
  {
    name: 'Active Classes',
    value: '0',
    icon: BookOpen,
    change: '+54.02%',
    changeType: 'positive' as const,
    color: 'bg-green-500',
  },
  {
    name: 'Pending Homework',
    value: '0',
    icon: ClipboardCheck,
    change: '-1.39%',
    changeType: 'negative' as const,
    color: 'bg-orange-500',
  },
  {
    name: 'Average Score',
    value: '85.5%',
    icon: TrendingUp,
    change: '+10.18%',
    changeType: 'positive' as const,
    color: 'bg-purple-500',
  },
];

const recentActivities = [
  { id: 1, student: 'Aarav Sharma', action: 'Submitted homework', subject: 'Mathematics', time: '2 hours ago' },
  { id: 2, student: 'Priya Patel', action: 'Completed test', subject: 'English', time: '4 hours ago' },
  { id: 3, student: 'Arjun Singh', action: 'Attended class', subject: 'Physics', time: '1 day ago' },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className={`${stat.color} rounded-lg p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  <p className={`ml-2 text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activities and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activities</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.student}</span> {activity.action}
                    </p>
                    <p className="text-xs text-gray-500">{activity.subject} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <Users className="h-8 w-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-blue-700">Add Student</span>
              </button>
              <button className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <BookOpen className="h-8 w-8 text-green-600 mb-2" />
                <span className="text-sm font-medium text-green-700">Record Class</span>
              </button>
              <button className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                <ClipboardCheck className="h-8 w-8 text-orange-600 mb-2" />
                <span className="text-sm font-medium text-orange-700">Assign Homework</span>
              </button>
              <button className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <TrendingUp className="h-8 w-8 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-purple-700">View Reports</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Upcoming Events</h3>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-blue-900">Monthly Test - Mathematics</p>
                <p className="text-sm text-blue-700">Morning Batch A</p>
              </div>
              <span className="text-sm font-medium text-blue-600">Tomorrow, 9:00 AM</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium text-green-900">Parent-Teacher Meeting</p>
                <p className="text-sm text-green-700">All Batches</p>
              </div>
              <span className="text-sm font-medium text-green-600">Dec 25, 10:00 AM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}