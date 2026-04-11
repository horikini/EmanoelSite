import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Activity, Droplets, Flame, CheckCircle2, LogOut } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

const URINE_COLORS = [
  { id: '1', color: '#ffffff', label: 'Transparente (como água pura)', desc: 'Hidratação excessiva ou ideal' },
  { id: '2', color: '#fef08a', label: 'Amarelo muito claro (cor de palha)', desc: 'Boa hidratação' },
  { id: '3', color: '#fde047', label: 'Amarelo claro', desc: 'Hidratação normal' },
  { id: '4', color: '#eab308', label: 'Amarelo escuro', desc: 'Desidratação leve. Beba água.' },
  { id: '5', color: '#d97706', label: 'Âmbar / Cor de mel', desc: 'Desidratação moderada.' },
  { id: '6', color: '#c2410c', label: 'Laranja / Acastanhado', desc: 'Desidratação severa.' },
  { id: '7', color: '#78350f', label: 'Marrom escuro (cor de chá mate)', desc: 'Atenção médica necessária.' },
  { id: '8', color: '#ef4444', label: 'Avermelhada ou rosada', desc: 'Atenção médica imediata.' },
];

export default function UserDashboard() {
  const navigate = useNavigate();
  const [pain, setPain] = useState<number>(0);
  const [fatigue, setFatigue] = useState<number>(0);
  const [hydration, setHydration] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role !== 'user') {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    navigate('/');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hydration) return alert('Por favor, selecione a cor da urina.');
    
    // Save mock data for admin
    const record = {
      id: Date.now(),
      date: new Date().toISOString(),
      user: 'João Atleta',
      phone: '5511999999999',
      pain,
      fatigue,
      hydration,
      status: 'Pendente'
    };
    
    const existing = JSON.parse(localStorage.getItem('els_records') || '[]');
    localStorage.setItem('els_records', JSON.stringify([record, ...existing]));
    
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-lg text-center max-w-sm w-full border border-slate-200 dark:border-slate-800"
        >
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Relatório Enviado!</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">Seus dados foram registrados com sucesso. A comissão técnica avaliará em breve.</p>
          <button 
            onClick={() => setSubmitted(false)}
            className="w-full bg-slate-900 dark:bg-orange-500 text-white py-3 rounded-xl font-medium hover:bg-slate-800 dark:hover:bg-orange-600 transition"
          >
            Novo Registro
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 transition-colors">
      {/* Header */}
      <header className="bg-slate-900 dark:bg-slate-900 text-white p-3 sticky top-0 z-10 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="h-8 w-auto object-contain"
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src.endsWith('.png')) {
                target.src = '/logo.jpg';
              } else if (target.src.endsWith('.jpg')) {
                target.src = '/logo.jpeg';
              } else {
                target.style.display = 'none';
                document.getElementById('fallback-user-logo')!.style.display = 'block';
              }
            }}
          />
          <div id="fallback-user-logo" className="hidden">
            <h1 className="font-black italic text-xl">ELS POWER</h1>
          </div>
          <p className="text-xs text-slate-400 border-l border-slate-700 pl-3 ml-1">Monitoramento Diário</p>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button onClick={handleLogout} className="p-2 bg-slate-800 rounded-full text-slate-300 hover:text-white transition">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="p-4 max-w-md mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Como você está hoje?</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Preencha com sinceridade para ajustarmos seu treino.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 1. Pain Scale */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="text-orange-500" />
              <h3 className="font-bold text-slate-800 dark:text-white">1. Escala de Dor (EVN)</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Classifique sua dor atual de 0 a 10:</p>
            
            <input 
              type="range" 
              min="0" max="10" 
              value={pain} 
              onChange={(e) => setPain(Number(e.target.value))}
              className="w-full accent-orange-500 mb-2"
            />
            <div className="flex justify-between text-xs font-bold text-slate-400 dark:text-slate-500 mb-4">
              <span>0</span>
              <span className="text-orange-500 text-lg">{pain}</span>
              <span>10</span>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <p><span className="font-bold text-slate-700 dark:text-slate-300">0:</span> Nenhuma dor</p>
              <p><span className="font-bold text-slate-700 dark:text-slate-300">1-3:</span> Dor leve (não interfere)</p>
              <p><span className="font-bold text-slate-700 dark:text-slate-300">4-6:</span> Dor moderada (interfere)</p>
              <p><span className="font-bold text-slate-700 dark:text-slate-300">7-9:</span> Dor intensa (incapacitante)</p>
              <p><span className="font-bold text-slate-700 dark:text-slate-300">10:</span> A pior dor imaginável</p>
            </div>
          </div>

          {/* 2. Fatigue Scale */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="text-blue-500" />
              <h3 className="font-bold text-slate-800 dark:text-white">2. Cansaço / Fadiga</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Avalie seu nível de cansaço físico e mental:</p>
            
            <input 
              type="range" 
              min="0" max="10" 
              value={fatigue} 
              onChange={(e) => setFatigue(Number(e.target.value))}
              className="w-full accent-blue-500 mb-2"
            />
            <div className="flex justify-between text-xs font-bold text-slate-400 dark:text-slate-500 mb-4">
              <span>0</span>
              <span className="text-blue-500 text-lg">{fatigue}</span>
              <span>10</span>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <p><span className="font-bold text-slate-700 dark:text-slate-300">0:</span> Nenhum cansaço (energizado)</p>
              <p><span className="font-bold text-slate-700 dark:text-slate-300">1-3:</span> Cansaço leve</p>
              <p><span className="font-bold text-slate-700 dark:text-slate-300">4-6:</span> Cansaço moderado</p>
              <p><span className="font-bold text-slate-700 dark:text-slate-300">7-9:</span> Cansaço intenso / Exaustão</p>
              <p><span className="font-bold text-slate-700 dark:text-slate-300">10:</span> Exaustão extrema</p>
            </div>
          </div>

          {/* 3. Hydration */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <Droplets className="text-cyan-500" />
              <h3 className="font-bold text-slate-800 dark:text-white">3. Nível de Hidratação</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Selecione a cor que mais se aproxima da sua urina hoje:</p>
            
            <div className="space-y-2">
              {URINE_COLORS.map((item) => (
                <label 
                  key={item.id} 
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${hydration === item.id ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                >
                  <input 
                    type="radio" 
                    name="hydration" 
                    value={item.id}
                    checked={hydration === item.id}
                    onChange={(e) => setHydration(e.target.value)}
                    className="hidden"
                  />
                  <div 
                    className="w-6 h-6 rounded-full border border-slate-300 dark:border-slate-600 shadow-inner shrink-0" 
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${hydration === item.id ? 'text-cyan-700 dark:text-cyan-400' : 'text-slate-800 dark:text-slate-200'}`}>{item.label}</p>
                  </div>
                  {hydration === item.id && <CheckCircle2 className="text-cyan-500 shrink-0" size={20} />}
                </label>
              ))}
            </div>

            <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/50 rounded-xl">
              <p className="text-xs text-orange-800 dark:text-orange-300">
                <span className="font-bold">Atenção:</span> Urinas a partir do "Amarelo escuro" indicam desidratação e exigem ingestão imediata de água. Cores como marrom ou vermelho exigem atenção médica.
              </p>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-lg py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
          >
            ENVIAR RELATÓRIO
          </button>
        </form>
      </main>
    </div>
  );
}
