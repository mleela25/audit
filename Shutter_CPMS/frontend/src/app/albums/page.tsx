'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import { 
  ImageIcon, 
  Search, 
  Plus, 
  Upload, 
  MoreVertical, 
  Filter,
  X,
  ChevronRight,
  FolderPlus,
  Grid,
  List,
  Sparkles,
  Download,
  Trash2,
  ExternalLink,
  Lock,
  Eye,
  Edit,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/UI/ToastProvider';

export default function AlbumsPage() {
  const { showToast } = useToast();
  const [albums, setAlbums] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedImages, setSelectedImages] = useState<number[]>([]);
  
  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAlbumModalOpen, setIsAddAlbumModalOpen] = useState(false);
  const [isEditAlbumModalOpen, setIsEditAlbumModalOpen] = useState(false);
  
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Form states
  const [newImage, setNewImage] = useState({ title: '', albumId: '', category: 'Wedding', tags: '', clientId: '' });
  const [newAlbum, setNewAlbum] = useState({ title: '', description: '', category: 'Wedding', isPrivate: false });
  const [editingAlbum, setEditingAlbum] = useState<any>(null);

  const API_URL = '/api/v1';

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
      const [albumsRes, imagesRes, clientsRes] = await Promise.all([
        fetch(`${API_URL}/albums`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/images`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/clients`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      const albumsData = await albumsRes.json();
      const imagesData = await imagesRes.json();
      const clientsData = await clientsRes.json();
      
      if (albumsData.success) setAlbums(albumsData.data);
      if (imagesData.success) setImages(imagesData.data);
      if (clientsData.success) setClients(clientsData.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
      showToast('Failed to load gallery', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/albums`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newAlbum)
      });
      if (res.ok) {
        showToast('Album created successfully!', 'success');
        setIsAddAlbumModalOpen(false);
        setNewAlbum({ title: '', description: '', category: 'Wedding', isPrivate: false });
        fetchData();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to create album', 'error');
      }
    } catch (error) {
      showToast('Connection error', 'error');
    }
  };

  const handleUpdateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/albums/${editingAlbum.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingAlbum)
      });
      if (res.ok) {
        showToast('Album updated successfully!', 'success');
        setIsEditAlbumModalOpen(false);
        fetchData();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to update album', 'error');
      }
    } catch (error) {
      showToast('Connection error', 'error');
    }
  };

  const handleDeleteAlbum = async (id: number) => {
    if (!confirm('Are you sure you want to delete this album? All photos in it will be unlinked.')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/albums/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Album deleted', 'success');
        if (selectedAlbumId === id.toString()) setSelectedAlbumId(null);
        fetchData();
      } else {
        showToast('Failed to delete album', 'error');
      }
    } catch (error) {
      showToast('Connection error', 'error');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      showToast('Please select a file', 'error');
      return;
    }

    setUploading(true);
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('title', newImage.title);
    formData.append('albumId', newImage.albumId);
    formData.append('clientId', newImage.clientId);
    formData.append('category', newImage.category);
    formData.append('tags', newImage.tags);

    try {
      const res = await fetch(`${API_URL}/images/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        showToast('Photo uploaded and AI processed!', 'success');
        setIsUploadModalOpen(false);
        setSelectedFile(null);
        setNewImage({ title: '', albumId: '', category: 'Wedding', tags: '', clientId: '' });
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

  const handleDeleteImage = async (id: number) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/images/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Photo deleted', 'success');
        setSelectedImages(prev => prev.filter(imgId => imgId !== id));
        fetchData();
      } else {
        showToast('Failed to delete photo', 'error');
      }
    } catch (error) {
      showToast('Connection error', 'error');
    }
  };

  const handleSetCover = async (albumId: number, imageUrl: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/albums/${albumId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ cover_image: imageUrl })
      });
      if (res.ok) {
        showToast('Album cover updated!', 'success');
        fetchData();
      } else {
        showToast('Failed to update cover', 'error');
      }
    } catch (error) {
      showToast('Connection error', 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedImages.length} photos?`)) return;
    const token = localStorage.getItem('token');
    try {
      // Deleting sequentially for simplicity in this demo, though parallel is better
      await Promise.all(selectedImages.map(id => 
        fetch(`${API_URL}/images/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ));
      showToast(`${selectedImages.length} photos deleted`, 'success');
      setSelectedImages([]);
      fetchData();
    } catch (error) {
      showToast('Bulk delete failed partially', 'error');
    }
  };

  const filteredImages = images.filter(img => {
    const matchesAlbum = !selectedAlbumId || img.album_id?.toString() === selectedAlbumId;
    const matchesCategory = activeCategory === 'All' || img.category === activeCategory;
    const matchesSearch = img.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (img.tags && img.tags.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesAlbum && matchesCategory && matchesSearch;
  });
 
   const relatedImages = images.filter(img => {
     if (!selectedAlbumId) return false;
     const currentAlbum = albums.find(a => a.id.toString() === selectedAlbumId);
     if (!currentAlbum) return false;
     // Related means: same category OR same photographer, but NOT in this album
     return img.category === currentAlbum.category && img.album_id?.toString() !== selectedAlbumId;
   });

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:5001${url}`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Portfolio & Albums</h1>
            <p className="text-muted">Organize your masterpieces into stunning collections</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsUploadModalOpen(true)}
              className="btn-primary flex items-center space-x-2 shadow-accent/20"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Photos</span>
            </button>
            <button 
              onClick={() => setIsAddAlbumModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-sm font-medium"
            >
              <FolderPlus className="w-4 h-4 text-accent" />
              <span className="hidden sm:inline">New Album</span>
            </button>
          </div>
        </div>

        {/* Albums Horizontal Scroll */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Your Albums</h3>
            <button 
              onClick={() => setSelectedAlbumId(null)}
              className={cn(
                "text-sm hover:underline flex items-center",
                selectedAlbumId === null ? "text-accent font-bold" : "text-muted"
              )}
            >
              Show All Photos <ChevronRight size={16} />
            </button>
          </div>
          <div className="flex space-x-4 overflow-x-auto pb-4 custom-scrollbar">
            {albums.map((album) => (
              <motion.div 
                key={album.id}
                whileHover={{ y: -5 }}
                onClick={() => setSelectedAlbumId(album.id.toString())}
                className={cn(
                  "min-w-[240px] glass-card p-4 group cursor-pointer transition-all border-2",
                  selectedAlbumId === album.id.toString() ? "border-accent" : "border-white/10 hover:border-accent/40"
                )}
              >
                <div className="aspect-[4/3] rounded-xl bg-white/5 mb-4 overflow-hidden relative">
                  {album.cover_image ? (
                    <img src={getImageUrl(album.cover_image)} alt={album.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/10">
                      <ImageIcon size={48} />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingAlbum(album);
                        setIsEditAlbumModalOpen(true);
                      }}
                      className="p-1.5 bg-black/60 backdrop-blur-md rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent"
                    >
                      <Edit size={12} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAlbum(album.id);
                      }}
                      className="p-1.5 bg-black/60 backdrop-blur-md rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  {album.is_private ? (
                    <div className="absolute bottom-2 left-2 p-1.5 bg-black/60 backdrop-blur-md rounded-lg text-white">
                      <Lock size={12} />
                    </div>
                  ) : (
                    <div className="absolute bottom-2 left-2 p-1.5 bg-accent/60 backdrop-blur-md rounded-lg text-white">
                      <Eye size={12} />
                    </div>
                  )}
                </div>
                <h4 className="font-bold text-white truncate">{album.title}</h4>
                <p className="text-xs text-muted mt-1">{album.category} • {images.filter(img => img.album_id === album.id).length} Photos</p>
              </motion.div>
            ))}
            <button 
              onClick={() => setIsAddAlbumModalOpen(true)}
              className="min-w-[240px] border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center space-y-2 hover:border-accent/40 hover:bg-white/5 transition-all text-muted hover:text-accent group"
            >
              <div className="p-3 bg-white/5 rounded-xl group-hover:scale-110 transition-transform">
                <Plus size={24} />
              </div>
              <span className="text-sm font-bold">Create New Album</span>
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="glass-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 min-w-[200px] md:min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input 
                type="text" 
                placeholder="Search images, tags, or categories..."
                className="input-field pl-10 py-2 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1">
              <button 
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-1.5 rounded-lg transition-all",
                  viewMode === 'grid' ? "bg-accent text-white shadow-lg" : "text-muted hover:text-white"
                )}
              >
                <Grid size={16} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-1.5 rounded-lg transition-all",
                  viewMode === 'list' ? "bg-accent text-white shadow-lg" : "text-muted hover:text-white"
                )}
              >
                <List size={16} />
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-3 overflow-x-auto pb-2 md:pb-0">
             {['All', 'Wedding', 'Portrait', 'Event', 'Landscape', 'Commercial'].map(cat => (
               <button 
                 key={cat} 
                 onClick={() => setActiveCategory(cat)}
                 className={cn(
                   "whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold border transition-all",
                   activeCategory === cat 
                     ? "bg-accent border-accent text-white shadow-lg" 
                     : "border-white/10 text-muted hover:border-accent hover:text-accent"
                 )}
               >
                 {cat}
               </button>
             ))}
          </div>
        </div>

        {/* Bulk Actions Bar */}
        <AnimatePresence>
          {selectedImages.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[50] glass-card px-8 py-4 flex items-center space-x-8 shadow-2xl border-accent/20 bg-black/80 backdrop-blur-xl"
            >
              <div className="flex items-center space-x-3 pr-8 border-r border-white/10">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white font-bold text-xs">
                  {selectedImages.length}
                </div>
                <span className="text-sm font-bold text-white">Photos Selected</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <button 
                  onClick={handleBulkDelete}
                  className="flex items-center space-x-2 text-rose-500 hover:text-rose-400 transition-colors px-4 py-2 hover:bg-rose-500/10 rounded-xl"
                >
                  <Trash2 size={18} />
                  <span className="text-sm font-bold">Delete Selected</span>
                </button>
                <button 
                  onClick={() => setSelectedImages([])}
                  className="text-sm font-bold text-muted hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gallery Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array(10).fill(0).map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl bg-white/5 animate-pulse border border-white/10"></div>
            ))}
          </div>
        ) : filteredImages.length > 0 ? (
          <div className={cn(
            viewMode === 'grid' 
              ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
              : "space-y-4"
          )}>
            {filteredImages.map((img, index) => (
              <motion.div 
                key={img.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  setSelectedImages(prev => 
                    prev.includes(img.id) ? prev.filter(id => id !== img.id) : [...prev, img.id]
                  );
                }}
                className={cn(
                  "group relative glass-card overflow-hidden cursor-pointer border-2 transition-all",
                  selectedImages.includes(img.id) ? "border-accent bg-accent/5" : "border-white/10 hover:border-accent/40",
                  viewMode === 'grid' ? "aspect-square" : "flex items-center p-3"
                )}
              >
                {/* Selection Checkbox */}
                <div className={cn(
                  "absolute top-3 left-3 z-10 w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                  selectedImages.includes(img.id) 
                    ? "bg-accent border-accent text-white" 
                    : "bg-black/40 border-white/20 opacity-0 group-hover:opacity-100"
                )}>
                  {selectedImages.includes(img.id) && <Check size={12} strokeWidth={4} />}
                </div>

                <img 
                  src={getImageUrl(img.compressed_url || img.original_url)} 
                  alt={img.title}
                  className={cn(
                    "object-cover transition-transform duration-500 group-hover:scale-110",
                    viewMode === 'grid' ? "w-full h-full" : "w-20 h-20 rounded-xl"
                  )}
                />
                
                {viewMode === 'grid' ? (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-bold text-white truncate">{img.title}</p>
                        {img.client_id && (
                          <p className="text-[10px] text-accent font-medium">
                            Client: {clients.find(c => c.id === img.client_id)?.name || 'Unknown'}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        {img.album_id && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetCover(img.album_id, img.original_url);
                            }}
                            className="p-1.5 bg-white/10 hover:bg-accent rounded-lg text-white transition-colors"
                            title="Set as Album Cover"
                          >
                            <ImageIcon size={12} />
                          </button>
                        )}
                        <button className="p-1.5 bg-accent rounded-lg text-white shadow-lg">
                          <Sparkles size={12} />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {img.tags?.split(',').map((tag: string) => (
                        <span key={tag} className="text-[8px] bg-white/10 text-white px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider border border-white/10">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                       <span className="text-[10px] text-muted">{img.category}</span>
                       <div className="flex items-center space-x-2">
                          <a href={`http://localhost:5001${img.original_url}`} download className="p-1 hover:text-white transition-colors">
                            <Download size={12} />
                          </a>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteImage(img.id);
                            }}
                            className="p-1 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 px-6 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white">{img.title}</h4>
                      <p className="text-xs text-muted">{img.category} • {img.tags}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                       <div className="text-right">
                         <p className="text-xs font-bold text-white">{(img.size / (1024 * 1024)).toFixed(2)} MB</p>
                         <p className="text-[10px] text-muted">Uploaded {new Date(img.created_at).toLocaleDateString()}</p>
                       </div>
                       <div className="flex items-center space-x-2">
                          <a href={`http://localhost:5001${img.original_url}`} download className="p-2 hover:bg-white/5 rounded-lg text-muted hover:text-white transition-colors">
                            <Download size={18} />
                          </a>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteImage(img.id);
                            }}
                            className="p-2 hover:bg-white/5 rounded-lg text-muted hover:text-rose-500 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                          {img.album_id && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSetCover(img.album_id, img.original_url);
                              }}
                              className="p-2 hover:bg-white/5 rounded-lg text-muted hover:text-accent transition-colors"
                              title="Set as Album Cover"
                            >
                              <ImageIcon size={18} />
                            </button>
                          )}
                          <button className="p-2 hover:bg-white/5 rounded-lg text-muted hover:text-accent transition-colors">
                            <MoreVertical size={18} />
                          </button>
                       </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="glass-card py-32 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-20 h-20 bg-accent/5 rounded-full flex items-center justify-center text-accent/20 border border-accent/10">
                <ImageIcon size={40} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{selectedAlbumId ? "This album is empty" : "Your gallery is empty"}</h3>
                <p className="text-muted max-w-xs mx-auto mt-2">
                  {selectedAlbumId 
                    ? "Add some photos to this collection to see them here." 
                    : "Start uploading your high-resolution photos and organize them into beautiful albums."}
                </p>
              </div>
              <button 
                onClick={() => setIsUploadModalOpen(true)}
                className="btn-primary flex items-center space-x-2 px-8 shadow-accent/20"
              >
                <Plus size={18} />
                <span>Add Photo</span>
              </button>
            </div>
          </div>
        )}

        {/* Related Images Section */}
        {selectedAlbumId && relatedImages.length > 0 && (
          <div className="pt-12 space-y-6 border-t border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles size={18} className="text-accent" />
                  Related Images
                </h3>
                <p className="text-sm text-muted mt-1">Images from the same category that might interest you.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {relatedImages.slice(0, 6).map((img) => (
                <motion.div 
                  key={img.id}
                  whileHover={{ scale: 1.02 }}
                  className="aspect-square glass-card overflow-hidden relative group border border-white/10 hover:border-accent/40"
                  onClick={() => setSelectedAlbumId(img.album_id?.toString() || null)}
                >
                  <img 
                    src={getImageUrl(img.compressed_url || img.original_url)} 
                    alt={img.title}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-100 group-hover:opacity-0 transition-opacity flex items-center justify-center">
                    <p className="text-[10px] font-bold text-white/60 group-hover:text-white uppercase tracking-widest">{img.category}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Modal */}
        <AnimatePresence>
          {isUploadModalOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="glass-card w-full max-w-lg overflow-hidden relative"
              >
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                  <h3 className="text-xl font-bold text-white">Upload New Photo</h3>
                  <button onClick={() => setIsUploadModalOpen(false)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                    <X size={20} className="text-muted hover:text-white" />
                  </button>
                </div>
                
                <form onSubmit={handleUpload} className="p-6 space-y-5">
                  <div 
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="p-10 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center space-y-4 hover:border-accent/40 transition-all cursor-pointer group bg-white/[0.01]"
                  >
                    <input 
                      id="file-upload"
                      type="file" 
                      className="hidden" 
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    />
                    <div className="p-4 bg-accent/10 rounded-2xl text-accent group-hover:scale-110 transition-transform">
                      <Upload size={32} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-white">
                        {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
                      </p>
                      <p className="text-xs text-muted mt-1">RAW, JPG, PNG up to 50MB</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted uppercase tracking-wider px-1">Photo Title</label>
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. Summer Sunset"
                        className="input-field py-3 text-sm"
                        value={newImage.title}
                        onChange={(e) => setNewImage({...newImage, title: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted uppercase tracking-wider px-1">Album (Optional)</label>
                      <select 
                        className="input-field py-3 text-sm appearance-none cursor-pointer"
                        value={newImage.albumId}
                        onChange={(e) => setNewImage({...newImage, albumId: e.target.value})}
                      >
                        <option value="">No Album (General)</option>
                        {albums.map(album => (
                          <option key={album.id} value={album.id}>{album.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted uppercase tracking-wider px-1">Client (Optional)</label>
                      <select 
                        className="input-field py-3 text-sm appearance-none cursor-pointer"
                        value={newImage.clientId}
                        onChange={(e) => setNewImage({...newImage, clientId: e.target.value})}
                      >
                        <option value="">No Client</option>
                        {clients.map(client => (
                          <option key={client.id} value={client.id}>{client.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted uppercase tracking-wider px-1">Category</label>
                      <select 
                        className="input-field py-3 text-sm appearance-none cursor-pointer"
                        value={newImage.category}
                        onChange={(e) => setNewImage({...newImage, category: e.target.value})}
                      >
                        <option value="Wedding">Wedding</option>
                        <option value="Portrait">Portrait</option>
                        <option value="Event">Event</option>
                        <option value="Nature">Nature</option>
                        <option value="Studio">Studio</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center space-x-3">
                    <button 
                      type="button"
                      onClick={() => setIsUploadModalOpen(false)}
                      className="flex-1 py-3 border border-white/10 rounded-xl text-sm font-bold text-white hover:bg-white/5 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={uploading}
                      className="flex-1 btn-primary py-3 text-sm shadow-accent/20 flex items-center justify-center space-x-2"
                    >
                      {uploading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : <Upload size={16} />}
                      <span>{uploading ? 'Processing AI...' : 'Start Upload'}</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Create Album Modal */}
        <AnimatePresence>
          {isAlbumModalOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="glass-card w-full max-w-md overflow-hidden relative"
              >
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                  <h3 className="text-xl font-bold text-white">Create New Album</h3>
                  <button onClick={() => setIsAddAlbumModalOpen(false)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                    <X size={20} className="text-muted hover:text-white" />
                  </button>
                </div>
                
                <form onSubmit={handleCreateAlbum} className="p-6 space-y-5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted uppercase tracking-wider px-1">Album Title</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. Summer Wedding 2024"
                      className="input-field py-3 text-sm"
                      value={newAlbum.title}
                      onChange={(e) => setNewAlbum({...newAlbum, title: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted uppercase tracking-wider px-1">Description</label>
                    <textarea 
                      placeholder="Album description..."
                      className="input-field py-3 text-sm resize-none"
                      rows={3}
                      value={newAlbum.description}
                      onChange={(e) => setNewAlbum({...newAlbum, description: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted uppercase tracking-wider px-1">Category</label>
                      <select 
                        className="input-field py-3 text-sm appearance-none cursor-pointer"
                        value={newAlbum.category}
                        onChange={(e) => setNewAlbum({...newAlbum, category: e.target.value})}
                      >
                        <option value="Wedding">Wedding</option>
                        <option value="Portrait">Portrait</option>
                        <option value="Event">Event</option>
                        <option value="Nature">Nature</option>
                        <option value="Studio">Studio</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted uppercase tracking-wider px-1">Privacy</label>
                      <div className="flex items-center space-x-2 h-12">
                        <button 
                          type="button"
                          onClick={() => setNewAlbum({...newAlbum, isPrivate: !newAlbum.isPrivate})}
                          className={cn(
                            "flex-1 h-full rounded-xl text-xs font-bold transition-all border flex items-center justify-center space-x-2",
                            newAlbum.isPrivate ? "bg-accent/10 border-accent text-accent" : "bg-white/5 border-white/10 text-muted"
                          )}
                        >
                          {newAlbum.isPrivate ? <Lock size={14} /> : <Eye size={14} />}
                          <span>{newAlbum.isPrivate ? 'Private' : 'Public'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center space-x-3">
                    <button 
                      type="button"
                      onClick={() => setIsAddAlbumModalOpen(false)}
                      className="flex-1 py-3 border border-white/10 rounded-xl text-sm font-bold text-white hover:bg-white/5 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 btn-primary py-3 text-sm shadow-accent/20"
                    >
                      Create Album
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Edit Album Modal */}
        <AnimatePresence>
          {isEditAlbumModalOpen && editingAlbum && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="glass-card w-full max-w-md overflow-hidden relative"
              >
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                  <h3 className="text-xl font-bold text-white">Edit Album</h3>
                  <button onClick={() => setIsEditAlbumModalOpen(false)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                    <X size={20} className="text-muted hover:text-white" />
                  </button>
                </div>
                
                <form onSubmit={handleUpdateAlbum} className="p-6 space-y-5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted uppercase tracking-wider px-1">Album Title</label>
                    <input 
                      required
                      type="text" 
                      className="input-field py-3 text-sm"
                      value={editingAlbum.title}
                      onChange={(e) => setEditingAlbum({...editingAlbum, title: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted uppercase tracking-wider px-1">Description</label>
                    <textarea 
                      className="input-field py-3 text-sm resize-none"
                      rows={3}
                      value={editingAlbum.description}
                      onChange={(e) => setEditingAlbum({...editingAlbum, description: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted uppercase tracking-wider px-1">Category</label>
                      <select 
                        className="input-field py-3 text-sm appearance-none cursor-pointer"
                        value={editingAlbum.category}
                        onChange={(e) => setEditingAlbum({...editingAlbum, category: e.target.value})}
                      >
                        <option value="Wedding">Wedding</option>
                        <option value="Portrait">Portrait</option>
                        <option value="Event">Event</option>
                        <option value="Nature">Nature</option>
                        <option value="Studio">Studio</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted uppercase tracking-wider px-1">Privacy</label>
                      <div className="flex items-center space-x-2 h-12">
                        <button 
                          type="button"
                          onClick={() => setEditingAlbum({...editingAlbum, is_private: editingAlbum.is_private ? 0 : 1})}
                          className={cn(
                            "flex-1 h-full rounded-xl text-xs font-bold transition-all border flex items-center justify-center space-x-2",
                            editingAlbum.is_private ? "bg-accent/10 border-accent text-accent" : "bg-white/5 border-white/10 text-muted"
                          )}
                        >
                          {editingAlbum.is_private ? <Lock size={14} /> : <Eye size={14} />}
                          <span>{editingAlbum.is_private ? 'Private' : 'Public'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center space-x-3">
                    <button 
                      type="button"
                      onClick={() => setIsEditAlbumModalOpen(false)}
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
      </div>
    </DashboardLayout>
  );
}
