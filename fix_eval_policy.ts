import dotenv from 'dotenv';
dotenv.config();

async function checkEvaluationsSchema() {
  const url = process.env.VITE_SUPABASE_URL || '';
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
  
  const res = await fetch(`${url}/rest/v1/`, {
    headers: {
      'apikey': anonKey,
      'Authorization': `Bearer ${anonKey}`
    }
  });

  const text = await res.json();
  console.log("Tables:", Object.keys(text.definitions || {}));
}

checkEvaluationsSchema();
