-- ==========================================
-- Web3Radio V2 - Multichain Sync Migration
-- Date: 2026-06-19
-- ==========================================

-- 1. Administrative Whitelist Table
CREATE TABLE IF NOT EXISTS public.admins (
    id BIGSERIAL PRIMARY KEY,
    address TEXT NOT NULL UNIQUE,
    role TEXT DEFAULT 'admin',
    chain_type TEXT NOT NULL, -- 'solana', 'evm', 'near'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Initial Admins (Based on hardcoded whitelist)
INSERT INTO public.admins (address, chain_type) VALUES
    ('9xhz4Cb4C2Z4z9xdD2geCafovNYVngC4E4XpWtQmeEuv', 'solana'),
    ('0x242DfB7849544eE242b2265cA7E585bdec60456B', 'evm'),
    ('kotarominami.near', 'near')
ON CONFLICT (address) DO NOTHING;

-- 2. Expand Events Table Schema
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'event';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS permaweb_url TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS nft_mint TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Expand News Table Schema
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 4. Expanded Stations Table Schema
ALTER TABLE public.stations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 5. Music Twitter Integration Tables (Radio Feature)
CREATE TABLE IF NOT EXISTS public.music_tweets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tweet_id TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL,
    handle TEXT NOT NULL,
    content TEXT NOT NULL,
    avatar_url TEXT,
    song_request TEXT,
    processed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.music_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tweet_id TEXT REFERENCES public.music_tweets(tweet_id),
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    video_id TEXT,
    thumbnail_url TEXT,
    duration TEXT,
    requested_by TEXT NOT NULL,
    queue_position INTEGER,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.now_playing (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    song_id UUID REFERENCES public.music_queue(id),
    is_playing BOOLEAN DEFAULT false,
    volume INTEGER DEFAULT 100,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Engagement & Reward Tables
CREATE TABLE IF NOT EXISTS public.listening_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_address TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration INTEGER DEFAULT 0,
    station_id TEXT,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_address TEXT NOT NULL UNIQUE,
    total_listening_time INTEGER DEFAULT 0,
    verified_listening_time INTEGER DEFAULT 0,
    total_rewards_claimed TEXT DEFAULT '0',
    last_reward_claim TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reward_claims (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_address TEXT NOT NULL,
    listening_time INTEGER NOT NULL,
    reward_amount TEXT NOT NULL,
    signature TEXT NOT NULL,
    nonce INTEGER NOT NULL,
    claimed BOOLEAN DEFAULT false,
    tx_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Row Level Security (RLS) Policies

-- Admins Table: Only service role or manual SQL can edit, public can read for verification
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read for verification" ON public.admins FOR SELECT USING (true);

-- content (events, news, stations)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage events" ON public.events
    FOR ALL USING (EXISTS (SELECT 1 FROM public.admins WHERE address = auth.uid()::text));
CREATE POLICY "Public read" ON public.events FOR SELECT USING (true);

ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage news" ON public.news
    FOR ALL USING (EXISTS (SELECT 1 FROM public.admins WHERE address = auth.uid()::text));
CREATE POLICY "Public read" ON public.news FOR SELECT USING (true);

-- Note: RLS policies using auth.uid() assume Supabase Auth is linked to wallet addresses. 
-- In the current "Local API" proxy mode, the server handles verification.

-- 8. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_listening_sessions_user_p ON public.listening_sessions(user_address);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_p ON public.user_stats(user_address);
CREATE INDEX IF NOT EXISTS idx_reward_claims_user_p ON public.reward_claims(user_address);
