'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ImageIcon, 
  Users, 
  HardDrive, 
  Calendar, 
  Sparkles, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  Upload, 
  Plus, 
  UserPlus, 
  ShieldCheck,
  ChevronRight,
  MoreVertical,
  Clock,
  ExternalLink,
  Settings
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  AreaChart, 
  Area 
} from 'recharts';
import DashboardLayout from './dashboard-layout';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useToast } from '@/components/UI/ToastProvider';

const categoryData = [
  { name: 'Wedding', value: 45 },
  { name: 'Portrait', value: 25 },
  { name: 'Event', value: 15 },
  { name: 'Nature', value: 10 },
  { name: 'Studio', value: 5 },
];

const uploadActivityData = [
  { name: 'Jan', uploads: 400 },
  { name: 'Feb', uploads: 300 },
  { name: 'Mar', uploads: 600 },
  { name: 'Apr', uploads: 800 },
  { name: 'May', uploads: 500 },
  { name: 'Jun', uploads: 900 },
  { name: 'Jul', uploads: 1200 },
];

const COLORS = ['#8B5CF6', '#22D3EE', '#F43F5E', '#10B981', '#F59E0B'];



export default function Dashboard() {
  const { showToast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [activityData, setActivityData] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const API_URL = '/api/v1';

  const router = useRouter();

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      if (storedUser) setUser(JSON.parse(storedUser));

      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [statsRes, activityRes, imagesRes] = await Promise.all([
        fetch(`${API_URL}/analytics/stats`, { headers }),
        fetch(`${API_URL}/analytics/activity`, { headers }),
        fetch(`${API_URL}/images`, { headers })
      ]);
      
      const statsData = await statsRes.json();
      const actData = await activityRes.json();
      const imagesData = await imagesRes.json();
      
      if (statsData.success) setStats(statsData.data);
      if (actData.success) setActivityData(actData.data);
      if (imagesData.success && Array.isArray(imagesData.data)) {
        setImages(imagesData.data.slice(0, 6));
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:5001${url}`;
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpload = async () => {
    try {
      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientName: 'John Doe', album: 'Summer Shoot' })
      });
      if (res.ok) {
        // Refresh data to show new activity
        showToast('Photos uploaded and AI processed!', 'success');
        fetchData();
      } else {
        showToast('Quick upload failed', 'error');
      }
    } catch (error) {
      console.error('Upload failed', error);
      showToast('Connection error', 'error');
    }
  };

  const kpiData = [
    { title: 'Total Images', value: stats?.images || '...', icon: ImageIcon, growth: '+12%', isPositive: true, href: '/albums' },
    { title: 'Active Clients', value: stats?.clients || '...', icon: Users, growth: '+5%', isPositive: true, href: '/clients' },
    { title: 'Storage Used', value: stats?.storageUsed || '...', icon: HardDrive, growth: '-2%', isPositive: false, href: '/settings' },
    { title: 'Bookings', value: stats?.bookings || '...', icon: Calendar, growth: '+8%', isPositive: true, href: '/bookings' },
    { title: 'AI Tagged', value: stats?.aiTagged || '...', icon: Sparkles, growth: '+15%', isPositive: true, href: '/ai-insights' },
    { title: 'Downloads', value: stats?.downloads || '...', icon: Download, growth: '+24%', isPositive: true, href: '/analytics' },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-[80vh] flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted font-medium">Powering up AI insights...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome back, John Doe</h1>
            <p className="text-muted">Manage your photography business intelligently</p>
          </div>
          <div className="flex items-center space-x-3">
             <button 
               onClick={() => router.push('/analytics')}
               className="flex items-center space-x-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-sm font-medium"
             >
                <Clock className="w-4 h-4 text-accent" />
                <span>Recent Activity</span>
              </button>
              <button 
                onClick={() => router.push('/albums')}
                className="btn-primary flex items-center space-x-2 shadow-accent/20"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Photos</span>
              </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {kpiData.map((kpi, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => router.push(kpi.href)}
              className="glass-card p-5 hover:border-white/30 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 rounded-xl bg-accent/10 border border-accent/20 text-accent group-hover:bg-accent group-hover:text-white transition-all">
                  <kpi.icon className="w-5 h-5" />
                </div>
                <div className={cn(
                  "flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                  kpi.isPositive ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                )}>
                  {kpi.isPositive ? <TrendingUp size={10} className="mr-1" /> : <TrendingDown size={10} className="mr-1" />}
                  {kpi.growth}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">{kpi.title}</p>
                <p className="text-2xl font-bold text-white tracking-tight">{kpi.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Main Analytics Area */}
          <div className="xl:col-span-8 space-y-6">
            {/* AI Insights & Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {/* Upload Activity Line Chart */}
               <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-white">Upload Activity</h3>
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-accent"></span>
                    <span className="text-xs text-muted">Last 7 months</span>
                  </div>
                </div>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={uploadActivityData}>
                      <defs>
                        <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                        itemStyle={{ color: '#E5E7EB' }}
                      />
                      <Area type="monotone" dataKey="uploads" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorUploads)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Image Categories Bar Chart */}
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-white">Image Categories</h3>
                  <button 
                    onClick={() => router.push('/albums')}
                    className="text-xs text-accent hover:underline"
                  >
                    View all
                  </button>
                </div>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                      <Tooltip 
                        cursor={{fill: 'rgba(255,255,255,0.05)'}}
                        contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                      />
                      <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Client Activity Table */}
            <div className="glass-card overflow-hidden">
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Client Activity</h3>
                  <p className="text-xs text-muted">Monitor recent interactions with your galleries</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/[0.02] text-muted text-[11px] uppercase tracking-wider font-bold">
                      <th className="px-6 py-4">S. No.</th>
                      <th className="px-6 py-4">Client Name</th>
                      <th className="px-6 py-4">Activity</th>
                      <th className="px-6 py-4">Album</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {activityData?.activity?.map((act: any, idx: number) => (
                      <tr key={act.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4 text-sm text-muted">{idx + 1}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-[10px] font-bold text-accent border border-accent/20">
                              {act.client_name.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="text-sm font-semibold text-white">{act.client_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-muted">{act.activity}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <ImageIcon size={14} className="text-secondary" />
                            <span className="text-sm text-muted">{act.album}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted">{act.date}</td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => router.push(`/clients?view=${act.client_name}`)}
                            className="px-3 py-1 bg-accent/10 text-accent hover:bg-accent hover:text-white rounded-lg text-xs font-bold transition-all"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Uploads Gallery */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Recent Uploads</h3>
                <button 
                  onClick={() => router.push('/albums')}
                  className="text-sm text-accent hover:underline flex items-center"
                >
                  View full gallery <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {images.map((img) => (
                  <motion.div 
                    key={img.id}
                    whileHover={{ scale: 1.05 }}
                    className="relative group aspect-square rounded-2xl overflow-hidden glass-card cursor-pointer"
                  >
                    <img src={getImageUrl(img.compressed_url || img.original_url)} alt="Gallery" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                      <div className="flex flex-wrap gap-1">
                        {img.tags?.split(',').map((tag: string) => (
                          <span key={tag} className="text-[8px] bg-accent/80 text-white px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar Widgets */}
          <div className="xl:col-span-4 space-y-6">
            {/* Quick Actions Panel */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-white mb-6">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Upload Images', icon: Upload, color: 'text-accent', href: '/albums' },
                  { label: 'Create Album', icon: Plus, color: 'text-purple-400', href: '/albums' },
                  { label: 'Add Client', icon: UserPlus, color: 'text-blue-400', href: '/clients' },
                  { label: 'Watermark', icon: ShieldCheck, color: 'text-emerald-400', href: '/watermarking', adminOrPhotographer: true },
                ].filter(action => !action.adminOrPhotographer || user?.role === 'admin' || user?.role === 'photographer').map((action, i) => (
                  <button 
                    key={i} 
                    onClick={() => router.push(action.href)}
                    className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
                  >
                    <div className={cn("p-2 rounded-xl bg-white/5 mb-2 group-hover:scale-110 transition-transform", action.color)}>
                      <action.icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-muted group-hover:text-white transition-colors">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Insights Panel */}
            <div className="glass-card p-6 relative overflow-hidden">
              <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-accent/20 blur-2xl rounded-full"></div>
              <div className="flex items-center space-x-2 mb-6">
                <Sparkles className="w-5 h-5 text-accent" />
                <h3 className="text-lg font-bold text-white">AI Insights</h3>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl hover:border-accent/20 transition-all">
                  <p className="text-xs text-muted mb-1 uppercase font-bold tracking-wider">Top Performing</p>
                  <p className="text-sm text-white font-semibold">"Summer Wedding 2024" has 240+ downloads</p>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl hover:border-accent/20 transition-all">
                  <p className="text-xs text-muted mb-1 uppercase font-bold tracking-wider">Most Selected</p>
                  <p className="text-sm text-white font-semibold">Clients prefer B&W portraits this week</p>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl hover:border-accent/20 transition-all">
                  <p className="text-xs text-muted mb-1 uppercase font-bold tracking-wider">Trending Style</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-white font-semibold">Cinematic Low-light</p>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full">+45%</span>
                  </div>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl hover:border-accent/20 transition-all">
                  <p className="text-xs text-muted mb-1 uppercase font-bold tracking-wider">Engagement Score</p>
                  <div className="flex items-center space-x-3 mt-2">
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-accent to-secondary w-[85%]"></div>
                    </div>
                    <span className="text-sm font-bold text-white">8.5/10</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Shoots Section */}
            <div className="glass-card overflow-hidden">
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Upcoming Shoots</h3>
                <button className="text-xs text-accent hover:underline">View All</button>
              </div>
              <div className="divide-y divide-white/5">
                {activityData?.bookings?.map((shoot: any, i: number) => (
                  <div key={i} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-all">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xs font-bold text-muted border border-white/10">
                        {shoot.client_name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{shoot.client_name}</p>
                        <p className="text-[10px] text-muted">{shoot.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-white">{shoot.shoot_date}</p>
                      <button className="text-[10px] text-accent hover:underline flex items-center justify-end">
                        Details <ChevronRight size={10} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

             {/* Security & Permissions */}
             {(user?.role === 'admin' || user?.role === 'photographer') && (
                <div className="glass-card p-6 bg-[#0A0A0A]/80">
                 <div className="flex items-center space-x-2 mb-6">
                   <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                     <ShieldCheck className="w-5 h-5" />
                   </div>
                   <h3 className="text-lg font-bold text-white">Security Status</h3>
                 </div>
                 <div className="space-y-1 bg-white/[0.03] rounded-2xl border border-white/5 overflow-hidden divide-y divide-white/5">
                   <div className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
                     <div className="flex items-center space-x-3">
                       <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
                         <Download className="w-4 h-4" />
                       </div>
                       <span className="text-sm font-semibold text-white">Download Control</span>
                     </div>
                     <div className="w-10 h-5 bg-accent rounded-full relative p-1 cursor-pointer">
                       <div className="w-3 h-3 bg-white rounded-full absolute right-1"></div>
                     </div>
                   </div>
                   <div className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
                     <div className="flex items-center space-x-3">
                       <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                         <ShieldCheck className="w-4 h-4" />
                       </div>
                       <span className="text-sm font-semibold text-white">Auto-Watermark</span>
                     </div>
                     <div className="w-10 h-5 bg-accent rounded-full relative p-1 cursor-pointer">
                       <div className="w-3 h-3 bg-white rounded-full absolute right-1"></div>
                     </div>
                   </div>
                 </div>
                 
                 {user?.role === 'admin' && (
                   <button 
                     onClick={() => router.push('/permissions')}
                     className="w-full mt-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-white/10 transition-all flex items-center justify-center space-x-2"
                   >
                     <Settings className="w-3 h-3" />
                     <span>Configure Permissions</span>
                   </button>
                 )}
               </div>
              )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
