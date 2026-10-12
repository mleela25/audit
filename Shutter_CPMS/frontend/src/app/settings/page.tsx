'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Settings, 
  Shield, 
  Bell, 
  Database, 
  Cloud, 
  Lock, 
  User, 
  Mail,
  Smartphone,
  Globe,
  Save,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  HardDrive,
  ChevronRight,
  Type,
  Camera,
  Moon,
  Sun,
  Clock,
  CreditCard,
  FileText,
  Monitor,
  Fingerprint,
  History,
  Upload
} from 'lucide-react';
import DashboardLayout from '../dashboard-layout';
import { useToast } from '@/components/UI/ToastProvider';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SystemSettings {
  watermark_text: string;
  watermark_opacity: number;
  watermark_size: number;
  watermark_position: string;
  watermark_color: string;
  compression_quality: number;
  allow_client_downloads: boolean;
  ai_tagging_enabled: boolean;
}

export default function SettingsPage() {
  const { showToast } = useToast();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [settings, setSettings] = useState<SystemSettings>({
    watermark_text: 'Shutter CMS',
    watermark_opacity: 0.5,
    watermark_size: 20,
    watermark_position: 'bottom-right',
    watermark_color: '#ffffff',
    compression_quality: 80,
    allow_client_downloads: true,
    ai_tagging_enabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'storage' | 'billing' | 'preferences' | 'about'>('general');
  const [stats, setStats] = useState<any>(null);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    bio: '',
    language: 'English',
    timezone: 'UTC+0'
  });
  const [preferences, setPreferences] = useState({
    darkMode: true,
    emailNotifications: true,
    pushNotifications: false
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const API_URL = '/api/v1';

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setProfileData({
          name: parsedUser.name || '',
          email: parsedUser.email || '',
          bio: parsedUser.bio || '',
          language: parsedUser.language || 'English',
          timezone: parsedUser.timezone || 'UTC+0'
        });
        if (parsedUser.role === 'client') {
          router.push('/');
          return;
        }
      } catch (e) {
        console.error('Failed to parse user', e);
        router.push('/login');
        return;
      }
    } else {
      router.push('/login');
      return;
    }
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const [settingsRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/settings`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/analytics/stats`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (settingsRes.ok) {
        const data = await settingsRes.json();
        if (data.success && data.data) {
          setSettings(prev => ({ ...prev, ...data.data }));
        }
      }

      if (statsRes.ok) {
        const data = await statsRes.json();
        if (data.success) {
          setStats(data.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
      showToast('Failed to load settings data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      
      // Update system settings
      const settingsRes = await fetch(`${API_URL}/settings`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      
      // Check response status and content type before parsing JSON
      let settingsData = { success: false, error: 'Request failed' };
      
      if (settingsRes.ok) {
        const contentType = settingsRes.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          settingsData = await settingsRes.json();
        } else {
          const text = await settingsRes.text();
          console.error('Non-JSON response from settings API:', text);
          settingsData.error = `Server returned non-JSON response: ${settingsRes.status}`;
        }
      } else {
        settingsData.error = `Settings update failed: ${settingsRes.status} ${settingsRes.statusText}`;
      }
      
      // Update profile
      const profileRes = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      
      let profileResult = { success: false, error: 'Request failed' };
      
      if (profileRes.ok) {
        const contentType = profileRes.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          profileResult = await profileRes.json();
        } else {
          const text = await profileRes.text();
          console.error('Non-JSON response from profile API:', text);
          profileResult.error = `Server returned non-JSON response: ${profileRes.status}`;
        }
      } else {
        profileResult.error = `Profile update failed: ${profileRes.status} ${profileRes.statusText}`;
      }
      
      if (settingsData.success && profileResult.success) {
        showToast('Settings and profile updated successfully', 'success');
      } else {
        // Provide specific error messages for each failed operation
        let errorMessage = 'Failed to update settings';
        if (!settingsData.success && settingsData.error) {
          errorMessage = `Settings: ${settingsData.error}`;
        }
        if (!profileResult.success && profileResult.error) {
          errorMessage = errorMessage === 'Failed to update settings' 
            ? `Profile: ${profileResult.error}` 
            : `${errorMessage}, Profile: ${profileResult.error}`;
        }
        showToast(errorMessage, 'error');
      }
    } catch (error) {
      console.error('Save error:', error);
      // Provide more specific error information
      if (error instanceof Error) {
        showToast(`Save failed: ${error.message}`, 'error');
      } else {
        showToast('Failed to save settings - connection error', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/users/password`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Password updated successfully', 'success');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        showToast(data.error || 'Failed to update password', 'error');
      }
    } catch (error) {
      showToast('Connection error', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Settings, color: 'bg-blue-500' },
    { id: 'security', label: 'Security', icon: Shield, color: 'bg-rose-500' },
    { id: 'storage', label: 'Storage', icon: HardDrive, color: 'bg-emerald-500' },
    { id: 'billing', label: 'Billing', icon: Database, color: 'bg-amber-500' },
    { id: 'preferences', label: 'Preferences', icon: Bell, color: 'bg-indigo-500' },
    { id: 'about', label: 'About Studio', icon: Smartphone, color: 'bg-purple-500' },
  ] as const;

  type TabId = typeof tabs[number]['id'];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white">Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your studio preferences and system configurations.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Mobile-Style Navigation Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#0A0A0A] border border-white/5 rounded-[2rem] overflow-hidden p-2 shadow-2xl">
              <div className="space-y-0.5">
                {tabs.map((tab, i) => (
                  <React.Fragment key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group",
                        activeTab === tab.id 
                          ? "bg-white/10 text-white" 
                          : "text-muted-foreground hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn("p-2 rounded-xl text-white shadow-lg", tab.color)}>
                          <tab.icon className="w-5 h-5" />
                        </div>
                        <span className="font-semibold text-sm">{tab.label}</span>
                      </div>
                      <ChevronRight size={16} className={cn(
                        "transition-transform",
                        activeTab === tab.id ? "text-white translate-x-1" : "text-white/20 group-hover:text-white/40 group-hover:translate-x-0.5"
                      )} />
                    </button>
                    {i < tabs.length - 1 && <div className="h-[1px] bg-white/[0.02] mx-4" />}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="bg-[#0A0A0A] border border-white/5 rounded-[2rem] overflow-hidden p-2 shadow-2xl">
              <button className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-xl bg-rose-500 text-white shadow-lg">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-sm">Delete Account</span>
                </div>
                <ChevronRight size={16} className="text-rose-500/20 group-hover:text-rose-500/40 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>

          {/* Settings Content Area */}
          <div className="lg:col-span-8">
            <div className="bg-[#0A0A0A] border border-white/5 rounded-[2.5rem] min-h-[600px] shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
              
              <div className="p-8 relative">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-white capitalize">{activeTab.replace('-', ' ')}</h2>
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 rounded-full bg-white text-black font-bold text-sm hover:bg-white/90 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <Save size={16} />}
                    Done
                  </button>
                </div>

                {activeTab === 'general' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    {/* Profile Section */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Studio Identity</label>
                      <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 space-y-6">
                        <div className="flex items-center gap-6 pb-6 border-b border-white/5">
                          <div className="relative group cursor-pointer">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-purple-600 p-1">
                              <div className="w-full h-full rounded-full bg-[#0A0A0A] flex items-center justify-center text-white font-black text-2xl overflow-hidden">
                                {profileData.name?.substring(0, 2).toUpperCase() || 'ST'}
                              </div>
                            </div>
                            <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Camera size={20} className="text-white" />
                            </div>
                            <input type="file" className="hidden" accept="image/*" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-white">{profileData.name || 'Studio Name'}</h3>
                            <p className="text-sm text-muted-foreground">{profileData.email}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-white/50 ml-1 flex items-center gap-2">
                              <User size={12} /> Full Name
                            </label>
                            <input 
                              type="text" 
                              value={profileData.name}
                              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                              className="w-full bg-white/5 border-none rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-white/20 transition-all"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-white/50 ml-1 flex items-center gap-2">
                              <Mail size={12} /> Studio Email
                            </label>
                            <input 
                              type="email" 
                              value={profileData.email}
                              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                              className="w-full bg-white/5 border-none rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-white/20 transition-all"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-white/50 ml-1 flex items-center gap-2">
                              <Globe size={12} /> Language
                            </label>
                            <select 
                              value={profileData.language}
                              onChange={(e) => setProfileData({ ...profileData, language: e.target.value })}
                              className="w-full bg-white/5 border-none rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-white/20 transition-all appearance-none"
                            >
                              <option>English</option>
                              <option>Spanish</option>
                              <option>French</option>
                              <option>German</option>
                              <option>Portuguese</option>
                              <option>Russian</option>
                              <option>Japanese</option>
                              <option>Chinese</option>
                              <option>Korean</option>
                              <option>Arabic</option>
                              <option>Hindi</option>
                              <option>Italian</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-white/50 ml-1 flex items-center gap-2">
                              <Clock size={12} /> Timezone
                            </label>
                            <select 
                              value={profileData.timezone}
                              onChange={(e) => setProfileData({ ...profileData, timezone: e.target.value })}
                              className="w-full bg-white/5 border-none rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-white/20 transition-all appearance-none"
                            >
                              <option value="UTC-12">UTC-12:00</option>
                              <option value="UTC-11">UTC-11:00</option>
                              <option value="UTC-10">UTC-10:00 (Honolulu)</option>
                              <option value="UTC-9">UTC-09:00 (Anchorage)</option>
                              <option value="UTC-8">UTC-08:00 (Los Angeles)</option>
                              <option value="UTC-7">UTC-07:00 (Denver)</option>
                              <option value="UTC-6">UTC-06:00 (Chicago)</option>
                              <option value="UTC-5">UTC-05:00 (New York)</option>
                              <option value="UTC-4">UTC-04:00 (Halifax)</option>
                              <option value="UTC-3">UTC-03:00 (Buenos Aires)</option>
                              <option value="UTC+0">UTC+00:00 (London)</option>
                              <option value="UTC+1">UTC+01:00 (Paris)</option>
                              <option value="UTC+2">UTC+02:00 (Cairo)</option>
                              <option value="UTC+3">UTC+03:00 (Moscow)</option>
                              <option value="UTC+4">UTC+04:00 (Dubai)</option>
                              <option value="UTC+5">UTC+05:00 (Karachi)</option>
                              <option value="UTC+5:30">UTC+05:30 (Indian Standard Time)</option>
                              <option value="UTC+6">UTC+06:00 (Dhaka)</option>
                              <option value="UTC+7">UTC+07:00 (Bangkok)</option>
                              <option value="UTC+8">UTC+08:00 (Singapore)</option>
                              <option value="UTC+9">UTC+09:00 (Tokyo)</option>
                              <option value="UTC+10">UTC+10:00 (Sydney)</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'security' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Access & Protection</label>
                      <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 space-y-8">
                        <form onSubmit={handleUpdatePassword} className="space-y-6">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-white/50 ml-1">Current Password</label>
                              <input 
                                type="password" 
                                required
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                className="w-full bg-white/5 border-none rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-white/20 transition-all"
                              />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-white/50 ml-1">New Password</label>
                                <input 
                                  type="password" 
                                  required
                                  value={passwordData.newPassword}
                                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                  className="w-full bg-white/5 border-none rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-white/20 transition-all"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-white/50 ml-1">Confirm New Password</label>
                                <input 
                                  type="password" 
                                  required
                                  value={passwordData.confirmPassword}
                                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                  className="w-full bg-white/5 border-none rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-white/20 transition-all"
                                />
                              </div>
                            </div>
                          </div>
                          <button 
                            type="submit"
                            disabled={saving}
                            className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all disabled:opacity-50"
                          >
                            {saving ? 'Updating...' : 'Change Password'}
                          </button>
                        </form>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Security Features</label>
                      <div className="bg-white/[0.03] border border-white/5 rounded-3xl overflow-hidden divide-y divide-white/5">
                        <div className="p-6 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
                              <Fingerprint size={20} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">Two-Factor Auth (2FA)</p>
                              <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
                            </div>
                          </div>
                          <div className="w-12 h-6 rounded-full bg-white/10 relative p-1 cursor-pointer">
                            <div className="w-4 h-4 bg-white/20 rounded-full" />
                          </div>
                        </div>

                        <div className="p-6 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                              <History size={20} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">Login Activity</p>
                              <p className="text-xs text-muted-foreground">View your recent sign-ins</p>
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-white/20" />
                        </div>

                        <div className="p-6 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
                              <Monitor size={20} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">Devices Logged In</p>
                              <p className="text-xs text-muted-foreground">3 active devices found</p>
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-white/20" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'storage' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Quota & Usage</label>
                      <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-8 space-y-8">
                        <div className="flex flex-col items-center text-center space-y-4">
                          <div className="w-32 h-32 rounded-full border-8 border-white/5 flex items-center justify-center relative">
                            <div className="absolute inset-0 rounded-full border-8 border-primary border-t-transparent -rotate-45" style={{ borderTopColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: 'transparent' }} />
                            <div className="text-center">
                              <span className="text-2xl font-black text-white">{Math.min((parseFloat(stats?.storageUsed) || 0) / 50 * 100, 100).toFixed(1)}%</span>
                              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Used</p>
                            </div>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white">{stats?.storageUsed || '0 GB'} used of 50 GB</h3>
                            <p className="text-sm text-muted-foreground mt-1">You have {50 - (parseFloat(stats?.storageUsed) || 0)} GB available storage.</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Upload Limit</p>
                            <p className="text-2xl font-black text-white">500 MB</p>
                            <p className="text-[10px] text-muted-foreground">Per file</p>
                          </div>
                          <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">File Types</p>
                            <p className="text-lg font-black text-white">JPG, PNG, RAW</p>
                            <p className="text-[10px] text-muted-foreground">Supported</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'billing' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Active Plan</label>
                      <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 space-y-8">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
                              <Database className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-white">Free Plan</h3>
                              <p className="text-sm text-muted-foreground">Basic photography studio engine</p>
                            </div>
                          </div>
                          <button className="px-6 py-2 rounded-full bg-amber-500 text-white font-bold text-sm hover:bg-amber-600 transition-all">
                            Upgrade
                          </button>
                        </div>

                        <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-4">
                          <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest">Payment Method</h4>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <CreditCard size={20} className="text-white/40" />
                              <span className="text-sm font-semibold">Visa ending in 4242</span>
                            </div>
                            <button className="text-xs font-bold text-primary">Edit</button>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest">Invoice History</h4>
                          <div className="space-y-2">
                            {[
                              { date: 'May 1, 2024', amount: '$0.00', status: 'Paid' },
                              { date: 'Apr 1, 2024', amount: '$0.00', status: 'Paid' },
                            ].map((invoice, i) => (
                              <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                <div className="flex items-center gap-3">
                                  <FileText size={16} className="text-white/20" />
                                  <span className="text-sm font-medium">{invoice.date}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="text-sm font-bold">{invoice.amount}</span>
                                  <span className="text-[10px] font-bold text-emerald-500 uppercase">{invoice.status}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'preferences' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Personalization</label>
                      <div className="bg-white/[0.03] border border-white/5 rounded-3xl overflow-hidden divide-y divide-white/5">
                        <div className="p-6 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
                              {preferences.darkMode ? <Moon size={20} /> : <Sun size={20} />}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">Dark Mode</p>
                              <p className="text-xs text-muted-foreground">Toggle studio appearance</p>
                            </div>
                          </div>
                          <div 
                            onClick={() => setPreferences({ ...preferences, darkMode: !preferences.darkMode })}
                            className={cn(
                              "w-12 h-6 rounded-full transition-all relative p-1 cursor-pointer",
                              preferences.darkMode ? "bg-primary" : "bg-white/10"
                            )}
                          >
                            <div className={cn(
                              "w-4 h-4 bg-white rounded-full transition-all",
                              preferences.darkMode ? "translate-x-6" : "translate-x-0"
                            )} />
                          </div>
                        </div>

                        <div className="p-6 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
                              <Bell size={20} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">Email Notifications</p>
                              <p className="text-xs text-muted-foreground">Daily activity summaries</p>
                            </div>
                          </div>
                          <div 
                            onClick={() => setPreferences({ ...preferences, emailNotifications: !preferences.emailNotifications })}
                            className={cn(
                              "w-12 h-6 rounded-full transition-all relative p-1 cursor-pointer",
                              preferences.emailNotifications ? "bg-primary" : "bg-white/10"
                            )}
                          >
                            <div className={cn(
                              "w-4 h-4 bg-white rounded-full transition-all",
                              preferences.emailNotifications ? "translate-x-6" : "translate-x-0"
                            )} />
                          </div>
                        </div>

                        <div className="p-6 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
                              <Smartphone size={20} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">Push Notifications</p>
                              <p className="text-xs text-muted-foreground">Instant desktop alerts</p>
                            </div>
                          </div>
                          <div 
                            onClick={() => setPreferences({ ...preferences, pushNotifications: !preferences.pushNotifications })}
                            className={cn(
                              "w-12 h-6 rounded-full transition-all relative p-1 cursor-pointer",
                              preferences.pushNotifications ? "bg-primary" : "bg-white/10"
                            )}
                          >
                            <div className={cn(
                              "w-4 h-4 bg-white rounded-full transition-all",
                              preferences.pushNotifications ? "translate-x-6" : "translate-x-0"
                            )} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'about' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 text-center py-12">
                    <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl border border-white/10 rotate-12 group-hover:rotate-0 transition-transform">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#0A0A0A]">
                        <Camera size={24} />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-white tracking-tighter">Shutter CMS</h3>
                      <p className="text-muted-foreground mt-2">Professional Studio Engine</p>
                    </div>
                    
                    <div className="max-w-xs mx-auto space-y-2 pt-8">
                      <div className="flex items-center justify-between px-6 py-3 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-xs font-bold text-white/50 uppercase">Version</span>
                        <span className="text-xs font-black text-white">2.4.0 (Stable)</span>
                      </div>
                      <div className="flex items-center justify-between px-6 py-3 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-xs font-bold text-white/50 uppercase">Engine</span>
                        <span className="text-xs font-black text-emerald-500">Online</span>
                      </div>
                      <div className="flex items-center justify-between px-6 py-3 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-xs font-bold text-white/50 uppercase">Developer</span>
                        <span className="text-xs font-black text-white">Shutter Labs</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-white/20 uppercase tracking-[0.3em] mt-12">Made for Photographers worldwide</p>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
