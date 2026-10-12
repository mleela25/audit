'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Chrome, Facebook, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'photographer' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const API_URL = '/api/v1';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isSignUp ? '/auth/register' : '/auth/login';
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push('/');
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Connection error. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div className="glass-card p-8 md:p-10 flex flex-col items-center">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold gradient-text mb-2">
              {isSignUp ? 'Create New Account' : 'Sign In'}
            </h1>
            <p className="text-muted text-sm">
              {isSignUp ? 'Join professional photographers worldwide' : 'Welcome back to Shutter CMS'}
            </p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center space-x-3 text-rose-500 text-xs"
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="w-full space-y-5">
            {isSignUp && (
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-accent transition-colors" />
                <input 
                  required
                  type="text" 
                  placeholder="Full Name"
                  className="input-field pl-12"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            )}
            
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-accent transition-colors" />
              <input 
                required
                type="email" 
                placeholder="Username or email"
                className="input-field pl-12"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-accent transition-colors" />
              <input 
                required
                type="password" 
                placeholder="Password"
                className="input-field pl-12"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            {!isSignUp && (
              <div className="flex items-center justify-between text-xs px-1">
                <label className="flex items-center space-x-2 cursor-pointer text-muted hover:text-white transition-colors">
                  <input type="checkbox" className="rounded border-white/20 bg-white/5" />
                  <span>Remember me</span>
                </label>
                <Link href="#" className="text-accent hover:underline">Forgot Password?</Link>
              </div>
            )}

            {isSignUp && (
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-muted uppercase tracking-widest px-1">Register As</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, role: 'photographer'})}
                    className={cn(
                      "py-2 rounded-xl text-xs font-bold transition-all border",
                      formData.role === 'photographer' ? "bg-accent/10 border-accent text-accent" : "bg-white/5 border-white/10 text-muted"
                    )}
                  >
                    Photographer
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, role: 'client'})}
                    className={cn(
                      "py-2 rounded-xl text-xs font-bold transition-all border",
                      formData.role === 'client' ? "bg-accent/10 border-accent text-accent" : "bg-white/5 border-white/10 text-muted"
                    )}
                  >
                    Client
                  </button>
                </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 mt-2 shadow-accent/20 flex items-center justify-center space-x-2"
            >
              {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
              <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
            </button>

            <div className="relative flex items-center justify-center my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <span className="relative z-10 px-4 bg-[#111827] text-xs text-muted uppercase tracking-wider">Or</span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button type="button" className="flex items-center justify-center space-x-3 px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-sm font-medium">
                <Chrome className="w-5 h-5" />
                <span>Continue With Google</span>
              </button>
              <button type="button" className="flex items-center justify-center space-x-3 px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-sm font-medium">
                <Facebook className="w-5 h-5" />
                <span>Continue With Facebook</span>
              </button>
            </div>
          </form>

          <p className="mt-10 text-sm text-muted">
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <button 
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-accent font-semibold hover:underline"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
