import { supabase } from './src/lib/supabase';

async function check() {
  console.log('Fetching profile for teste@teste...');
  const { data: profiles, error } = await supabase.from('profiles').select('*').eq('email', 'teste@teste');
  
  if (error || !profiles || profiles.length === 0) {
    console.error('User teste@teste not found');
    return;
  }

  const userId = profiles[0].id;
  console.log('User found:', profiles[0].full_name, 'ID:', userId);

  const { count: evalCount } = await supabase.from('evaluations').select('*', { count: 'exact', head: true }).eq('athlete_id', userId);
  const { count: monCount } = await supabase.from('monitoring').select('*', { count: 'exact', head: true }).eq('athlete_id', userId);
  
  console.log(`Evaluations: ${evalCount}`);
  console.log(`Monitoring: ${monCount}`);
}
check().catch(console.error);
