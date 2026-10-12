'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Plus, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Mail,
  Camera,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/UI/ToastProvider';

export default function BookingsPage() {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [newBooking, setNewBooking] = useState({ 
    clientName: '', 
    clientEmail: '', 
    shootDate: '', 
    shootType: 'Wedding', 
    price: '' 
  });

  const API_URL = '/api/v1';

  // Helper for calendar
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const filteredBookings = selectedDate 
    ? bookings.filter(b => {
        const bDate = new Date(b.shoot_date);
        return bDate.getDate() === selectedDate.getDate() && 
               bDate.getMonth() === selectedDate.getMonth() && 
               bDate.getFullYear() === selectedDate.getFullYear();
      })
    : bookings;

  const fetchBookings = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/bookings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setBookings(data.data);
      }
    } catch (error) {
      showToast('Failed to load bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleAddBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newBooking)
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Booking scheduled successfully!', 'success');
        setIsAddModalOpen(false);
        setNewBooking({ clientName: '', clientEmail: '', shootDate: '', shootType: 'Wedding', price: '' });
        fetchBookings();
      } else {
        showToast(data.error || 'Failed to add booking', 'error');
      }
    } catch (error) {
      showToast('Connection error', 'error');
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/bookings/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showToast(`Booking ${status}!`, 'success');
        fetchBookings();
      } else {
        showToast('Failed to update status', 'error');
      }
    } catch (error) {
      showToast('Connection error', 'error');
    }
  };

  const handleDeleteBooking = async (id: number) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/bookings/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Booking deleted', 'success');
        fetchBookings();
      } else {
        showToast('Failed to delete booking', 'error');
      }
    } catch (error) {
      showToast('Connection error', 'error');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'completed': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'cancelled': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      default: return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Bookings & Calendar</h1>
            <p className="text-muted">Manage your upcoming shoots and availability</p>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary flex items-center space-x-2 shadow-accent/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Booking</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Calendar Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
                <div className="flex space-x-2">
                  <button 
                    onClick={prevMonth}
                    className="p-1.5 hover:bg-white/5 rounded-lg text-muted hover:text-white transition-colors"
                  >
                    <ChevronRight className="rotate-180" size={18} />
                  </button>
                  <button 
                    onClick={nextMonth}
                    className="p-1.5 hover:bg-white/5 rounded-lg text-muted hover:text-white transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-muted uppercase tracking-widest mb-4">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d} className="py-1">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {/* Empty slots for days of previous month */}
                {Array(getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth())).fill(0).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square"></div>
                ))}
                
                {/* Days of current month */}
                {Array(getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth())).fill(0).map((_, i) => {
                  const day = i + 1;
                  const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                  const isToday = new Date().toDateString() === dateObj.toDateString();
                  const isSelected = selectedDate?.toDateString() === dateObj.toDateString();
                  const hasBooking = bookings.some(b => new Date(b.shoot_date).toDateString() === dateObj.toDateString());

                  return (
                    <div 
                      key={day} 
                      onClick={() => setSelectedDate(isSelected ? null : dateObj)}
                      className={cn(
                        "aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-semibold transition-all cursor-pointer border relative group",
                        isSelected 
                          ? "bg-accent border-accent text-white shadow-lg shadow-accent/20" 
                          : isToday
                            ? "bg-white/10 border-white/20 text-white"
                            : "bg-white/5 border-transparent text-muted hover:border-white/20 hover:text-white"
                      )}
                    >
                      {day}
                      {hasBooking && !isSelected && (
                        <div className="absolute bottom-1 w-1 h-1 rounded-full bg-accent animate-pulse"></div>
                      )}
                    </div>
                  );
                })}
              </div>
              {selectedDate && (
                <button 
                  onClick={() => setSelectedDate(null)}
                  className="w-full mt-4 py-2 text-[10px] font-bold text-accent uppercase tracking-widest hover:bg-accent/5 rounded-lg transition-all"
                >
                  Clear Selection
                </button>
              )}
            </div>

            <div className="glass-card p-6 space-y-4">
              <h3 className="text-lg font-bold text-white">Booking Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <span className="text-xs text-muted">Confirmed</span>
                  <span className="text-sm font-bold text-emerald-500">{bookings.filter(b => b.status === 'confirmed').length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <span className="text-xs text-muted">Pending</span>
                  <span className="text-sm font-bold text-amber-500">{bookings.filter(b => b.status === 'pending').length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <span className="text-xs text-muted">Completed</span>
                  <span className="text-sm font-bold text-blue-500">{bookings.filter(b => b.status === 'completed').length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bookings List */}
          <div className="lg:col-span-8 space-y-4">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-24 glass-card animate-pulse"></div>
              ))
            ) : filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => {
                const bDate = new Date(booking.shoot_date);
                return (
                  <motion.div 
                    key={booking.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-card p-5 flex items-center justify-between group hover:border-accent/40 transition-all cursor-pointer"
                  >
                    <div className="flex items-center space-x-5">
                      <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex flex-col items-center justify-center text-accent">
                        <span className="text-[10px] font-bold uppercase tracking-tighter">
                          {monthNames[bDate.getMonth()].substring(0, 3)}
                        </span>
                        <span className="text-xl font-black leading-none">{bDate.getDate()}</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white group-hover:text-accent transition-colors">{booking.client_name}</h4>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center space-x-1.5 text-xs text-muted">
                            <Camera size={12} className="text-accent" />
                            <span>{booking.shoot_type}</span>
                          </div>
                          <div className="flex items-center space-x-1.5 text-xs text-muted">
                            <Clock size={12} className="text-accent" />
                            <span>10:00 AM - 2:00 PM</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right hidden md:block">
                        <p className="text-sm font-bold text-white">${booking.price}</p>
                        <p className="text-[10px] text-muted uppercase font-bold tracking-widest mt-0.5">Project Value</p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className={cn(
                          "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                          getStatusColor(booking.status)
                        )}>
                          {booking.status}
                        </span>
                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {booking.status === 'pending' && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleUpdateStatus(booking.id, 'confirmed'); }}
                              className="p-1.5 hover:bg-emerald-500/10 rounded-lg text-muted hover:text-emerald-500 transition-all"
                              title="Confirm"
                            >
                              <CheckCircle2 size={16} />
                            </button>
                          )}
                          {booking.status === 'confirmed' && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleUpdateStatus(booking.id, 'completed'); }}
                              className="p-1.5 hover:bg-blue-500/10 rounded-lg text-muted hover:text-blue-500 transition-all"
                              title="Complete"
                            >
                              <CheckCircle2 size={16} />
                            </button>
                          )}
                          {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleUpdateStatus(booking.id, 'cancelled'); }}
                              className="p-1.5 hover:bg-rose-500/10 rounded-lg text-muted hover:text-rose-500 transition-all"
                              title="Cancel"
                            >
                              <XCircle size={16} />
                            </button>
                          )}
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteBooking(booking.id); }}
                            className="p-1.5 hover:bg-white/10 rounded-lg text-muted hover:text-white transition-all"
                            title="Delete"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="glass-card py-24 text-center">
                <Calendar size={48} className="text-white/10 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white">
                  {selectedDate ? `No shoots on ${selectedDate.toDateString()}` : 'No upcoming shoots'}
                </h3>
                <p className="text-muted mt-2">
                  {selectedDate ? 'Try selecting another date.' : 'You have a clear schedule. Time to book some clients!'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Add Booking Modal */}
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
                  <h3 className="text-xl font-bold text-white">New Shoot Booking</h3>
                  <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                    <X size={20} className="text-muted hover:text-white" />
                  </button>
                </div>
                
                <form onSubmit={handleAddBooking} className="p-6 space-y-5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted uppercase tracking-wider px-1">Client Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-accent transition-colors" />
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. Ashleigh G."
                        className="input-field pl-11 py-3 text-sm"
                        value={newBooking.clientName}
                        onChange={(e) => setNewBooking({...newBooking, clientName: e.target.value})}
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
                        value={newBooking.clientEmail}
                        onChange={(e) => setNewBooking({...newBooking, clientEmail: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted uppercase tracking-wider px-1">Shoot Date</label>
                      <input 
                        required
                        type="date" 
                        className="input-field py-3 text-sm"
                        value={newBooking.shootDate}
                        onChange={(e) => setNewBooking({...newBooking, shootDate: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted uppercase tracking-wider px-1">Price ($)</label>
                      <input 
                        required
                        type="number" 
                        placeholder="1200"
                        className="input-field py-3 text-sm"
                        value={newBooking.price}
                        onChange={(e) => setNewBooking({...newBooking, price: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted uppercase tracking-wider px-1">Shoot Type</label>
                    <select 
                      className="input-field py-3 text-sm appearance-none cursor-pointer"
                      value={newBooking.shootType}
                      onChange={(e) => setNewBooking({...newBooking, shootType: e.target.value})}
                    >
                      <option value="Wedding">Wedding</option>
                      <option value="Portrait">Portrait</option>
                      <option value="Event">Event</option>
                      <option value="Nature">Nature</option>
                      <option value="Studio">Studio</option>
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
                      Schedule Shoot
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
