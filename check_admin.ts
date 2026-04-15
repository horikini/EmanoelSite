
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

async function checkAdmin() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'admin');

  if (error) {
    console.error('Error fetching admin:', error);
    return;
  }

  console.log('Admins found:');
  data.forEach(admin => {
    console.log(`Name: ${admin.full_name}, Email: ${admin.email}`);
  });
}

checkAdmin();
