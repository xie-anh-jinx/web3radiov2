import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Support multiple env var naming conventions
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (!supabaseUrl || !supabaseKey) {
        return res.status(500).json({ 
            error: 'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel dashboard.',
            debug: { url: !!supabaseUrl, key: !!supabaseKey }
        });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        if (req.method === 'GET') {
            const { address } = req.query;
            
            if (address) {
                const { data, error } = await supabase
                    .from('admins')
                    .select('*')
                    .eq('address', address as string)
                    .maybeSingle();
                
                if (error) {
                    console.error('Supabase error:', error);
                    return res.status(500).json({ error: error.message, details: error });
                }
                return res.status(200).json({ data, is_admin: !!data });
            }

            const { data, error } = await supabase
                .from('admins')
                .select('address, chain_type, role')
                .order('created_at', { ascending: true });
            
            if (error) {
                console.error('Supabase error:', error);
                return res.status(500).json({ error: error.message, details: error });
            }
            return res.status(200).json({ data, error: null });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error: any) {
        console.error('Internal Handler Error:', error);
        return res.status(500).json({ data: null, error: error.message || 'Unknown error' });
    }
}
