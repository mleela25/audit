'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import { 
  Users, 
  Search, 
  Plus, 
  MoreVertical, 
  Mail, 
  Calendar, 
  Filter,
  X,
  ChevronRight,
  UserPlus,
  Upload,
  Trash2,
  Edit,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/UI/ToastProvider';

export default function ClientsPage() {
  const { showToast } = useToast();
  const [clients, setClients] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  // Form states
  const [newClient, setNewClient] = useState({ name: '', email: '', status: 'active' });
  const [editingClient, setEditingClient] = useState<any>(null);
  const [uploadData, setUploadData] = useState({ 
    clientId: '', 
    clientName: '',
    albumId: '', 
    title: '', 
    category: 'Portrait' 
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const API_URL = '/api/v1';

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
      const [clientsRes, albumsRes] = await Promise.all([
        fetch(`${API_URL}/clients`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/albums`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      const clientsData = await clientsRes.json();
      const albumsData = await albumsRes.json();
      
      if (clientsData.success) setClients(clientsData.data);
      if (albumsData.success) setAlbums(albumsData.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/clients`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newClient)
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Client added successfully!', 'success');
        setIsAddModalOpen(false);
        setNewClient({ name: '', email: '', status: 'active' });
        fetchData();
      } else {
        showToast(data.error || 'Failed to add client', 'error');
      }
    } catch (error) {
      showToast('Connection error', 'error');
    }
  };

  const handleEditClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/clients/${editingClient.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingClient)
      });
      if (res.ok) {
        showToast('Client updated successfully!', 'success');
        setIsEditModalOpen(false);
        fetchData();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to update client', 'error');
      }
    } catch (error) {
      showToast('Connection error', 'error');
    }
  };

  const handleDeleteClient = async (id: number) => {
    if (!confirm('Are you sure you want to delete this client?')) return;
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/clients/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Client deleted', 'success');
        fetchData();
      } else {
        showToast('Failed to delete client', 'error');
      }
    } catch (error) {
      showToast('Connection error', 'error');
    }
  };

  const handleClientUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      showToast('Please select a photo', 'error');
      return;
    }

    setUploading(true);
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('clientId', uploadData.clientId);
    formData.append('albumId', uploadData.albumId);
    formData.append('title', uploadData.title || `Upload for ${uploadData.clientName}`);
    formData.append('category', uploadData.category);

    try {
      const res = await fetch(`${API_URL}/images/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        showToast(`Photo uploaded for ${uploadData.clientName}!`, 'success');
        setIsUploadModalOpen(false);
        setSelectedFile(null);
        fetchData();
      } else {
        const data = await res.json();
        showToast(data.error || 'Upload failed', 'error');
      }
    } catch (error) {
      showToast('Connection error', 'error');
    } finally {
      setUploading(false);
    }
  };

  const openUploadModal = (client: any) => {
    setUploadData({
      clientId: client.id.toString(),
      clientName: client.name,
      albumId: '',
      title: '',
      category: 'Portrait'
    });
    setIsUploadModalOpen(true);
  };

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Client Management</h1>
            <p className="text-muted">Maintain your client relationships efficiently</p>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary flex items-center space-x-2 shadow-accent/20"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Client</span>
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 flex items-center space-x-4">
            <div className="p-3 bg-accent/10 rounded-xl text-accent">
              <Users size={24} />
            </div>
            <div>
              <p className="text-xs text-muted uppercase font-bold tracking-wider">Total Clients</p>
              <p className="text-2xl font-bold text-white">{clients.length}</p>
            </div>
          </div>
          <div className="glass-card p-6 flex items-center space-x-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-xs text-muted uppercase font-bold tracking-wider">Active This Month</p>
              <p className="text-2xl font-bold text-white">{clients.filter(c => c.status === 'active').length}</p>
            </div>
          </div>
          <div className="glass-card p-6 flex items-center space-x-4">
            <div className="p-3 bg-secondary/10 rounded-xl text-secondary">
              <Mail size={24} />
            </div>
            <div>
              <p className="text-xs text-muted uppercase font-bold tracking-wider">New Inquiries</p>
              <p className="text-2xl font-bold text-white">12</p>
            </div>
          </div>
        </div>

        {/* Table & Filters */}
        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input 
                type="text" 
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10 py-2 text-sm"
              />
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-xs text-white">
                <Filter size={14} />
                <span>Filter</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.02] text-muted text-[11px] uppercase tracking-wider font-bold">
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Last Activity</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-6 py-4">
                        <div className="h-10 bg-white/5 rounded-lg animate-pulse"></div>
                      </td>
                    </tr>
                  ))
                ) : filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-xs font-bold text-accent border border-accent/20">
                            {client.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{client.name}</p>
                            <p className="text-[10px] text-muted">Client ID: #C-{client.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2 text-sm text-muted">
                          <Mail size={14} className="text-accent/50" />
                          <span>{client.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                          client.status === 'active' 
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                            : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                        )}>
                          {client.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted">
                        {client.last_activity || 'No activity'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => openUploadModal(client)}
                            className="p-2 hover:bg-accent/10 rounded-lg transition-colors text-accent tooltip"
                            title="Upload for client"
                          >
                            <Upload size={16} />
                          </button>
                          <button 
                            onClick={() => {
                              setEditingClient(client);
                              setIsEditModalOpen(true);
                            }}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-muted hover:text-white"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteClient(client.id)}
                            className="p-2 hover:bg-rose-500/10 rounded-lg transition-colors text-muted hover:text-rose-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center space-y-3">
                        <Users className="w-10 h-10 text-white/10" />
                        <p className="text-muted text-sm">No clients found matching your search</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Client Modal */}
        <AnimatePresence>
          {isAddModalOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="glass-card w-full max-w-md overflow-hidden relative"
              >
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                  <h3 className="text-xl font-bold text-white">Add New Client</h3>
                  <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                    <X size={20} className="text-muted hover:text-white" />
                  </button>
                </div>
                
                <form onSubmit={handleAddClient} className="p-6 space-y-5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted uppercase tracking-wider px-1">Full Name</label>
                    <div className="relative group">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-accent transition-colors" />
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. Ashleigh G."
                        className="input-field pl-11 py-3 text-sm"
                        value={newClient.name}
                        onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted uppercase tracking-wider px-1">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-accent transition-colors" />
                      <input 
                        required
                        type="email" 
                        placeholder="e.g. ashleigh@example.com"
                        className="input-field pl-11 py-3 text-sm"
                        value={newClient.email}
                        onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted uppercase tracking-wider px-1">Status</label>
                    <select 
                      className="input-field py-3 text-sm appearance-none cursor-pointer"
                      value={newClient.status}
                      onChange={(e) => setNewClient({...newClient, status: e.target.value})}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>

                  <div className="pt-4 flex items-center space-x-3">
                    <button 
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="flex-1 py-3 border border-white/10 rounded-xl text-sm font-bold text-white hover:bg-white/5 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 btn-primary py-3 text-sm shadow-accent/20"
                    >
                      Create Client
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Edit Client Modal */}
        <AnimatePresence>
          {isEditModalOpen && editingClient && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="glass-card w-full max-w-md overflow-hidden"
              >
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                  <h3 className="text-xl font-bold text-white">Edit Client</h3>
                  <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                    <X size={20} className="text-muted hover:text-white" />
                  </button>
                </div>
                
                <form onSubmit={handleEditClient} className="p-6 space-y-5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted uppercase tracking-wider px-1">Full Name</label>
                    <input 
                      required
                      type="text" 
                      className="input-field py-3 text-sm"
                      value={editingClient.name}
                      onChange={(e) => setEditingClient({...editingClient, name: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted uppercase tracking-wider px-1">Email Address</label>
                    <input 
                      required
                      type="email" 
                      className="input-field py-3 text-sm"
                      value={editingClient.email}
                      onChange={(e) => setEditingClient({...editingClient, email: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted uppercase tracking-wider px-1">Status</label>
                    <select 
                      className="input-field py-3 text-sm appearance-none cursor-pointer"
                      value={editingClient.status}
                      onChange={(e) => setEditingClient({...editingClient, status: e.target.value})}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>

                  <div className="pt-4 flex items-center space-x-3">
                    <button 
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="flex-1 py-3 border border-white/10 rounded-xl text-sm font-bold text-white hover:bg-white/5 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 btn-primary py-3 text-sm shadow-accent/20"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Upload for Client Modal */}
        <AnimatePresence>
          {isUploadModalOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="glass-card w-full max-w-md overflow-hidden"
              >
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                  <div>
                    <h3 className="text-xl font-bold text-white">Upload for {uploadData.clientName}</h3>
                    <p className="text-xs text-muted mt-1">Directly link photos to this client</p>
                  </div>
                  <button onClick={() => setIsUploadModalOpen(false)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                    <X size={20} className="text-muted hover:text-white" />
                  </button>
                </div>
                
                <form onSubmit={handleClientUpload} className="p-6 space-y-5">
                  <div className="space-y-4">
                    {/* File Dropzone */}
                    <div className="group relative">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className={cn(
                        "border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all",
                        selectedFile 
                          ? "border-accent/40 bg-accent/5" 
                          : "border-white/10 group-hover:border-accent/40 group-hover:bg-white/5"
                      )}>
                        {selectedFile ? (
                          <div className="text-center">
                            <CheckCircle2 className="w-10 h-10 text-accent mx-auto mb-2" />
                            <p className="text-sm font-bold text-white truncate max-w-[200px]">{selectedFile.name}</p>
                            <p className="text-[10px] text-muted mt-1">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Upload className="w-10 h-10 text-white/10 mx-auto mb-2 group-hover:text-accent/50 group-hover:scale-110 transition-all" />
                            <p className="text-sm font-bold text-white">Drop your photo here</p>
                            <p className="text-[10px] text-muted mt-1">Supports JPG, PNG, WEBP (Max 10MB)</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted uppercase tracking-wider px-1">Album (Optional)</label>
                      <select 
                        className="input-field py-3 text-sm appearance-none cursor-pointer"
                        value={uploadData.albumId}
                        onChange={(e) => setUploadData({...uploadData, albumId: e.target.value})}
                      >
                        <option value="">No Album (General)</option>
                        {albums.map(album => (
                          <option key={album.id} value={album.id}>{album.title}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted uppercase tracking-wider px-1">Photo Title</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Wedding Portrait #1"
                        className="input-field py-3 text-sm"
                        value={uploadData.title}
                        onChange={(e) => setUploadData({...uploadData, title: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex items-center space-x-3">
                    <button 
                      type="button"
                      disabled={uploading}
                      onClick={() => setIsUploadModalOpen(false)}
                      className="flex-1 py-3 border border-white/10 rounded-xl text-sm font-bold text-white hover:bg-white/5 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={uploading}
                      className={cn(
                        "flex-1 btn-primary py-3 text-sm shadow-accent/20 flex items-center justify-center space-x-2",
                        uploading && "opacity-70 cursor-not-allowed"
                      )}
                    >
                      {uploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <span>Upload Now</span>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
