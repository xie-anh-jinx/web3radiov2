
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import NavBar from '@/components/navigation/NavBar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, MapPin, Loader2, Share2, Sparkles, Tag, Newspaper, Briefcase } from 'lucide-react';
import { getEventBySlug } from '@/lib/api';
import { Event } from '@/types/content';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const EventDetail = () => {
    const { slug } = useParams<{ slug: string }>();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchEvent = async () => {
            if (!slug) return;

            try {
                setLoading(true);
                const { data, error } = await getEventBySlug(slug);

                if (error) throw error;

                if (data) {
                    setEvent(data);
                } else {
                    toast({
                        title: "Article not found",
                        description: "The requested content could not be found.",
                        variant: "destructive"
                    });
                }
            } catch (error) {
                console.error('Error loading event:', error);
                toast({
                    title: "Error",
                    description: "Failed to load content details.",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
    }, [slug, toast]);

    // Simple markdown to HTML converter to match RichTextEditor's style
    const renderContent = (markdown: string): string => {
        if (!markdown) return '';
        
        return markdown
            // Headers
            .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold text-[#515044] mt-8 mb-4">$1</h3>')
            .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold text-[#515044] mt-10 mb-5">$1</h2>')
            .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold text-[#515044] mt-12 mb-6">$1</h1>')
            // Bold and Italic
            .replace(/\*\*\*(.*?)\*\*\*/g, '<strong class="font-bold"><em>$1</em></strong>')
            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
            // Code
            .replace(/`(.*?)`/g, '<code class="bg-[#515044]/5 px-2 py-0.5 rounded font-mono text-sm">$1</code>')
            // Blockquote
            .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-[#515044]/20 pl-6 my-8 text-[#515044]/60 italic font-light text-xl">$1</blockquote>')
            // Links
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="text-[#515044] underline font-bold hover:opacity-70">$1</a>')
            // Images
            .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="w-full h-auto rounded-3xl my-10 shadow-2xl" />')
            // Lists
            .replace(/^- (.*$)/gm, '<li class="ml-6 mb-2">$1</li>')
            .replace(/^\d+\. (.*$)/gm, '<li class="ml-6 mb-2 list-decimal">$1</li>')
            // Line breaks
            .replace(/\n/g, '<br />');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-transparent flex justify-center items-center text-white">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin opacity-20" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-30">Loading Story</p>
                </div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-transparent flex flex-col items-center">
                <NavBar />
                <div className="container mt-32 text-center text-white">
                    <h1 className="text-2xl font-bold mb-4 uppercase tracking-widest opacity-50">Content Not Found</h1>
                    <Link to="/events">
                        <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 rounded-2xl">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Hub
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const getCategoryIcon = (category?: string) => {
        switch (category) {
            case 'news': return <Newspaper className="h-4 w-4" />;
            case 'job': return <Briefcase className="h-4 w-4" />;
            default: return <Sparkles className="h-4 w-4" />;
        }
    };

    return (
        <div className="min-h-screen w-full bg-transparent relative overflow-y-auto text-white flex flex-col items-center pb-32">
            <NavBar />
            
            {/* Hero Image Section */}
            {event.image_url && (
                <div className="w-full h-[60vh] md:h-[70vh] relative overflow-hidden">
                    <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-full object-cover scale-105 blur-sm opacity-30"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-[#fef29c]" />
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
                        <Badge className="bg-white/20 backdrop-blur-md text-white border-white/10 px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <span className="flex items-center gap-2">
                                {getCategoryIcon(event.category)}
                                {event.category || 'Event'}
                            </span>
                        </Badge>
                        <h1 className="text-4xl md:text-7xl font-bold tracking-tighter text-white max-w-5xl leading-[1.05] mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                            {event.title}
                        </h1>
                    </div>
                </div>
            )}

            <div className={`w-[92%] md:w-[85%] lg:w-[75%] max-w-7xl relative z-20 ${event.image_url ? '-mt-32' : 'mt-32'}`}>
                <div className="grid lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-8">
                        <article className="bg-white backdrop-blur-2xl rounded-[48px] overflow-hidden shadow-2xl border border-[#515044]/5">
                            {event.image_url && (
                                <div className="w-full aspect-video relative overflow-hidden border-b border-[#515044]/5">
                                    <img
                                        src={event.image_url}
                                        alt={event.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            <div className="p-8 md:p-16">
                                <div 
                                    className="prose prose-lg max-w-none text-[#515044] leading-relaxed font-normal"
                                    dangerouslySetInnerHTML={{ __html: renderContent(event.description) }}
                                />
                            </div>
                        </article>
                    </div>

                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-white/95 backdrop-blur-xl rounded-[40px] p-10 shadow-2xl border border-[#515044]/5 sticky top-28">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#515044]/30 mb-10">Details</h3>

                            <div className="space-y-10">
                                <div className="flex items-start gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-[#515044]/5 flex items-center justify-center shrink-0">
                                        <Calendar className="h-5 w-5 text-[#515044]/40" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#515044]/30 mb-2">Published</p>
                                        <p className="text-[#515044] font-bold text-lg">
                                            {new Date(event.date).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-[#515044]/5 flex items-center justify-center shrink-0">
                                        <MapPin className="h-5 w-5 text-[#515044]/40" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#515044]/30 mb-2">Location</p>
                                        <p className="text-[#515044] font-bold text-lg">{event.location}</p>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-[#515044]/5 flex flex-col gap-4">
                                    <Button className="w-full bg-[#515044] hover:bg-black text-white rounded-2xl py-8 font-bold text-xs uppercase tracking-[0.2em] shadow-xl shadow-[#515044]/10 transition-all hover:scale-[1.02]">
                                        <Share2 className="mr-3 h-4 w-4 opacity-50" /> Share This
                                    </Button>
                                    
                                    <Link to="/events" className="w-full">
                                        <Button variant="ghost" className="w-full text-[#515044]/40 hover:text-[#515044] hover:bg-[#515044]/5 rounded-2xl py-6 font-bold text-[10px] uppercase tracking-widest">
                                            <ArrowLeft className="mr-2 h-3 w-3" /> Hub Dashboard
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetail;
