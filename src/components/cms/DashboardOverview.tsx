
import React from 'react';
import { Calendar, Newspaper, Briefcase, TrendingUp, Clock, Sparkles, Zap } from "lucide-react";

interface DashboardOverviewProps {
    eventsCount: number;
    newsCount: number;
    jobsCount: number;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({
    eventsCount,
    newsCount,
    jobsCount
}) => {
    const stats = [
        {
            title: "Web3 Events",
            value: eventsCount,
            icon: Calendar,
            accent: "#a78bfa",
            glow: "shadow-purple-500/20",
            bg: "bg-purple-500/10",
            border: "border-purple-500/20"
        },
        {
            title: "News Articles",
            value: newsCount,
            icon: Newspaper,
            accent: "#60a5fa",
            glow: "shadow-blue-500/20",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20"
        },
        {
            title: "Job Listings",
            value: jobsCount,
            icon: Briefcase,
            accent: "#fb923c",
            glow: "shadow-orange-500/20",
            bg: "bg-orange-500/10",
            border: "border-orange-500/20"
        }
    ];

    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div className="bg-white/5 backdrop-blur-xl rounded-[32px] p-8 border border-white/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 pointer-events-none" />
                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center shadow-2xl">
                        <Sparkles className="h-8 w-8 text-purple-300" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Welcome, Admin</h1>
                        <p className="text-white/40 font-medium mt-1 text-sm">Manage your Web3Radio Hub content from here.</p>
                    </div>
                    <div className="ml-auto hidden sm:flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-2xl px-5 py-3">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-green-300 text-[10px] font-bold uppercase tracking-widest">Live</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className={`bg-white/5 backdrop-blur-xl rounded-[28px] p-7 border ${stat.border} shadow-xl ${stat.glow} hover:bg-white/8 transition-all duration-500 group cursor-default`}
                    >
                        <div className="flex items-start justify-between mb-6">
                            <div className={`p-3.5 rounded-2xl ${stat.bg} border ${stat.border} group-hover:scale-110 transition-transform duration-500`}>
                                <stat.icon className="h-5 w-5" style={{ color: stat.accent }} />
                            </div>
                            <Zap className="h-4 w-4 text-white/10 group-hover:text-white/20 transition-colors" />
                        </div>
                        <p className="text-4xl font-bold text-white tracking-tight">{stat.value}</p>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mt-2">{stat.title}</p>
                    </div>
                ))}
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 backdrop-blur-xl rounded-[28px] overflow-hidden border border-white/10">
                    <div className="p-6 border-b border-white/5 flex items-center gap-3">
                        <Clock className="h-4 w-4 text-white/30" />
                        <h3 className="font-bold text-white/70 uppercase text-[10px] tracking-widest">Recent Activity</h3>
                    </div>
                    <div className="p-6 space-y-5">
                        <div className="flex items-center gap-4">
                            <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
                            <span className="text-sm text-white/60 flex-1 font-medium">Control Panel session active</span>
                            <span className="text-[10px] font-bold text-white/20 uppercase">Now</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-2.5 h-2.5 bg-blue-400 rounded-full flex-shrink-0" />
                            <span className="text-sm text-white/60 flex-1 font-medium">Database synchronized</span>
                            <span className="text-[10px] font-bold text-white/20 uppercase">Today</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-2.5 h-2.5 bg-purple-400 rounded-full flex-shrink-0" />
                            <span className="text-sm text-white/60 flex-1 font-medium">Wallet authentication verified</span>
                            <span className="text-[10px] font-bold text-white/20 uppercase">Today</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white/5 backdrop-blur-xl rounded-[28px] overflow-hidden border border-white/10">
                    <div className="p-6 border-b border-white/5 flex items-center gap-3">
                        <TrendingUp className="h-4 w-4 text-white/30" />
                        <h3 className="font-bold text-white/70 uppercase text-[10px] tracking-widest">Dashboard Tips</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <p className="text-sm text-white/40 font-medium leading-relaxed">
                            • Use the <span className="text-purple-300 font-bold">Rich Text Editor</span> to format articles with markdown
                        </p>
                        <p className="text-sm text-white/40 font-medium leading-relaxed">
                            • High-quality <span className="text-blue-300 font-bold">Featured Images</span> increase engagement
                        </p>
                        <p className="text-sm text-white/40 font-medium leading-relaxed">
                            • Verify <span className="text-orange-300 font-bold">Slugs</span> before publishing for better SEO
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
