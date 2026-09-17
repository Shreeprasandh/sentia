-- ====================================================================
-- SENTIA SMART BAG ECOSYSTEM: MASTER DATABASE MIGRATION
-- 100% Row Level Security (RLS) & Multi-Tenant Isolation
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked directly to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    mobile_number TEXT,
    country TEXT,
    date_of_birth DATE,
    address TEXT,
    gender TEXT CHECK (gender IN ('female', 'male', 'non_binary', 'prefer_not_to_say')) DEFAULT 'prefer_not_to_say',
    profile_image TEXT,
    language TEXT DEFAULT 'en',
    lifestyle_preference TEXT CHECK (lifestyle_preference IN ('student', 'working_professional', 'traveller', 'general_lifestyle')) DEFAULT 'general_lifestyle',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);


-- 2. BAGS TABLE (Hardware Registry)
CREATE TABLE IF NOT EXISTS public.bags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    device_name TEXT NOT NULL,
    bag_type TEXT CHECK (bag_type IN ('handbag', 'backpack', 'school_bag')) NOT NULL,
    ble_mac_address TEXT UNIQUE NOT NULL,
    model_number TEXT NOT NULL,
    electronic_module_id TEXT NOT NULL,
    purchase_date DATE DEFAULT CURRENT_DATE,
    estimated_product_life_months INT DEFAULT 60,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.bags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own bags" ON public.bags;
CREATE POLICY "Users can view their own bags" ON public.bags FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can register their own bags" ON public.bags;
CREATE POLICY "Users can register their own bags" ON public.bags FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own bags" ON public.bags;
CREATE POLICY "Users can update their own bags" ON public.bags FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own bags" ON public.bags;
CREATE POLICY "Users can delete their own bags" ON public.bags FOR DELETE USING (auth.uid() = user_id);


-- 3. BAG TELEMETRY TABLE (Live Sensor Cache & Realtime Stream)
CREATE TABLE IF NOT EXISTS public.bag_telemetry (
    bag_id UUID REFERENCES public.bags(id) ON DELETE CASCADE PRIMARY KEY,
    battery_level INT CHECK (battery_level BETWEEN 0 AND 100) DEFAULT 100,
    charging_status TEXT CHECK (charging_status IN ('discharging', 'charging', 'full')) DEFAULT 'discharging',
    is_online BOOLEAN DEFAULT FALSE,
    last_connected_time TIMESTAMPTZ DEFAULT NOW(),
    water_bottle_present BOOLEAN DEFAULT TRUE,
    lunch_box_present BOOLEAN DEFAULT TRUE,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    speed DOUBLE PRECISION DEFAULT 0.0,
    sos_active BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.bag_telemetry ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view telemetry for their own bags" ON public.bag_telemetry;
CREATE POLICY "Users can view telemetry for their own bags" ON public.bag_telemetry FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.bags WHERE bags.id = bag_telemetry.bag_id AND bags.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update telemetry for their own bags" ON public.bag_telemetry;
CREATE POLICY "Users can update telemetry for their own bags" ON public.bag_telemetry FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.bags WHERE bags.id = bag_telemetry.bag_id AND bags.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert telemetry for their own bags" ON public.bag_telemetry;
CREATE POLICY "Users can insert telemetry for their own bags" ON public.bag_telemetry FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.bags WHERE bags.id = bag_telemetry.bag_id AND bags.user_id = auth.uid()));


-- 4. SMART REMINDERS TABLE
CREATE TABLE IF NOT EXISTS public.reminders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    due_datetime TIMESTAMPTZ NOT NULL,
    repeat_schedule TEXT CHECK (repeat_schedule IN ('none', 'daily', 'weekly', 'weekdays', 'weekends', 'custom')) DEFAULT 'none',
    category TEXT CHECK (category IN ('work', 'study', 'travel', 'health', 'personal', 'shopping', 'custom')) NOT NULL,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    status TEXT CHECK (status IN ('upcoming', 'overdue', 'completed', 'snoozed', 'skipped')) DEFAULT 'upcoming',
    snoozed_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage their own reminders" ON public.reminders;
CREATE POLICY "Users manage their own reminders" ON public.reminders FOR ALL USING (auth.uid() = user_id);


-- 5. ESSENTIALS TABLE (Everyday Carry Inventory)
CREATE TABLE IF NOT EXISTS public.essentials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bag_id UUID REFERENCES public.bags(id) ON DELETE CASCADE NOT NULL,
    item_name TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    is_placed BOOLEAN DEFAULT FALSE,
    is_frequently_carried BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.essentials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage essentials in their bags" ON public.essentials;
CREATE POLICY "Users manage essentials in their bags" ON public.essentials FOR ALL 
USING (EXISTS (SELECT 1 FROM public.bags WHERE bags.id = essentials.bag_id AND bags.user_id = auth.uid()));


-- 6. MENSTRUAL HEALTH TABLE (Zero-Knowledge AES-256 E2EE Payload)
CREATE TABLE IF NOT EXISTS public.menstrual_cycles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    encrypted_payload TEXT NOT NULL,
    encryption_iv TEXT NOT NULL,
    key_epoch INT DEFAULT 1,
    partner_mode_enabled BOOLEAN DEFAULT FALSE,
    partner_encrypted_payload TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.menstrual_cycles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage their own encrypted cycle logs" ON public.menstrual_cycles;
CREATE POLICY "Users manage their own encrypted cycle logs" ON public.menstrual_cycles FOR ALL USING (auth.uid() = user_id);


-- 7. REPAIRS & REPLACEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.repairs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    bag_id UUID REFERENCES public.bags(id) ON DELETE CASCADE NOT NULL,
    item_type TEXT CHECK (item_type IN ('battery_module', 'electronic_module', 'general_repair')) NOT NULL,
    status TEXT CHECK (status IN ('booked', 'received', 'diagnosis', 'repaired', 'dispatched')) DEFAULT 'booked',
    service_partner_name TEXT,
    tracking_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.repairs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage their own repair tickets" ON public.repairs;
CREATE POLICY "Users manage their own repair tickets" ON public.repairs FOR ALL USING (auth.uid() = user_id);


-- 8. ENABLE REALTIME ON TELEMETRY (For Live Web Replica & Map Sync)
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.bag_telemetry;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.reminders;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.essentials;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
END $$;
