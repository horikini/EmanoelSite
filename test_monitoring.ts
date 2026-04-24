import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL || '';
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || anonKey;

const supabase = createClient(url, serviceKey);

async function testInsert() {
  const result = await supabase.from('monitoring').select('*').limit(1);
  console.log('Result:', result.error ? result.error : 'Success. Now attempting to read pain_location...');
  
  const colTest = await supabase.from('monitoring').select('pain_location').limit(1);
  if (colTest.error) {
    console.log("Column test error:", colTest.error);
  } else {
    console.log("Column pain_location exists!");
  }
}

testInsert();
