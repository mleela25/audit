'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  ImageIcon, 
  Download, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Search,
  Filter
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import DashboardLayout from '../dashboard-layout';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const COLORS = ['#8B5CF6', '#22D3EE', '#F43F5E', '#10B981', '#F59E0B'];

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  const API_URL = '/api/v1';

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/analytics/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock trend data
  const trendData = [
    { name: 'Mon', views: 400, downloads: 240 },
    { name: 'Tue', views: 300, downloads: 139 },
    { name: 'Wed', views: 200, downloads: 980 },
    { name: 'Thu', views: 278, downloads: 390 },
    { name: 'Fri', views: 189, downloads: 480 },
    { name: 'Sat', views: 239, downloads: 380 },
    { name: 'Sun', views: 349, downloads: 430 },
  ];

  const categoryData = [
    { name: 'Weddings', value: 400 },
    { name: 'Portraits', value: 300 },
    { name: 'Events', value: 300 },
    { name: 'Nature', value: 200 },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Business Analytics</h1>
            <p className="text-muted-foreground mt-1">Track your growth and client engagement.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Last 30 Days</span>
            </div>
            <button className="px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Clients', value: stats?.clients || 0, icon: Users, color: 'text-blue-400', trend: '+12.5%' },
            { label: 'Total Images', value: stats?.images || 0, icon: ImageIcon, color: 'text-purple-400', trend: '+5.2%' },
            { label: 'Bookings', value: stats?.bookings || 0, icon: Calendar, color: 'text-emerald-400', trend: '+18.7%' },
            { label: 'Downloads', value: stats?.downloads || 0, icon: Download, color: 'text-orange-400', trend: '+24.3%' },
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden group hover:border-white/20 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-2.5 rounded-xl bg-white/5", item.color)}>
                  <item.icon className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3" />
                  {item.trend}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">{item.label}</p>
                <h3 className="text-2xl font-bold mt-1">{item.value.toLocaleString()}</h3>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-semibold">Engagement Overview</h3>
                <p className="text-sm text-muted-foreground">Views vs Downloads this week</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-xs text-muted-foreground">Views</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-cyan-400" />
                  <span className="text-xs text-muted-foreground">Downloads</span>
                </div>
              </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorDownloads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22D3EE" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#ffffff40" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#ffffff40" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="views" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                  <Area type="monotone" dataKey="downloads" stroke="#22D3EE" strokeWidth={3} fillOpacity={1} fill="url(#colorDownloads)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Side Charts */}
          <div className="space-y-8">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-lg font-semibold mb-6">Popular Categories</h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                {categoryData.map((cat, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-muted-foreground">{cat.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-white/10">
              <div className="flex items-center gap-2 text-primary font-semibold mb-4">
                <Sparkles className="w-5 h-5" />
                <span>AI Prediction</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Based on current trends, your bookings are likely to increase by <span className="text-white font-bold">15%</span> next month.
              </p>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs flex items-center justify-between">
                <span>Confidence Score</span>
                <span className="text-emerald-400 font-bold">92%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
