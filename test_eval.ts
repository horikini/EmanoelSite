import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

// The SUPABASE_SERVICE_ROLE_KEY is needed to bypass RLS, what if it's in another file?
// Oh! Let's check environment variables directly.
const url = process.env.VITE_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

async function makeAmirAdmin() {
  const { data: user, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: 'amir.barbosa@sou.unaerp.edu.br',
    password: 'Password123!',
    email_confirm: true,
  });

  if (authError && authError.message.includes('already exists')) {
     console.log("User already exists, updating password...");
     const { data: existingProfiles } = await supabaseAdmin.from('profiles').select('*').eq('email', 'amir.barbosa@sou.unaerp.edu.br');
     if(existingProfiles && existingProfiles.length > 0) {
        await supabaseAdmin.auth.admin.updateUserById(existingProfiles[0].id, { password: 'Password123!' });
        await supabaseAdmin.from('profiles').update({ role: 'admin' }).eq('id', existingProfiles[0].id);
        console.log("Updated existing user to admin");
     }
  } else if (!authError && user?.user) {
     await supabaseAdmin.from('profiles').insert([{ id: user.user.id, email: 'amir.barbosa@sou.unaerp.edu.br', full_name: 'Amir Test', role: 'admin', status: 'active' }]);
     console.log("Created user and profile");
  }

  // Now login via anon client
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
  const supabase = createClient(url, anonKey);
  const { data: { session }, error } = await supabase.auth.signInWithPassword({ email: 'amir.barbosa@sou.unaerp.edu.br', password: 'Password123!' });
  console.log("Login result:", !!session, error);

  if (session) {
    const { data: athletes } = await supabase.from('profiles').select('id').eq('role', 'athlete').limit(1);
    const athleteId = athletes?.[0]?.id;
    if (athleteId) {
      const { data, error: insertError } = await supabase.from('evaluations').insert([{ athlete_id: athleteId, date: '2026-04-23', data: {} }]);
      console.log("Insert eval result:", insertError || "SUCCESS!");
    } else {
      console.log("No athletes found");
    }
  }
}

makeAmirAdmin();
