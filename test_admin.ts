import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL || '';
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(url, anonKey);

async function testAdminInsert() {
  const { data: { session }, error: authError } = await supabase.auth.signInWithPassword({
    email: 'dr.amirhoriquini@gmail.com',
    password: '123'
  });
  if (authError) {
    console.log("Failed to login", authError.message);
    return; 
  }

  const { data: athletes } = await supabase.from('profiles').select('id').eq('role', 'athlete').limit(1);
  const athleteId = athletes?.[0]?.id;
  if (!athleteId) return console.log("No athlete found");

  const { data, error } = await supabase
    .from('evaluations')
    .insert([{
      athlete_id: athleteId,
      date: new Date().toISOString().split('T')[0],
      is_liberated: false,
      data: { test: 123 }
    }]);

  console.log("Insert result:", error || "SUCCESS!");
}

testAdminInsert();
