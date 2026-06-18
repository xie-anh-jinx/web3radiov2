import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { useNear } from '@/contexts/NearContext';
import { Loader2, Eye, Trash2, Plus, Edit, Wallet, Clock, AlertTriangle, Sparkles, ShieldCheck, Newspaper, Briefcase, Calendar, MapPin } from "lucide-react";
import { fetchEvents, deleteEvent, subscribeToTable } from '@/lib/api';
import EventEditor from '@/components/cms/EventEditor';
import CMSSidebar from '@/components/cms/CMSSidebar';
import DashboardOverview from '@/components/cms/DashboardOverview';
import logo from '@/assets/web3radio-logo.png';

const ALLOWED_ADDRESSES = [
  '9xhz4Cb4C2Z4z9xdD2geCafovNYVngC4E4XpWtQmeEuv', // Solana
  '0x242DfB7849544eE242b2265cA7E585bdec60456B', // EVM Admin
  'kotarominami.near', // Near
];
const isAllowed = (addr: string) => ALLOWED_ADDRESSES.map(a => a.toLowerCase()).includes(addr.toLowerCase());
const truncate = (addr: string) => addr ? `${addr.slice(0, 6)}...${addr.slice(-6)}` : '';

// Type definitions
type Event = {
  id: number;
  title: string;
  date: string;
  location: string;
  description: string;
  image_url?: string;
  category?: 'news' | 'job' | 'event';
  slug?: string;
  created_at?: string;
};


const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showEditor, setShowEditor] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { accountId, isConnected: isNearConnected } = useNear() as any;

  // Data states
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);

  // Check authentication: wallet address must match whitelist
  useEffect(() => {
    const saved = localStorage.getItem('web3radio_wallet_auth');

    if (!saved || !isAllowed(saved)) {
      navigate('/pintu_masuk');
      return;
    }

    // Also verify the currently-connected wallet still matches if connected
    const effectiveAddress = address || accountId;
    const effectiveConnected = isConnected || isNearConnected;

    if (effectiveConnected && effectiveAddress && !isAllowed(effectiveAddress)) {
      localStorage.removeItem('web3radio_wallet_auth');
      navigate('/pintu_masuk');
      return;
    }
    setIsAuthenticated(true);
  }, [navigate, isConnected, isNearConnected, address, accountId]);

  // Load data when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadData = async (isInitial = false) => {
      if (isInitial) setLoading(true);
      try {
        const { data, error } = await fetchEvents();
        if (error) throw error;
        setEvents(data || []);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        toast({
          title: "Error",
          description: "Gagal memuat data dari database.",
          variant: "destructive",
        });
      } finally {
        if (isInitial) setLoading(false);
      }
    };

    loadData(true);

    // Setup subscriptions - pass false to avoid loading screen on poll
    const eventsSub = subscribeToTable('events', () => loadData(false));

    return () => {
      eventsSub.unsubscribe();
    };
  }, [isAuthenticated, toast]);

  const handleLogout = () => {
    localStorage.removeItem('web3radio_wallet_auth');
    navigate('/pintu_masuk');
    toast({
      title: "Logged Out",
      description: "Anda telah keluar dari Control Panel.",
    });
  };

  const handleSaveComplete = () => {
    setShowEditor(false);
    setEventToEdit(null);
  };

  const handleEditEvent = (event: Event) => {
    setEventToEdit(event);
    setShowEditor(true);
  };

  const handleCancelEdit = () => {
    setShowEditor(false);
    setEventToEdit(null);
  };

  const handleDeleteEvent = async (id: number) => {
    if (window.confirm('Hapus artikel ini?')) {
      const { error } = await deleteEvent(id);
      if (error) {
        toast({
          title: "Error",
          description: "Gagal menghapus artikel",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Artikel berhasil dihapus",
        });
      }
    }
  };

  if (isAuthenticated === null || loading) {
    return (
      <div className="min-h-screen w-full bg-[#0a0a0a] flex justify-center items-center text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin opacity-20" />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-30">Loading Dashboard</p>
        </div>
      </div>
    );
  }

  // Render content based on active tab
  const renderContent = () => {
    if (activeTab === 'overview') {
      return (
        <DashboardOverview
          eventsCount={events.filter(e => e.category === 'event').length}
          newsCount={events.filter(e => e.category === 'news').length}
          jobsCount={events.filter(e => e.category === 'job').length}
        />
      );
    }

    // For events, news, and jobs tabs
    const categoryMap: Record<string, 'event' | 'news' | 'job'> = {
      'events': 'event',
      'news': 'news',
      'jobs': 'job'
    };

    const currentCategory = categoryMap[activeTab];
    if (!currentCategory) return null;

    const filteredArticles = events.filter(e => e.category === currentCategory || (currentCategory === 'event' && !e.category));
    const titleMap = { 'events': 'Web3 Events', 'news': 'Web3 News', 'jobs': 'Job Listings' };
    const IconMap = { 'events': Calendar, 'news': Newspaper, 'jobs': Briefcase };
    const ActiveIcon = IconMap[activeTab as keyof typeof IconMap];

    return (
      <div className="space-y-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <ActiveIcon className="h-5 w-5 text-white/60" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{titleMap[activeTab as keyof typeof titleMap]}</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mt-0.5">Manage your {activeTab} content</p>
            </div>
          </div>
          <button
            onClick={() => { setEventToEdit(null); setShowEditor(!showEditor); }}
            className="bg-white text-[#0a0a0a] font-bold py-3 px-7 rounded-2xl flex items-center justify-center gap-2.5 transition-all hover:bg-white/90 text-[10px] tracking-[0.2em] uppercase w-full sm:w-auto active:scale-95 shadow-2xl shadow-white/10"
          >
            <Plus className="h-4 w-4" />
            {showEditor ? 'Hide Editor' : `Add ${currentCategory}`}
          </button>
        </div>

        {showEditor && (
          <EventEditor
            onSave={handleSaveComplete}
            eventToEdit={eventToEdit}
            onCancel={handleCancelEdit}
          />
        )}

        {/* Articles List */}
        <div className="bg-white/5 backdrop-blur-xl rounded-[32px] overflow-hidden border border-white/10">
          <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-white text-base">Published {activeTab}</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mt-1">Live on Web3Radio Hub</p>
            </div>
            <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-white/40 uppercase tracking-widest">
              {filteredArticles.length} total
            </div>
          </div>
          <div className="divide-y divide-white/5">
            {filteredArticles.length > 0 ? (
              filteredArticles.map((event) => (
                <div key={event.id} className="flex items-center gap-5 p-6 hover:bg-white/3 transition-all group">
                  <div className="relative flex-shrink-0">
                    {event.image_url ? (
                      <img src={event.image_url} alt={event.title} className="w-16 h-16 object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500 ring-1 ring-white/10" />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <Edit className="h-6 w-6 text-white/10" />
                      </div>
                    )}
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#0f0f0f] border border-white/10 flex items-center justify-center">
                      <ActiveIcon className="h-2.5 w-2.5 text-white/50" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-base truncate group-hover:text-white/80 transition-colors">{event.title}</p>
                    <div className="flex items-center gap-4 mt-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        {new Date(event.date).toLocaleDateString()}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 flex items-center gap-1.5 truncate">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEditEvent(event)}
                      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/30 hover:text-white transition-all"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => navigate(`/events/${event.slug || event.id}`)} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/30 hover:text-white transition-all" title="View">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDeleteEvent(event.id)} className="p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400/60 hover:text-red-400 transition-all" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-20 text-center">
                <ActiveIcon className="h-14 w-14 mx-auto mb-5 text-white/5" />
                <h3 className="font-bold uppercase tracking-[0.3em] text-xs text-white/20">No {activeTab} articles yet</h3>
                <p className="text-[10px] text-white/10 mt-2">Start publishing content to your community</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Dashboard
  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] text-white flex relative overflow-hidden">
      {/* Sidebar */}
      <CMSSidebar
        onLogout={handleLogout}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setShowEditor(false);
        }}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto min-w-0 h-screen">
        {/* Top Bar */}
        <div className="bg-[#0f0f0f]/80 backdrop-blur-xl sticky top-0 z-20 border-b border-white/5 px-6 sm:px-10 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 ml-14 lg:ml-0">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Super Admin</span>
          </div>
          <div className="flex items-center gap-3">
            {(address || accountId) && (
              <button
                onClick={() => isNearConnected ? null : open()}
                className="hidden sm:flex items-center gap-2 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 text-violet-300 text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
                {truncate((address || accountId)!)}
              </button>
            )}
            <button
              onClick={handleLogout}
              className="bg-white/10 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-white/60 hover:text-red-300 text-[10px] font-bold uppercase tracking-widest px-5 py-2.5 rounded-xl transition-all"
            >
              Log Out
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-10 pb-32">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
