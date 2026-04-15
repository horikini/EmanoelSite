
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixPasswords() {
  const { data: profiles, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id, email, phone, full_name')
    .eq('role', 'athlete');

  if (profileError) {
    console.error('Error fetching profiles:', profileError);
    return;
  }

  for (const profile of profiles) {
    if (!profile.phone) {
      console.log(`Skipping ${profile.full_name} - no phone`);
      continue;
    }

    const password = profile.phone.replace(/\D/g, '');
    console.log(`Updating password for ${profile.full_name} (${profile.email}) to ${password}`);

    // First, check if user exists in auth.users
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(profile.id);
    
    if (userError) {
      console.log(`User ${profile.full_name} not found in auth.users, creating...`);
      const { error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: profile.email,
        password: password,
        email_confirm: true,
        user_metadata: {
          full_name: profile.full_name,
          precisa_mudar_senha: true
        }
      });
      if (createError) console.error(`Error creating user ${profile.full_name}:`, createError);
    } else {
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(profile.id, {
        password: password
      });
      if (updateError) console.error(`Error updating password for ${profile.full_name}:`, updateError);
    }
  }
}

fixPasswords();
