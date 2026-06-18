import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { action, address } = req.query;

    try {
        if (req.method === 'GET') {
            // Get verified listening time
            if (action === 'listening_time') {
                const { data, error } = await supabase
                    .from('user_stats')
                    .select('total_listening_time')
                    .eq('user_address', address)
                    .maybeSingle();

                if (error) throw error;
                return res.status(200).json({ totalListeningTime: data?.total_listening_time || 0 });
            }

            // Check eligibility
            if (action === 'eligibility') {
                const { data, error } = await supabase
                    .from('user_stats')
                    .select('*')
                    .eq('user_address', address)
                    .maybeSingle();

                if (error) throw error;
                return res.status(200).json({
                    eligible: true,
                    nextRewardIn: 0,
                    availableRewards: 0,
                    ...data
                });
            }
        }

        if (req.method === 'POST') {
            // Submit session
            if (action === 'submit_session') {
                const session = req.body;
                const { data, error } = await supabase
                    .from('listening_sessions')
                    .insert([session])
                    .select()
                    .single();

                if (error) throw error;
                return res.status(200).json({ success: true, sessionId: data?.id });
            }
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error: any) {
        return res.status(500).json({ data: null, error: error.message });
    }
}
