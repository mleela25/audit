'use client';

import React from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import { motion } from 'framer-motion';
import { Sparkles, Construction, ChevronRight } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  description: string;
}

export default function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <DashboardLayout>
      <div className="h-[70vh] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="glass-card p-12 max-w-lg text-center relative overflow-hidden group"
        >
          <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-accent/20 blur-3xl rounded-full group-hover:scale-110 transition-transform"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mx-auto mb-6 border border-accent/20 shadow-lg shadow-accent/5 group-hover:rotate-12 transition-transform">
              <Sparkles size={32} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">{title}</h1>
            <p className="text-muted mb-8 leading-relaxed">
              {description} We're currently building a high-end, AI-powered experience for this module. Stay tuned for the update!
            </p>
            <div className="flex items-center justify-center space-x-3">
              <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-accent flex items-center">
                <Construction size={12} className="mr-2" />
                Under Development
              </div>
            </div>
            <button className="mt-8 text-accent hover:text-white transition-colors text-sm font-bold flex items-center mx-auto">
              Learn more about our roadmap <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
