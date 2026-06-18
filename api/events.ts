import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        if (req.method === 'GET') {
            const { slug } = req.query;
            if (slug) {
                const { data, error } = await supabase
                    .from('events')
                    .select('*')
                    .eq('slug', slug)
                    .single();
                if (error) throw error;
                return res.status(200).json({ data, error: null });
            }

            const { data, error } = await supabase
                .from('events')
                .select('*')
                .order('date', { ascending: true });
            if (error) throw error;
            return res.status(200).json({ data, error: null });
        }

        if (req.method === 'POST') {
            const { title, date, location, description, image_url, slug, category } = req.body;
            const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            
            const { data, error } = await supabase
                .from('events')
                .insert([{ 
                    title, 
                    date, 
                    location, 
                    description, 
                    image_url, 
                    slug: finalSlug, 
                    category: category || 'event' 
                }])
                .select()
                .single();
            
            if (error) throw error;
            return res.status(200).json({ data, error: null });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error: any) {
        return res.status(500).json({ data: null, error: error.message });
    }
}
