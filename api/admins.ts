import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        if (req.method === 'GET') {
            const { address } = req.query;
            
            if (address) {
                const { data, error } = await supabase
                    .from('admins')
                    .select('*')
                    .eq('address', address)
                    .maybeSingle();
                
                if (error) throw error;
                return res.status(200).json({ data, is_admin: !!data });
            }

            const { data, error } = await supabase
                .from('admins')
                .select('address, chain_type, role')
                .order('created_at', { ascending: true });
            
            if (error) throw error;
            return res.status(200).json({ data, error: null });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error: any) {
        return res.status(500).json({ data: null, error: error.message });
    }
}
