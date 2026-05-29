import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    LayoutDashboard,
    Calendar,
    Newspaper,
    Briefcase,
    Settings,
    LogOut,
    Menu,
    X,
    Radio
} from 'lucide-react';
import logo from '@/assets/web3radio-logo.png';
import { cn } from '@/lib/utils';

interface CMSSidebarProps {
    onLogout: () => void;
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const CMSSidebar: React.FC<CMSSidebarProps> = ({ onLogout, activeTab, onTabChange }) => {
    const [mobileOpen, setMobileOpen] = useState(false);

    const menuItems = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'events', label: 'Events', icon: Calendar },
        { id: 'news', label: 'News', icon: Newspaper },
        { id: 'jobs', label: 'Jobs', icon: Briefcase },
    ];

    const handleTabChange = (tab: string) => {
        onTabChange(tab);
        setMobileOpen(false);
    };

    const SidebarContent = () => (
        <>
            {/* Logo */}
            <div className="p-6 sm:p-8 border-b border-white/5">
                <Link to="/" className="flex items-center gap-4 group">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 group-hover:rotate-6 ring-2 ring-white/10">
                        <img
                            src={logo}
                            alt="Web3Radio"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="hidden sm:block">
                        <h1 className="text-white font-bold text-sm tracking-tight uppercase">Web3Radio</h1>
                        <p className="text-white/30 text-[8px] font-bold uppercase tracking-[0.3em]">Control Panel</p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 sm:p-6 space-y-1.5 overflow-y-auto">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => handleTabChange(item.id)}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3.5 rounded-[18px] transition-all duration-300 group relative",
                            activeTab === item.id
                                ? 'bg-white/10 text-white shadow-lg border border-white/10'
                                : 'text-white/30 hover:bg-white/5 hover:text-white/70'
                        )}
                    >
                        <item.icon className={cn(
                            "w-4 h-4 flex-shrink-0 transition-transform duration-300 group-hover:scale-110",
                            activeTab === item.id ? 'text-white' : 'text-white/30 group-hover:text-white/60'
                        )} />
                        <span className="flex-1 text-left text-[10px] sm:text-xs font-bold uppercase tracking-widest">{item.label}</span>
                        {activeTab === item.id && (
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        )}
                    </button>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-4 sm:p-6 border-t border-white/5 space-y-1.5">
                <Link
                    to="/"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-[18px] text-white/30 hover:bg-white/5 hover:text-white/70 transition-all duration-300"
                >
                    <Radio className="w-4 h-4 flex-shrink-0" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Back to Site</span>
                </Link>
                <button
                    onClick={() => {
                        localStorage.removeItem('solana_wallet_auth');
                        onLogout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-[18px] text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300"
                >
                    <LogOut className="w-4 h-4 flex-shrink-0" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Logout</span>
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden fixed top-5 left-5 z-50 p-3.5 rounded-2xl bg-[#0f0f0f]/80 backdrop-blur-xl shadow-2xl border border-white/10 text-white"
            >
                {mobileOpen ? (
                    <X className="w-5 h-5" />
                ) : (
                    <Menu className="w-5 h-5" />
                )}
            </button>

            {/* Desktop Sidebar */}
            <div className="hidden lg:flex w-64 xl:w-72 h-screen flex-col bg-[#0f0f0f] border-r border-white/5">
                <SidebarContent />
            </div>

            {/* Mobile Sidebar Overlay */}
            <div
                className={cn(
                    "lg:hidden fixed inset-0 z-40 transition-all duration-500",
                    mobileOpen
                        ? "opacity-100 pointer-events-auto"
                        : "opacity-0 pointer-events-none"
                )}
            >
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={() => setMobileOpen(false)}
                />

                {/* Sidebar Panel */}
                <div
                    className={cn(
                        "absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] flex flex-col bg-[#0f0f0f] border-r border-white/5 shadow-2xl transform transition-transform duration-500 ease-out",
                        mobileOpen ? "translate-x-0" : "-translate-x-full"
                    )}
                >
                    <SidebarContent />
                </div>
            </div>
        </>
    );
};

export default CMSSidebar;
