'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Heart, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle2, 
  Clock,
  Trash2,
  Image as ImageIcon,
  User,
  ArrowRight
} from 'lucide-react';
import DashboardLayout from '../dashboard-layout';
import { useToast } from '@/components/UI/ToastProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FeedbackItem {
  id: number;
  image_id: number;
  client_id: number;
  comment: string;
  is_favorite: boolean;
  created_at: string;
  image_title: string;
  client_name: string;
  image_url?: string;
}

export default function FeedbackPage() {
  const { showToast } = useToast();
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'favorites' | 'comments'>('all');

  const API_URL = '/api/v1';

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/feedback`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch feedback', error);
      showToast('Failed to load feedback.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredFeedback = feedback.filter(item => {
    const matchesSearch = 
      item.client_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.image_title.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'favorites') return matchesSearch && item.is_favorite;
    if (filter === 'comments') return matchesSearch && item.comment;
    return matchesSearch;
  });

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
            <h1 className="text-3xl font-bold tracking-tight">Client Feedback</h1>
            <p className="text-muted-foreground mt-1">Review selections and comments from your clients.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input 
                type="text"
                placeholder="Search feedback..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all w-64"
              />
            </div>
            <div className="flex bg-white/5 border border-white/10 rounded-xl p-1">
              {(['all', 'favorites', 'comments'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize",
                    filter === f ? "bg-primary text-white" : "text-muted-foreground hover:text-white"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredFeedback.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredFeedback.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex flex-col h-full"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{item.client_name}</h3>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                          <Clock className="w-3 h-3" />
                          {new Date(item.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    {item.is_favorite && (
                      <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500">
                        <Heart className="w-4 h-4 fill-current" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Image Selected</p>
                        <p className="text-sm font-medium truncate">{item.image_title}</p>
                      </div>
                    </div>

                    {item.comment ? (
                      <div className="relative">
                        <MessageSquare className="absolute -left-1 -top-1 w-3 h-3 text-primary opacity-50" />
                        <p className="text-sm text-muted-foreground leading-relaxed pl-4 italic">
                          "{item.comment}"
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground/30 italic">No comment provided</p>
                    )}
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                    <button className="text-xs font-semibold text-primary flex items-center gap-1 hover:gap-2 transition-all">
                      View in Gallery
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <div className="flex items-center gap-2">
                      <button className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white transition-all">
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white/5 border border-dashed border-white/10 rounded-3xl">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-xl font-semibold">No feedback yet</h3>
            <p className="text-muted-foreground mt-2">Feedback from your clients will appear here.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
