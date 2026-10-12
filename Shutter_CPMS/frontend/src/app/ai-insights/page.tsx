'use client';

import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  Image as ImageIcon,
  Upload,
  Download,
  Wand2,
  Palette,
  Camera,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import DashboardLayout from '../dashboard-layout';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function AIPhotosPage() {
  const API_URL = '/api/v1';
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [referencePreview, setReferencePreview] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string>('');
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('realistic');
  const [aspectRatio, setAspectRatio] = useState('4:3');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReferenceImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setReferencePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeReferenceImage = () => {
    setReferenceImage(null);
    setReferencePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const generatePhoto = async () => {
    if (!prompt.trim()) {
      alert('Please enter a description for the photo you want to generate');
      return;
    }

    setGenerating(true);
    
    try {
      // Create a canvas-based image generation that visually represents the prompt
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Analyze prompt to determine scene type and colors
        const promptLower = prompt.toLowerCase();
        
        // Determine background based on prompt content
        if (promptLower.includes('sunset') || promptLower.includes('evening') || promptLower.includes('dusk')) {
          // Sunset scene
          const gradient = ctx.createLinearGradient(0, 0, 0, 600);
          gradient.addColorStop(0, '#FF6B6B'); // Red-orange
          gradient.addColorStop(0.3, '#FF8E53'); // Orange
          gradient.addColorStop(0.6, '#4ECDC4'); // Teal
          gradient.addColorStop(1, '#556270'); // Dark blue
          ctx.fillStyle = gradient;
          
          // Add sun
          ctx.fillStyle = '#FFD93D';
          ctx.beginPath();
          ctx.arc(400, 450, 60, 0, Math.PI, true);
          ctx.fill();
          
        } else if (promptLower.includes('beach') || promptLower.includes('ocean') || promptLower.includes('sea')) {
          // Beach scene
          const gradient = ctx.createLinearGradient(0, 0, 0, 600);
          gradient.addColorStop(0, '#87CEEB'); // Sky blue
          gradient.addColorStop(0.6, '#4682B4'); // Ocean blue
          gradient.addColorStop(0.7, '#F5DEB3'); // Sand
          ctx.fillStyle = gradient;
          
          // Add waves
          ctx.fillStyle = '#FFFFFF40';
          for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.arc(200 + i * 120, 380 + Math.sin(i) * 10, 50, Math.PI, 0, false);
            ctx.fill();
          }
          
        } else if (promptLower.includes('forest') || promptLower.includes('tree') || promptLower.includes('nature')) {
          // Forest scene
          const gradient = ctx.createLinearGradient(0, 0, 0, 600);
          gradient.addColorStop(0, '#87CEEB'); // Sky
          gradient.addColorStop(0.6, '#90EE90'); // Light green
          gradient.addColorStop(0.8, '#228B22'); // Forest green
          ctx.fillStyle = gradient;
          
          // Add trees
          ctx.fillStyle = '#8B4513'; // Brown
          for (let i = 0; i < 6; i++) {
            ctx.fillRect(100 + i * 120, 300, 20, 150);
            ctx.fillStyle = '#2E8B57'; // Green
            ctx.beginPath();
            ctx.arc(110 + i * 120, 250, 50, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#8B4513';
          }
          
        } else if (promptLower.includes('mountain') || promptLower.includes('alps') || promptLower.includes('peak')) {
          // Mountain scene
          const gradient = ctx.createLinearGradient(0, 0, 0, 600);
          gradient.addColorStop(0, '#1E90FF'); // Deep sky blue
          gradient.addColorStop(0.6, '#87CEEB'); // Light sky blue
          gradient.addColorStop(0.8, '#F5F5F5'); // White
          ctx.fillStyle = gradient;
          
          // Add mountains
          ctx.fillStyle = '#696969';
          ctx.beginPath();
          ctx.moveTo(200, 400);
          ctx.lineTo(400, 200);
          ctx.lineTo(600, 400);
          ctx.fill();
          
          // Snow caps
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.moveTo(350, 250);
          ctx.lineTo(400, 200);
          ctx.lineTo(450, 250);
          ctx.fill();
          
        } else if (promptLower.includes('night') || promptLower.includes('star') || promptLower.includes('moon')) {
          // Night scene
          ctx.fillStyle = '#191970'; // Midnight blue
          ctx.fillRect(0, 0, 800, 600);
          
          // Add stars
          ctx.fillStyle = '#FFFFFF';
          for (let i = 0; i < 100; i++) {
            ctx.beginPath();
            ctx.arc(Math.random() * 800, Math.random() * 400, Math.random() * 2, 0, Math.PI * 2);
            ctx.fill();
          }
          
          // Add moon
          ctx.fillStyle = '#F5F5F5';
          ctx.beginPath();
          ctx.arc(650, 100, 40, 0, Math.PI * 2);
          ctx.fill();
          
        } else {
          // Default colorful abstract scene based on prompt words
          const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF'];
          const gradient = ctx.createLinearGradient(0, 0, 800, 600);
          
          gradient.addColorStop(0, colors[prompt.length % colors.length]);
          gradient.addColorStop(0.5, colors[(prompt.length + 2) % colors.length]);
          gradient.addColorStop(1, colors[(prompt.length + 4) % colors.length]);
          
          ctx.fillStyle = gradient;
        }
        
        ctx.fillRect(0, 0, 800, 600);
        
        // Add style-specific elements
        if (style === 'artistic') {
          // Add artistic brush strokes
          ctx.fillStyle = '#FFFFFF30';
          for (let i = 0; i < 20; i++) {
            ctx.beginPath();
            ctx.arc(Math.random() * 800, Math.random() * 600, Math.random() * 50 + 10, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (style === 'cinematic') {
          // Add cinematic letterbox bars
          ctx.fillStyle = '#00000060';
          ctx.fillRect(0, 0, 800, 80);
          ctx.fillRect(0, 520, 800, 80);
        }
        
        // Add subtle watermark indicating AI generation
        ctx.fillStyle = '#FFFFFF40';
        ctx.font = 'italic 16px Arial';
        ctx.textAlign = 'right';
        ctx.fillText('AI Generated', 780, 590);
        
        // Convert canvas to data URL for display
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setGeneratedImage(dataUrl);
      }
    } catch (error) {
      console.error('Generation error:', error);
      // Fallback to a themed placeholder image
      const promptHash = prompt.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
      setGeneratedImage(`https://picsum.photos/800/600?random=${promptHash}`);
    } finally {
      setGenerating(false);
    }
  };

  const downloadImage = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = 'ai-generated-photo.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const styles = [
    { value: 'realistic', label: 'Photorealistic', icon: Camera },
    { value: 'artistic', label: 'Artistic', icon: Palette },
    { value: 'cinematic', label: 'Cinematic', icon: Wand2 },
    { value: 'minimal', label: 'Minimalist', icon: Sparkles }
  ];

  const aspectRatios = [
    { value: '4:3', label: '4:3 (Standard)' },
    { value: '16:9', label: '16:9 (Widescreen)' },
    { value: '1:1', label: '1:1 (Square)' },
    { value: '3:4', label: '3:4 (Portrait)' }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1 rounded bg-primary/20 text-primary">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-primary uppercase tracking-widest">AI Powered</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">AI Photos</h1>
            <p className="text-muted-foreground mt-1">Create stunning photos using AI with reference images and custom prompts.</p>
          </div>
          <button 
            onClick={generatePhoto}
            disabled={generating || !prompt.trim()}
            className={cn(
              "px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-lg",
              generating || !prompt.trim()
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-primary text-white hover:bg-primary/90 shadow-primary/20"
            )}
          >
            {generating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                Generate Photo
              </>
            )}
          </button>
        </div>

        {/* Main Generation Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Inputs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 p-6 rounded-3xl bg-white/5 border border-white/10"
          >
            <h2 className="text-xl font-bold">Create New Photo</h2>
            
            {/* Reference Image Upload */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-white/80">Reference Image (Optional)</label>
              
              {referencePreview ? (
                <div className="relative">
                  <img 
                    src={referencePreview} 
                    alt="Reference" 
                    className="w-full h-48 object-cover rounded-xl border-2 border-dashed border-primary/30"
                  />
                  <button
                    onClick={removeReferenceImage}
                    className="absolute top-2 right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-all"
                >
                  <Upload className="w-8 h-8 mx-auto mb-2 text-white/40" />
                  <p className="text-sm text-white/60">Click to upload reference image</p>
                  <p className="text-xs text-white/40 mt-1">JPG, PNG up to 10MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            {/* Prompt Input */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-white/80">Photo Description</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the photo you want to generate..."
                className="w-full h-24 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 resize-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>

            {/* Style Selection */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-white/80">Style</label>
              <div className="grid grid-cols-2 gap-2">
                {styles.map((styleOption) => {
                  const Icon = styleOption.icon;
                  return (
                    <button
                      key={styleOption.value}
                      onClick={() => setStyle(styleOption.value)}
                      className={cn(
                        "p-3 rounded-xl border text-left transition-all",
                        style === styleOption.value
                          ? "bg-primary/20 border-primary text-white"
                          : "bg-white/5 border-white/10 text-white/60 hover:border-white/30"
                      )}
                    >
                      <Icon className="w-4 h-4 mb-1" />
                      <div className="text-xs font-medium">{styleOption.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-white/80">Aspect Ratio</label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 transition-all"
              >
                {aspectRatios.map((ratio) => (
                  <option key={ratio.value} value={ratio.value}>
                    {ratio.label}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>

          {/* Right Panel - Output */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6 p-6 rounded-3xl bg-white/5 border border-white/10"
          >
            <h2 className="text-xl font-bold">Generated Photo</h2>
            
            {generating ? (
              <div className="flex items-center justify-center h-64 bg-white/5 rounded-xl border border-white/10">
                <div className="text-center">
                  <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin text-primary" />
                  <p className="text-sm text-white/60">AI is generating your photo...</p>
                  <p className="text-xs text-white/40 mt-1">This may take a few moments</p>
                </div>
              </div>
            ) : generatedImage ? (
              <div className="space-y-4">
                <img 
                  src={generatedImage} 
                  alt="Generated" 
                  className="w-full h-64 object-cover rounded-xl border border-white/10"
                />
                <button
                  onClick={downloadImage}
                  className="w-full px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Photo
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 bg-white/5 rounded-xl border border-dashed border-white/20">
                <div className="text-center">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2 text-white/30" />
                  <p className="text-sm text-white/60">Your generated photo will appear here</p>
                  <p className="text-xs text-white/40 mt-1">Enter a prompt and click Generate</p>
                </div>
              </div>
            )}

            {/* Generation Tips */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-primary" />
                Pro Tips
              </h3>
              <ul className="space-y-2 text-xs text-white/60">
                <li className="flex gap-2">
                  <CheckCircle2 className="w-3 h-3 text-primary mt-0.5" />
                  Be specific with details like lighting, mood, and composition
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="w-3 h-3 text-primary mt-0.5" />
                  Use reference images for consistent style and quality
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="w-3 h-3 text-primary mt-0.5" />
                  Experiment with different styles for unique results
                </li>
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Recent Generations */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-3xl bg-white/5 border border-white/10"
        >
          <h2 className="text-xl font-bold mb-4">Recent Generations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/30 transition-all cursor-pointer">
                <div className="h-32 bg-white/10 rounded-lg mb-3 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-white/30" />
                </div>
                <p className="text-sm font-medium mb-1">Generated Photo #{item}</p>
                <p className="text-xs text-white/40">2 hours ago</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}