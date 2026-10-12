'use client';

import Sidebar from '@/components/Dashboard/Sidebar';
import Navbar from '@/components/Dashboard/Navbar';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground flex">
        <Sidebar />
        <div className="flex-1 flex flex-col md:pl-64 transition-all duration-300">
          <Navbar />
          <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
