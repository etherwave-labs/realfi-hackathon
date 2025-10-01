-- EventChain Supabase Schema Setup
-- Run this script in your Supabase SQL Editor

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  date TEXT,
  time TEXT,
  location TEXT,
  price NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'USDC',
  attendees INTEGER DEFAULT 0,
  capacity INTEGER,
  organizer JSONB,
  image TEXT,
  tags TEXT[],
  refundPolicy TEXT,
  requirements TEXT,
  startDateTime TEXT,
  endDateTime TEXT,
  isPublic BOOLEAN DEFAULT true,
  allowWaitlist BOOLEAN DEFAULT false,
  noShowPayoutPercentage NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create registrations table
CREATE TABLE IF NOT EXISTS registrations (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_address TEXT NOT NULL,
  transaction_hash TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USDC',
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  checked_in BOOLEAN DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON events;
DROP POLICY IF EXISTS "Enable insert access for all users" ON events;
DROP POLICY IF EXISTS "Enable update access for all users" ON events;
DROP POLICY IF EXISTS "Enable read access for all users" ON registrations;
DROP POLICY IF EXISTS "Enable insert access for all users" ON registrations;
DROP POLICY IF EXISTS "Enable update access for all users" ON registrations;

-- Create policies for events (allow all operations for now)
CREATE POLICY "Enable read access for all users" ON events
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON events
  FOR UPDATE USING (true);

-- Create policies for registrations (allow all operations for now)
CREATE POLICY "Enable read access for all users" ON registrations
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON registrations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON registrations
  FOR UPDATE USING (true);

-- Enable Realtime for both tables
-- Try to add tables to publication, ignore errors if already present
DO $$ 
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE events;
EXCEPTION 
    WHEN duplicate_object THEN 
        NULL;
END $$;

DO $$ 
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE registrations;
EXCEPTION 
    WHEN duplicate_object THEN 
        NULL;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user_address ON registrations(user_address);

-- Refresh schema cache (important!)
NOTIFY pgrst, 'reload schema';

