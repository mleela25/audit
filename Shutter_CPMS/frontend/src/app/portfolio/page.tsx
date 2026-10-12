'use client';

import React, { useState, useEffect } from 'react';
import { 
  Save, 
  ExternalLink, 
  Palette, 
  Layout, 
  Type, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2
} from 'lucide-react';
import DashboardLayout from '../dashboard-layout';
import { useToast } from '@/components/UI/ToastProvider';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PortfolioSettings {
  site_title: string;
  bio: string;
  theme_color: string;
  selected_albums: number[];
  show_contact: boolean;
}

interface Album {
  id: number;
  title: string;
  cover_image: string;
  category: string;
}

export default function PortfolioPage() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<PortfolioSettings>({
    site_title: '',
    bio: '',
    theme_color: '#8B5CF6',
    selected_albums: [],
    show_contact: true,
  });
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const API_URL = '/api/v1';

  useEffect(() => {
    fetchPortfolio();
    fetchAlbums();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/portfolio`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch portfolio', error);
      showToast('Failed to load portfolio settings', 'error');
    }
  };

  const fetchAlbums = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/albums`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAlbums(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch albums', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/portfolio`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Portfolio updated successfully!', 'success');
      } else {
        showToast(data.error || 'Failed to update portfolio', 'error');
      }
    } catch (error) {
      console.error('Save error:', error);
      showToast('An error occurred while saving', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleAlbumSelection = (albumId: number) => {
    setSettings(prev => ({
      ...prev,
      selected_albums: prev.selected_albums.includes(albumId)
        ? prev.selected_albums.filter(id => id !== albumId)
        : [...prev.selected_albums, albumId]
    }));
  };

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:5001${url}`;
  };

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
            <h1 className="text-3xl font-bold tracking-tight">Portfolio Builder</h1>
            <p className="text-muted-foreground mt-1">Design and manage your public photography portfolio.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.open('/portfolio-preview', '_blank')}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Preview Site
            </button>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Changes
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-6">
              <div className="flex items-center gap-2 text-primary font-semibold mb-4">
                <Type className="w-5 h-5" />
                <span>General Settings</span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Site Title</label>
                  <input 
                    type="text"
                    value={settings.site_title}
                    onChange={(e) => setSettings({...settings, site_title: e.target.value})}
                    placeholder="Enter your site title..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-muted-foreground">About Me / Bio</label>
                  <textarea 
                    rows={4}
                    value={settings.bio}
                    onChange={(e) => setSettings({...settings, bio: e.target.value})}
                    placeholder="Tell your story..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 text-primary font-semibold mb-4">
                  <Palette className="w-5 h-5" />
                  <span>Branding</span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-muted-foreground">Theme Color</label>
                  <div className="flex flex-wrap gap-2">
                    {['#8B5CF6', '#22D3EE', '#F43F5E', '#10B981', '#F59E0B', '#6366F1'].map(color => (
                      <button
                        key={color}
                        onClick={() => setSettings({...settings, theme_color: color})}
                        className={cn(
                          "w-8 h-8 rounded-full border-2 transition-all",
                          settings.theme_color === color ? "border-white scale-110 shadow-lg shadow-white/20" : "border-transparent"
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    <input 
                      type="color"
                      value={settings.theme_color}
                      onChange={(e) => setSettings({...settings, theme_color: e.target.value})}
                      className="w-8 h-8 rounded-full bg-transparent border-none cursor-pointer overflow-hidden"
                    />
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <label className="text-sm font-medium text-muted-foreground">Show Contact Form</label>
                  <button 
                    onClick={() => setSettings({...settings, show_contact: !settings.show_contact})}
                    className={cn(
                      "w-12 h-6 rounded-full transition-all relative",
                      settings.show_contact ? "bg-primary" : "bg-white/10"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                      settings.show_contact ? "right-1" : "left-1"
                    )} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Album Selection */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <Layout className="w-5 h-5" />
                  <span>Featured Albums</span>
                </div>
                <span className="text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded-md">
                  {settings.selected_albums.length} Selected
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {albums.length > 0 ? (
                  albums.map((album) => (
                    <div 
                      key={album.id}
                      onClick={() => toggleAlbumSelection(album.id)}
                      className={cn(
                        "group relative cursor-pointer rounded-xl border-2 transition-all overflow-hidden",
                        settings.selected_albums.includes(album.id) 
                          ? "border-primary bg-primary/5" 
                          : "border-white/5 bg-white/5 hover:border-white/20"
                      )}
                    >
                      <div className="flex items-center p-3 gap-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-black/40">
                          {album.cover_image ? (
                            <img 
                              src={getImageUrl(album.cover_image)} 
                              alt={album.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/20">
                              <ImageIcon className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{album.title}</h3>
                          <p className="text-xs text-muted-foreground">{album.category || 'Uncategorized'}</p>
                        </div>
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center transition-all",
                          settings.selected_albums.includes(album.id) 
                            ? "bg-primary text-white scale-110" 
                            : "bg-white/5 text-transparent group-hover:text-white/20"
                        )}>
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 py-12 text-center border-2 border-dashed border-white/10 rounded-2xl">
                    <ImageIcon className="w-12 h-12 mx-auto text-white/10 mb-3" />
                    <p className="text-muted-foreground">No albums found. Create an album first.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Preview Section */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-transparent to-transparent border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/20 text-primary">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Ready to go public?</h3>
                  <p className="text-sm text-muted-foreground">Your portfolio will be live at shuttercms.com/your-profile</p>
                </div>
              </div>
              <button className="w-full py-3 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-all">
                Publish Portfolio Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
