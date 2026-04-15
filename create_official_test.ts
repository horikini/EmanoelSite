
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

async function createNewTestAthlete() {
  const email = 'atleta.teste@elspower.com.br';
  const password = 'els123456';

  console.log(`Attempting signUp for ${email}...`);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: 'Atleta Teste Oficial'
      }
    }
  });

  if (error) {
    console.error('SignUp failed:', error.message);
  } else {
    console.log('SignUp successful!', data.user?.id);
    
    // Create profile manually if trigger fails
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          full_name: 'Atleta Teste Oficial',
          email: email,
          phone: '11999999999',
          role: 'athlete',
          status: 'active'
        });
        
      if (profileError) console.error('Profile creation failed:', profileError.message);
      else console.log('Profile created/updated successfully');
    }
  }
}

createNewTestAthlete();
