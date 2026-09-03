import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://efheaozjwxmpnivbmfod.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_DQ-rB3q6JFls6xKkTreD8A_YOTq0LQr';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
