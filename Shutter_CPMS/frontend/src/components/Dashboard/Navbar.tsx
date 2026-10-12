'use client';

import React, { useState } from 'react';
import { Search, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-card/80 backdrop-blur-xl border-b border-white/10 px-6 flex items-center justify-between">
      {/* Search Bar */}
      <div className={cn(
        "relative flex items-center w-full max-w-lg px-4 py-2 bg-white/5 border border-white/10 rounded-xl transition-all duration-300",
        isSearchFocused ? "border-accent ring-2 ring-accent/20 bg-white/10" : "hover:border-white/20"
      )}>
        <Search className="w-5 h-5 text-muted mr-3" />
        <input 
          type="text" 
          placeholder="Search images, clients, or albums..."
          className="bg-transparent border-none outline-none text-sm text-white placeholder:text-muted w-full"
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
        />
        <div className="flex items-center space-x-1 px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-muted font-bold">
          <span className="opacity-70">⌘</span>
          <span>K</span>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center space-x-5">
        {/* Notifications */}
        <button className="relative p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group">
          <Bell className="w-5 h-5 text-muted group-hover:text-accent transition-colors" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-card shadow-lg"></span>
        </button>
      </div>
    </header>
  );
}
