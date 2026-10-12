'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Type, 
  Image as ImageIcon, 
  Layout, 
  Save, 
  RefreshCcw,
  CheckCircle2,
  AlertCircle,
  Eye,
  Settings,
  Sliders
} from 'lucide-react';
import DashboardLayout from '../dashboard-layout';
import { useToast } from '@/components/UI/ToastProvider';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface WatermarkSettings {
  watermark_text: string;
  watermark_opacity: number;
  watermark_size: number;
  watermark_position: string;
  watermark_color: string;
  watermark_font?: string;
}

export default function WatermarkingPage() {
  const { showToast } = useToast();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [settings, setSettings] = useState<WatermarkSettings>({
    watermark_text: 'Shutter CMS',
    watermark_opacity: 0.5,
    watermark_size: 20,
    watermark_position: 'bottom-right',
    watermark_color: '#ffffff',
    watermark_font: 'sans-serif'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const API_URL = '/api/v1';

  const defaultSettings: WatermarkSettings = {
    watermark_text: 'Shutter CMS',
    watermark_opacity: 0.5,
    watermark_size: 20,
    watermark_position: 'bottom-right',
    watermark_color: '#ffffff',
    watermark_font: 'sans-serif'
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
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
      const res = await fetch(`${API_URL}/settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setSettings(prev => ({ ...prev, ...data.data }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch settings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/settings`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Watermark settings saved!', 'success');
      } else {
        showToast('Failed to save watermark settings', 'error');
      }
    } catch (error) {
      console.error('Save error:', error);
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    showToast('Settings reset to defaults', 'success');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
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

  const positions = [
    'top-left', 'top-center', 'top-right',
    'center-left', 'center', 'center-right',
    'bottom-left', 'bottom-center', 'bottom-right'
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Image Protection</h1>
            <p className="text-muted-foreground mt-1">Configure your automatic watermark and protection settings.</p>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Configuration
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-6">
              <div className="flex items-center gap-2 text-primary font-semibold">
                <Settings className="w-5 h-5" />
                <span>Watermark Properties</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-muted-foreground">Watermark Text</label>
                  <div className="relative">
                    <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      type="text"
                      value={settings?.watermark_text || ''}
                      onChange={(e) => setSettings({...settings, watermark_text: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-muted-foreground">Watermark Color</label>
                    <div className="flex gap-3">
                      <input 
                        type="color"
                        value={settings?.watermark_color || '#ffffff'}
                        onChange={(e) => setSettings({...settings, watermark_color: e.target.value})}
                        className="w-12 h-10 bg-black/40 border border-white/10 rounded-lg p-1 cursor-pointer"
                      />
                      <input 
                        type="text"
                        value={settings?.watermark_color || '#ffffff'}
                        onChange={(e) => setSettings({...settings, watermark_color: e.target.value})}
                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-muted-foreground">Opacity ({Math.round((settings?.watermark_opacity || 0.5) * 100)}%)</label>
                    <input 
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settings?.watermark_opacity || 0.5}
                      onChange={(e) => setSettings({...settings, watermark_opacity: parseFloat(e.target.value)})}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-muted-foreground">Size ({settings?.watermark_size || 20}px)</label>
                    <input 
                      type="range"
                      min="10"
                      max="100"
                      step="2"
                      value={settings?.watermark_size || 20}
                      onChange={(e) => setSettings({...settings, watermark_size: parseInt(e.target.value)})}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-muted-foreground">Font Family</label>
                    <div className="relative">
                      <select
                        value={settings?.watermark_font || 'Arial, sans-serif'}
                        onChange={(e) => setSettings({...settings, watermark_font: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm appearance-none"
                        style={{ fontFamily: settings?.watermark_font || 'Arial, sans-serif' }}
                      >
                        <option value="Arial, sans-serif">Arial (Default)</option>
                        <option value="Helvetica, sans-serif">Helvetica</option>
                        <option value="Times New Roman, serif">Times New Roman</option>
                        <option value="Georgia, serif">Georgia</option>
                        <option value="Garamond, serif">Garamond</option>
                        <option value="Palatino, serif">Palatino</option>
                        <option value="Bookman, serif">Bookman</option>
                        <option value="Courier New, monospace">Courier New</option>
                        <option value="Lucida Console, monospace">Lucida Console</option>
                        <option value="Monaco, monospace">Monaco</option>
                        <option value="Verdana, sans-serif">Verdana</option>
                        <option value="Tahoma, sans-serif">Tahoma</option>
                        <option value="Trebuchet MS, sans-serif">Trebuchet MS</option>
                        <option value="Impact, sans-serif">Impact</option>
                        <option value="Comic Sans MS, cursive">Comic Sans MS</option>
                        <option value="Brush Script MT, cursive">Brush Script MT</option>
                        <option value="Lucida Handwriting, cursive">Lucida Handwriting</option>
                        <option value="Papyrus, fantasy">Papyrus</option>
                        <option value="Copperplate, fantasy">Copperplate</option>
                        <option value="Futura, sans-serif">Futura</option>
                        <option value="Optima, sans-serif">Optima</option>
                        <option value="Gill Sans, sans-serif">Gill Sans</option>
                        <option value="Franklin Gothic, sans-serif">Franklin Gothic</option>
                        <option value="Century Gothic, sans-serif">Century Gothic</option>
                        <option value="Avant Garde, sans-serif">Avant Garde</option>
                        <option value="Baskerville, serif">Baskerville</option>
                        <option value="Didot, serif">Didot</option>
                        <option value="Bodoni, serif">Bodoni</option>
                        <option value="Rockwell, serif">Rockwell</option>
                        <option value="Consolas, monospace">Consolas</option>
                        <option value="Andale Mono, monospace">Andale Mono</option>
                        <option value="Menlo, monospace">Menlo</option>
                        <option value="sans-serif">Generic Sans-serif</option>
                        <option value="serif">Generic Serif</option>
                        <option value="monospace">Generic Monospace</option>
                        <option value="cursive">Generic Cursive</option>
                        <option value="fantasy">Generic Fantasy</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Selected font preview: <span style={{ fontFamily: settings?.watermark_font || 'Arial, sans-serif' }}>
                        {settings?.watermark_font?.split(',')[0] || 'Arial'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3 text-muted-foreground">Position</label>
                  <div className="grid grid-cols-3 gap-2 w-full max-w-[240px] mx-auto">
                    {positions.map((pos) => {
                      const isSelected = (settings?.watermark_position || 'bottom-right') === pos;
                      return (
                        <button
                          key={pos}
                          onClick={() => setSettings({...settings, watermark_position: pos})}
                          className={cn(
                            "aspect-square rounded-lg border-2 transition-all flex items-center justify-center relative",
                            isSelected 
                              ? "border-primary bg-primary/20 shadow-lg shadow-primary/10" 
                              : "border-white/5 bg-white/5 hover:border-white/20"
                          )}
                          title={pos.replace('-', ' ')}
                        >
                          {isSelected && (
                            <div className="w-2 h-2 bg-primary rounded-full" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    Selected: {settings?.watermark_position?.replace('-', ' ')}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 text-primary font-semibold mb-4">
                <Sliders className="w-5 h-5" />
                <span>Protection Settings</span>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Disable Right-Click', desc: 'Prevents users from saving images via context menu.' },
                  { label: 'Apply on Upload', desc: 'Automatically apply this watermark to all new uploads.' },
                  { label: 'AI Anti-Screenshot', desc: 'Use AI to detect and block screenshot attempts.' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                    </div>
                    <button className="w-10 h-5 rounded-full bg-primary relative">
                      <div className="absolute right-1 top-1 w-3 h-3 rounded-full bg-white" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <Eye className="w-5 h-5" />
                  <span>Live Preview</span>
                </div>
                <button 
                  onClick={handleReset}
                  className="text-xs text-muted-foreground hover:text-white flex items-center gap-1 transition-colors"
                >
                  <RefreshCcw className="w-3 h-3" />
                  Reset Defaults
                </button>
              </div>

              <div className="relative aspect-video rounded-xl overflow-hidden bg-black shadow-2xl group">
                <img 
                  src={previewImage || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800"} 
                  alt="Preview"
                  className="w-full h-full object-cover opacity-60 transition-opacity group-hover:opacity-40"
                />
                
                {/* Upload Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <label className="cursor-pointer flex flex-col items-center gap-2 text-white">
                    <div className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest">Upload Sample Photo</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                </div>

                {!previewImage && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-white/10 text-4xl font-black select-none rotate-[-45deg] whitespace-nowrap uppercase tracking-[0.2em]">
                      Studio Preview
                    </div>
                  </div>
                )}
                
                {/* Dynamic Watermark */}
                <div 
                  className={cn(
                    "absolute p-4 pointer-events-none select-none transition-all duration-300 whitespace-nowrap font-bold",
                    settings.watermark_position === 'top-left' && "top-0 left-0",
                    settings.watermark_position === 'top-center' && "top-0 left-1/2 -translate-x-1/2",
                    settings.watermark_position === 'top-right' && "top-0 right-0",
                    settings.watermark_position === 'center-left' && "top-1/2 left-0 -translate-y-1/2",
                    settings.watermark_position === 'center' && "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                    settings.watermark_position === 'center-right' && "top-1/2 right-0 -translate-y-1/2",
                    settings.watermark_position === 'bottom-left' && "bottom-0 left-0",
                    settings.watermark_position === 'bottom-center' && "bottom-0 left-1/2 -translate-x-1/2",
                    settings.watermark_position === 'bottom-right' && "bottom-0 right-0",
                  )}
                  style={{ 
                    opacity: settings.watermark_opacity,
                    fontSize: `${settings.watermark_size}px`,
                    color: settings.watermark_color,
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}
                >
                  {settings.watermark_text}
                </div>
              </div>

              <div className="mt-8 p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary mt-1">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Protection Active</p>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                    This configuration will be applied to all high-resolution images across your albums. We recommend using a high-contrast color for maximum visibility.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
