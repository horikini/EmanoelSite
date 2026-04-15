
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

async function testSimpleSignUp() {
  const email = 'atleta_teste@test.com';
  const password = 'password123';

  console.log(`Attempting signUp for ${email}...`);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error('SignUp failed:', error.message);
  } else {
    console.log('SignUp successful!', data.user?.id);
  }
}

testSimpleSignUp();
