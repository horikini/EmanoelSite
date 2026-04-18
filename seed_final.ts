import { supabase } from './src/lib/supabase';

async function seed() {
  const { data: profiles } = await supabase.from('profiles').select('*').eq('email', 'teste@teste');
  if (!profiles || profiles.length === 0) return;
  const userId = profiles[0].id;
  const today = new Date();

  // Test inserting without root the columns that don't exist
  
  const phys1 = {
    athlete_id: userId,
    date: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    data: {
      type: 'physical',
      date: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      weight: 75.5,
      height: 180,
      skinfolds: { triceps: 10, subscapular: 12, chest: 8, axillary: 10, suprailiac: 15, abdominal: 18, thigh: 12, calf: 8, biceps: 5, iliacCrest: 14 },
      measurements: { neck: 38, chest: 98, biceps: 34, forearm: 28, waist: 82, abdomen: 85, hip: 98, proximalThigh: 58, medialThigh: 55, distalThigh: 45, calf: 38 },
      isLiberated: true
    }
  };

  const phys2 = {
    athlete_id: userId,
    date: today.toISOString().split('T')[0],
    data: {
      type: 'physical',
      date: today.toISOString().split('T')[0],
      weight: 74.0,
      height: 180,
      skinfolds: { triceps: 9, subscapular: 11, chest: 7, axillary: 8, suprailiac: 13, abdominal: 15, thigh: 10, calf: 7, biceps: 4, iliacCrest: 12 },
      measurements: { neck: 38, chest: 97, biceps: 34, forearm: 28, waist: 80, abdomen: 82, hip: 96, proximalThigh: 57, medialThigh: 54, distalThigh: 44, calf: 38 },
      isLiberated: true
    }
  };

  const spec1 = {
    athlete_id: userId,
    date: new Date(today.getTime() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    data: {
      type: 'specific',
      date: new Date(today.getTime() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      specificTests: {
         velocidade10m: 1.70,
         velocidade20m: 3.20,
         cmj: 40
      },
      isLiberated: true
    }
  };

  const spec2 = {
    athlete_id: userId,
    date: today.toISOString().split('T')[0],
    data: {
      type: 'specific',
      date: today.toISOString().split('T')[0],
      specificTests: {
         velocidade10m: 1.39,
         velocidade20m: 3.05,
         cmj: 45
      },
      isLiberated: true
    }
  };

  const evs = [phys1, phys2, spec1, spec2];
  
  // Notice we skipped is_liberated outside to see if it works without schema error.
  const evalRes = await supabase.from('evaluations').insert(evs);
  console.log('Evaluations insert:', evalRes.error ? evalRes.error : 'Success');

  const monlogs = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    monlogs.push({
      athlete_id: userId,
      date: d.toISOString(),
      pain: 0,
      fatigue: 2,
      hydration: '1',
      status: 'Pendente'
      // removed pain_location
    });
  }
  const monRes = await supabase.from('monitoring').insert(monlogs);
  console.log('Monitoring insert result:', monRes.error ? monRes.error : 'Success');

  // Skip access_logs if bounded by RLS (will need a workaround/mock)
  console.log('Access logs will be bypassed for now.');
}

seed().catch(console.error);
