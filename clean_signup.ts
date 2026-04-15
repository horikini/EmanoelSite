
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

async function cleanAndSignUp() {
  const email = 'atleta1@teste.com';
  const password = '11910000001';

  console.log(`Deleting ${email} from profiles...`);
  const { error: deleteError } = await supabase
    .from('profiles')
    .delete()
    .eq('email', email);

  if (deleteError) {
    console.error('Delete failed:', deleteError.message);
    // Continue anyway, maybe it doesn't exist
  }

  console.log(`Attempting signUp for ${email}...`);
  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: 'Atleta Teste 1'
      }
    }
  });

  if (signUpError) {
    console.error('SignUp failed:', signUpError.message);
  } else {
    console.log('SignUp successful!', data.user?.id);
    
    // Now update the phone number in the profile
    if (data.user) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ phone: '11910000001', status: 'active' })
        .eq('id', data.user.id);
        
      if (updateError) console.error('Update phone failed:', updateError.message);
      else console.log('Phone updated successfully');
    }
  }
}

cleanAndSignUp();
