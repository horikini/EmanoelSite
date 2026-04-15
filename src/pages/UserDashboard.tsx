import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Activity, Droplets, Flame, CheckCircle2, LogOut, Calendar as CalendarIcon, Clock, Check, X, User } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { supabase } from '../lib/supabase';
import { supabaseService, Profile, Appointment } from '../lib/supabaseService';

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
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role !== 'athlete' && role !== 'user') { // Keep 'user' for backward compatibility during transition
      navigate('/login');
      return;
    }

    const loadData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          navigate('/login');
          return;
        }

        // Fetch profile
        const userProfile = await supabaseService.getProfile(userId);
        setProfile(userProfile);

        if (!userProfile.phone) {
          navigate('/complete-profile');
          return;
        }

        if (userProfile.status === 'pending') {
          navigate('/pending-approval');
          return;
        }

        // Fetch appointments
        const apps = await supabaseService.getAppointments(userId);
        setAppointments(apps);

        // Check if already submitted today
        const today = new Date().toISOString().split('T')[0];
        const records = await supabaseService.getMonitoringRecords(userId);
        const hasSubmittedToday = records.some(r => r.date.startsWith(today));
        
        if (hasSubmittedToday) {
          setSubmitted(true);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const handleUpdateAppointmentStatus = async (id: string, status: 'confirmed' | 'canceled') => {
    try {
      await supabaseService.updateAppointmentStatus(id, status);
      setAppointments(apps => apps.map(a => a.id === id ? { ...a, status } : a));
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Erro ao atualizar agendamento.');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    navigate('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hydration) return alert('Por favor, selecione a cor da urina.');
    
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    try {
      await supabaseService.addMonitoringRecord({
        athlete_id: userId,
        date: new Date().toISOString(),
        pain,
        fatigue,
        hydration,
        status: 'Pendente'
      });
      
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting monitoring:', error);
      alert('Erro ao enviar avaliação.');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center dark:bg-slate-950 dark:text-white">Carregando...</div>;
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-slate-900 p-10 rounded-3xl shadow-lg text-center max-w-sm w-full border border-slate-200 dark:border-slate-800"
        >
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2 uppercase tracking-tight">Avaliação concluída</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Seu feedback diário foi registrado com sucesso.</p>
          
          <button 
            onClick={() => navigate(`/patient/${profile?.id}`)}
            className="mt-8 w-full bg-slate-900 dark:bg-slate-800 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition"
          >
            VER MEU PERFIL
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
          {profile?.photo ? (
            <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-700">
              <img src={profile.photo} alt="User" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
              <User size={16} />
            </div>
          )}
          <button onClick={handleLogout} className="p-2 bg-slate-800 rounded-full text-slate-300 hover:text-white transition">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="p-4 max-w-md mx-auto">
        {/* Appointments Section */}
        {appointments.some(a => a.status === 'pending') && (
          <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-2 mb-4">
              <CalendarIcon className="text-orange-500" size={20} />
              <h3 className="font-bold text-slate-800 dark:text-white">Agendamentos Pendentes</h3>
            </div>
            <div className="space-y-3">
              {appointments.filter(a => a.status === 'pending').map(app => (
                <div key={app.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border-2 border-orange-100 dark:border-orange-900/30 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-[10px] text-orange-500 font-bold uppercase tracking-wider">{app.type}</p>
                      <p className="font-bold text-slate-800 dark:text-white">Confirme sua presença</p>
                    </div>
                    <div className="bg-orange-100 dark:bg-orange-900/30 p-1.5 rounded-lg">
                      <Clock size={16} className="text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                  
                  <div className="flex gap-4 mb-4">
                    <div className="flex items-center gap-1.5">
                      <CalendarIcon size={14} className="text-slate-400" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{new Date(app.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-slate-400" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{app.time}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleUpdateAppointmentStatus(app.id, 'confirmed')}
                      className="flex-1 bg-green-500 text-white py-2 rounded-xl text-xs font-bold hover:bg-green-600 transition flex items-center justify-center gap-1.5"
                    >
                      <Check size={14} />
                      Confirmar
                    </button>
                    <button 
                      onClick={() => handleUpdateAppointmentStatus(app.id, 'canceled')}
                      className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 py-2 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center justify-center gap-1.5"
                    >
                      <X size={14} />
                      Recusar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Peso Atual</p>
            <p className="text-lg font-black text-slate-800 dark:text-white">74.2 <span className="text-[10px] font-normal">kg</span></p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">% Gordura</p>
            <p className="text-lg font-black text-orange-500">11.4 <span className="text-[10px] font-normal">%</span></p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Yo-Yo Test</p>
            <p className="text-lg font-black text-blue-500">2040 <span className="text-[10px] font-normal">m</span></p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-black p-5 rounded-3xl shadow-lg mb-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Activity size={80} />
          </div>
          <div className="relative z-10">
            <p className="text-orange-400 text-[10px] font-bold uppercase tracking-widest mb-1">Última Avaliação</p>
            <h3 className="text-xl font-bold mb-4">Seu desempenho evoluiu!</h3>
            <div className="flex items-center gap-4 text-sm text-slate-300">
              <div className="flex items-center gap-1">
                <CalendarIcon size={14} />
                <span>12/04/2026</span>
              </div>
              <div className="flex items-center gap-1 text-green-400 font-bold">
                <CheckCircle2 size={14} />
                <span>Resultados Liberados</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Olá, {profile?.full_name?.split(' ')[0] || 'Atleta'}!</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Acompanhe sua evolução e envie seu feedback.</p>
          </div>
          <button 
            onClick={() => navigate(`/patient/${profile?.id}`)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl text-xs font-bold hover:bg-orange-200 transition"
          >
            <Activity size={14} />
            Ver Perfil Completo
          </button>
        </div>

        {submitted ? (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-900/50 text-center animate-in fade-in zoom-in duration-500">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-400">Avaliação concluída</h3>
            <p className="text-sm text-emerald-600 dark:text-emerald-500 mt-1">Obrigado pelo seu feedback diário!</p>
            <button 
              onClick={() => setSubmitted(false)}
              className="mt-4 text-xs font-bold text-emerald-700 dark:text-emerald-400 underline"
            >
              Editar resposta
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Hydration */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-4">
                <Droplets className="text-cyan-500" />
                <h3 className="font-bold text-slate-800 dark:text-white">Nível de Hidratação</h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Selecione a cor da sua urina hoje:</p>
              
              <div className="grid grid-cols-4 gap-2">
                {URINE_COLORS.map((item) => (
                  <button 
                    key={item.id}
                    type="button"
                    onClick={() => setHydration(item.id)}
                    className={`relative h-12 rounded-xl border-2 transition-all ${hydration === item.id ? 'border-cyan-500 scale-105 shadow-md' : 'border-transparent'}`}
                    style={{ backgroundColor: item.color }}
                    title={item.label}
                  >
                    {hydration === item.id && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-lg">
                        <Check size={20} className="text-cyan-600 drop-shadow-md" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Pain and Fatigue */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="text-red-500" size={20} />
                    <h3 className="font-bold text-slate-800 dark:text-white">Nível de Dor</h3>
                  </div>
                  <span className="text-lg font-black text-red-500">{pain}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  value={pain} 
                  onChange={(e) => setPain(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
                <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-bold uppercase">
                  <span>Sem Dor</span>
                  <span>Dor Extrema</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Flame className="text-orange-500" size={20} />
                    <h3 className="font-bold text-slate-800 dark:text-white">Nível de Fadiga</h3>
                  </div>
                  <span className="text-lg font-black text-orange-500">{fatigue}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  value={fatigue} 
                  onChange={(e) => setFatigue(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-bold uppercase">
                  <span>Descansado</span>
                  <span>Exausto</span>
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-lg py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
            >
              ENVIAR FEEDBACK
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
