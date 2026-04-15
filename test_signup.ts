
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

async function testSignUp() {
  const email = 'atleta1@teste.com';
  const password = '11910000001';

  console.log(`Attempting signUp for ${email}...`);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: 'Atleta Teste 1'
      }
    }
  });

  if (error) {
    console.error('SignUp failed:', error.message);
  } else {
    console.log('SignUp successful!', data.user?.id);
  }
}

testSignUp();
