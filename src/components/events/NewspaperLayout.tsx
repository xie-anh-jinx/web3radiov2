
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchEvents, subscribeToTable } from '@/lib/api';
import { Loader2, Newspaper as NewsIcon, Briefcase, Sparkles } from 'lucide-react';
import './NewspaperLayout.css';

interface Article {
    id: number;
    title: string;
    description: string;
    image_url?: string;
    date: string;
    location: string;
    category: 'news' | 'job' | 'event';
    slug?: string;
}

const NewspaperLayout: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    const loadArticles = async () => {
        try {
            const { data, error } = await fetchEvents();
            if (error) throw error;
            // Filter only news
            const filtered = (data || []).filter((e: any) => e.category === 'news');
            setArticles(filtered);
        } catch (error) {
            console.error('Error loading news articles:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadArticles();
        const sub = subscribeToTable('events', loadArticles);
        return () => { sub.unsubscribe(); };
    }, []);

    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-GB', {
        month: 'long',
        year: 'numeric'
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center py-24">
                <Loader2 className="h-10 w-10 animate-spin text-white/20" />
            </div>
        );
    }

    // Separate articles for different sections
    const headline = articles[0];
    const sideNews = articles[1];
    const restOfNews = articles.slice(2);

    const renderArticleLink = (article: Article, text: string = "Read More") => (
        <Link 
            className="btn btn-secondary" 
            to={`/events/${article.slug || article.id}`}
        >
            {text}
        </Link>
    );

    return (
        <div className="newspaper-container animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <div className="newspaper-inner">
                <header>
                    <nav>
                        <div className="row">
                            <h1 className="logo">The Web3radio</h1>
                            <div className="sub">
                                <p className="item date">www.webthreeradio.xyz</p>
                                <p className="item paper">The best source for decentralized news</p>
                                <p className="item temperature">{formattedDate}</p>
                            </div>
                        </div>
                    </nav>
                </header>

                <section className="headline">
                    {headline ? (
                        <main>
                            <h1>{headline.title}</h1>
                            <div className="publish">
                                <span className="publish-date">{new Date(headline.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} ·</span>
                                <span className="author">Editor</span>
                            </div>
                            {headline.image_url && <img src={headline.image_url} alt={headline.title} className="rounded-xl shadow-lg mb-6" />}
                            <p className="line-clamp-6">{headline.description}</p>
                            {renderArticleLink(headline)}
                        </main>
                    ) : (
                        <main>
                            <div className="py-12 text-center opacity-30">
                                <NewsIcon className="h-12 w-12 mx-auto mb-4" />
                                <p className="font-serif italic">No major headlines today...</p>
                            </div>
                        </main>
                    )}

                    <div className="side">
                        {sideNews ? (
                            <>
                                <h2>{sideNews.title}</h2>
                                <div className="publish">
                                    <span className="publish-date">{new Date(sideNews.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} ·</span>
                                    <span className="author">Staff</span>
                                </div>
                                {sideNews.image_url && <img src={sideNews.image_url} style={{ objectFit: 'cover', height: '175px', width: '100%' }} alt={sideNews.title} className="rounded-lg shadow-md mb-4" />}
                                <p className="line-clamp-4">{sideNews.description}</p>
                                {renderArticleLink(sideNews)}
                            </>
                        ) : (
                            <div className="py-8 text-center opacity-20 border-t border-black/5">
                                <Sparkles className="h-8 w-8 mx-auto mb-2" />
                                <p className="text-[10px] font-bold uppercase tracking-widest">More News Coming Soon</p>
                            </div>
                        )}
                    </div>
                </section>

                <section className="extra-news">
                    {restOfNews.map((article) => (
                        <div key={article.id} className="news">
                            <h2 className="serif">{article.title}</h2>
                            <div className="publish">
                                <span className="publish-date">{new Date(article.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} ·</span>
                                <span className="author">Web3Radio</span>
                            </div>
                            <p className="line-clamp-3">{article.description}</p>
                            {renderArticleLink(article)}
                        </div>
                    ))}


                    {articles.length === 0 && (
                        <div className="col-span-full py-24 text-center opacity-10">
                            <h2 className="serif text-4xl">Waiting for the Next Big Story...</h2>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default NewspaperLayout;
