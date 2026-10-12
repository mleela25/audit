'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Shield, 
  User, 
  Lock, 
  Key, 
  Users, 
  ShieldCheck,
  AlertCircle,
  MoreVertical,
  Trash2,
  Edit,
  Search,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import DashboardLayout from '../dashboard-layout';
import { useToast } from '@/components/UI/ToastProvider';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface UserData {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'photographer' | 'client';
  created_at: string;
}

export default function PermissionsPage() {
  const { showToast } = useToast();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const API_URL = '/api/v1';

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (parsedUser.role !== 'admin') {
        router.push('/');
        return;
      }
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch users', error);
      showToast('Failed to load user permissions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: number, newRole: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/users/${userId}/role`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (data.success) {
        showToast('User role updated successfully.', 'success');
        fetchUsers();
      }
    } catch (error) {
      showToast('Failed to update role', 'error');
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const roleColors = {
    admin: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    photographer: 'bg-primary/10 text-primary border-primary/20',
    client: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
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
            <h1 className="text-3xl font-bold tracking-tight">Role-Based Access Control</h1>
            <p className="text-muted-foreground mt-1">Manage user roles and system-wide permissions.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 w-64"
              />
            </div>
            <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Audit Logs
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Permission Stats */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">Permission Overview</h3>
              <div className="space-y-6">
                {[
                  { label: 'Admins', count: users.filter(u => u.role === 'admin').length, icon: Shield, color: 'text-rose-500' },
                  { label: 'Photographers', count: users.filter(u => u.role === 'photographer').length, icon: User, color: 'text-primary' },
                  { label: 'Clients', count: users.filter(u => u.role === 'client').length, icon: Users, color: 'text-emerald-500' },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg bg-white/5", stat.color)}>
                        <stat.icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium">{stat.label}</span>
                    </div>
                    <span className="text-sm font-bold">{stat.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-white/10">
              <div className="flex items-center gap-2 text-primary font-semibold mb-3">
                <Lock className="w-5 h-5" />
                <span>Security Notice</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Admins have full access to system settings, database backups, and user management. Use caution when assigning the admin role.
              </p>
            </div>
          </div>

          {/* User List */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/5">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase">User</th>
                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase">Role</th>
                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase">Created At</th>
                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-white/5 transition-all group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-primary">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          value={user.role}
                          onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                          className={cn(
                            "text-xs font-bold px-3 py-1.5 rounded-full border bg-black/40 focus:outline-none transition-all",
                            roleColors[user.role]
                          )}
                        >
                          <option value="admin">ADMIN</option>
                          <option value="photographer">PHOTOGRAPHER</option>
                          <option value="client">CLIENT</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredUsers.length === 0 && (
                <div className="py-20 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto text-white/10 mb-4" />
                  <p className="text-muted-foreground">No users found matching your search.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
