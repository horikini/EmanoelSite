import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('ERRO: As chaves VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não estão definidas no ambiente.');
  process.exit(1);
}

console.log('Chaves encontradas. Testando conexão com:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Tenta fazer uma query simples na tabela profiles
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    
    if (error) {
      console.error('ERRO DE CONEXÃO: As chaves estão definidas, mas a conexão falhou. Detalhes do erro:');
      console.error(error.message);
      process.exit(1);
    }
    
    console.log('SUCESSO! Conexão com o Supabase estabelecida e as chaves estão corretas.');
  } catch (err) {
    console.error('ERRO INESPERADO:', err);
  }
}

testConnection();
