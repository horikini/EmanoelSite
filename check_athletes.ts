
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAthletes() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'athlete');

  if (error) {
    console.error('Error fetching profiles:', error);
    return;
  }

  console.log('Athletes found:');
  data.forEach(athlete => {
    console.log(`Name: ${athlete.full_name}, Email: ${athlete.email}, Phone: ${athlete.phone}`);
  });
}

checkAthletes();
