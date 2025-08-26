import React from 'react';
// import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Users, MessageSquare, BookOpen, TrendingUp, Calendar, AlertTriangle } from 'lucide-react';

const HealthcareDashboard = () => {
  // const { t } = useTranslation();

  // Mock data for analytics
  const monthlyData = [
    { month: 'Jan', consultations: 45, queries: 120, stories: 23 },
    { month: 'Feb', consultations: 52, queries: 145, stories: 31 },
    { month: 'Mar', consultations: 48, queries: 133, stories: 28 },
    { month: 'Apr', consultations: 61, queries: 178, stories: 42 },
    { month: 'May', consultations: 55, queries: 156, stories: 38 },
    { month: 'Jun', consultations: 67, queries: 189, stories: 45 },
  ];

  const topicDistribution = [
    { name: 'STI Prevention', value: 35, color: '#3B82F6' },
    { name: 'Contraception', value: 28, color: '#10B981' },
    { name: 'Puberty', value: 20, color: '#F59E0B' },
    { name: 'Relationships', value: 17, color: '#EF4444' },
  ];

  const pendingStories = [
    { id: '1', content: 'Story about teenage pregnancy concerns...', submitted: '2 hours ago', category: 'Pregnancy' },
    { id: '2', content: 'Experience with contraceptive methods...', submitted: '4 hours ago', category: 'Contraception' },
    { id: '3', content: 'Questions about puberty changes...', submitted: '6 hours ago', category: 'Puberty' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome Dr. Smith</h1>
        <p className="mt-2 text-gray-600">
          Monitor platform activity and manage content moderation
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">2,453</p>
              <p className="text-sm text-gray-600">Active Users</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <MessageSquare className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">189</p>
              <p className="text-sm text-gray-600">Monthly Queries</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">67</p>
              <p className="text-sm text-gray-600">Consultations</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">3</p>
              <p className="text-sm text-gray-600">Pending Reviews</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Activity Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="consultations" fill="#3B82F6" name="Consultations" />
              <Bar dataKey="queries" fill="#10B981" name="Queries" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Topic Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Query Topics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={topicDistribution}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {topicDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pending Content Review */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
          Pending Story Reviews
        </h3>
        <div className="space-y-4">
          {pendingStories.map((story) => (
            <div key={story.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {story.category}
                </span>
                <span className="text-sm text-gray-500">{story.submitted}</span>
              </div>
              <p className="text-gray-700 mb-3">{story.content}</p>
              <div className="flex space-x-3">
                <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm">
                  Approve
                </button>
                <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm">
                  Reject
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm">
                  Request Changes
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HealthcareDashboard;