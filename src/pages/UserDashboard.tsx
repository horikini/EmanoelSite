import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Droplets, Flame, CheckCircle2, LogOut, Calendar as CalendarIcon, Clock, Check, X, User, ChevronRight, ChevronDown, ChevronUp, Ruler, Timer, BarChart2, FileText, Target, HelpCircle, Info, Lock, Calendar, Phone, CheckCircle, Settings, ThumbsUp, Heart, Rocket, ThumbsDown } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { supabase } from '../lib/supabase';
import { supabaseService, Profile, Appointment, Evaluation } from '../lib/supabaseService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

const URINE_COLORS = [
  { id: '1', color: '#ffffff', label: 'Transparente', desc: 'Hidratação excessiva ou ideal' },
  { id: '2', color: '#fef08a', label: 'Amarelo muito claro', desc: 'Boa hidratação' },
  { id: '3', color: '#fde047', label: 'Amarelo claro', desc: 'Hidratação normal' },
  { id: '4', color: '#eab308', label: 'Amarelo escuro', desc: 'Desidratação leve' },
  { id: '5', color: '#d97706', label: 'Âmbar', desc: 'Desidratação moderada' },
  { id: '6', color: '#c2410c', label: 'Laranja', desc: 'Desidratação severa' },
  { id: '7', color: '#78350f', label: 'Marrom escuro', desc: 'Atenção médica necessária' },
  { id: '8', color: '#ef4444', label: 'Avermelhada', desc: 'Atenção médica imediata' },
];

const TEST_INFO = {
  velocidade10m: "Tiros de 10 metros: Avalia a capacidade de aceleração inicial (arranque).",
  velocidade20m: "Tiros de 20 e 30 metros: Medem a velocidade máxima atingida em distâncias curtas.",
  yoyo: "Yo-Yo Intermittent Recovery Test: Considerado o 'padrão-ouro'. Corridas de 20m ida e volta com bipes progressivos e 10s de recuperação.",
  rast: "RAST: 6 tiros de 35 metros em velocidade máxima com 10s de descanso. Calcula potência anaeróbia e índice de fadiga.",
  illinois: "Aceleração e Mudança: Circuito com cones envolvendo corridas retas e em zigue-zague.",
  arrowhead: "Arrowhead Agility Test: Simula corridas rápidas em diagonal com cortes bruscos.",
  cmj: "Saltos Verticais (CMJ e SJ): Medem a potência de membros inferiores, essencial para disputas aéreas.",
  dinamometria: "Dinamometria Isocinética: Mede o desequilíbrio de força entre quadríceps e isquiotibiais.",
  sprintBola: "Sprint de 20m ou 30m com bola: Mede o grau de perda de velocidade ao conduzir a bola.",
  slalom: "Agilidade com bola (s): Avalia a agilidade técnica através da condução em alta velocidade por cones.",
  lspt: "Loughborough Soccer Passing Test (LSPT): Passes contra alvos específicos ditados aleatoriamente.",
  wallPass: "Precisão de passe (rep): Maior número de passes e domínios limpos contra uma tabela em tempo predeterminado.",
  finalizacao: "Circuito de Finalização Anaeróbico: Pique em alta velocidade, recebe passe e finaliza em até dois toques.",
  ssg: "Jogos Reduzidos (SSG): Mini-jogos com GPS para cruzar dados físicos, técnicos e táticos."
};

const METRIC_OPTIONS = [
  { value: 'weight', label: 'Peso (kg)' },
  { value: 'imc', label: 'IMC' },
  { value: 'bf_pollock7', label: '% Gordura (Pollock 7)' },
  { value: 'urineColor', label: 'Coloração da Urina (1-8)' },
  { value: 'painLevel', label: 'Nível de Dor (0-10)' },
  { value: 'velocidade10m', label: 'Velocidade 10m (s)' },
  { value: 'velocidade20m', label: 'Velocidade 20m (s)' },
  { value: 'yoyo', label: 'Yo-Yo Test (m)' },
  { value: 'rast', label: 'RAST' },
  { value: 'illinois', label: 'Aceleração e Mudança' },
  { value: 'arrowhead', label: 'Arrowhead' },
  { value: 'cmj', label: 'Salto CMJ (cm)' },
  { value: 'dinamometria', label: 'Dinamometria' },
  { value: 'sprintBola', label: 'Sprint Bola' },
  { value: 'slalom', label: 'Agilidade com bola (s)' },
  { value: 'lspt', label: 'LSPT' },
  { value: 'wallPass', label: 'Precisão de passe (rep)' },
  { value: 'finalizacao', label: 'Finalização' },
  { value: 'ssg', label: 'SSG' },
];

function AccordionSection({ title, icon: Icon, isOpen, onToggle, children, rightAction }: any) {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden"
    >
      <div className="p-4 flex items-center justify-between cursor-pointer select-none" onClick={onToggle}>
        <div className="flex items-center gap-2">
          {Icon && <Icon size={18} className="text-orange-500" />}
          <h3 className="text-base font-bold text-slate-800 dark:text-white">{title}</h3>
        </div>
        <div className="flex items-center gap-3">
          {rightAction && <div onClick={e => e.stopPropagation()}>{rightAction}</div>}
          {isOpen ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
        </div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800 overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

function TestRow({ label, value, info, isLiberated }: any) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{label}</span>
        {isLiberated && (
          <div 
            className="relative flex items-center justify-center"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => setShowTooltip(!showTooltip)}
          >
            <HelpCircle size={12} className="text-slate-400 cursor-help" />
            {showTooltip && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl z-50 leading-tight">
                {info}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-800" />
              </div>
            )}
          </div>
        )}
      </div>
      <span className="text-xs font-black text-slate-900 dark:text-white">
        {isLiberated ? (value !== undefined ? value : '--') : <Lock size={12} className="text-slate-300" />}
      </span>
    </div>
  );
}

// GitHub style frequency grid component
function FrequencyGrid({ logs }: { logs: string[] }) {
  const today = new Date();
  const days = [];
  
  // Last 30 days
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const count = logs.filter(l => l.startsWith(dateStr)).length;
    days.push({ date: dateStr, count });
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <CalendarIcon className="text-slate-400" size={16} />
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Frequência de Acesso</h3>
      </div>
      <div className="flex flex-wrap gap-1">
        {days.map((day, i) => (
          <div 
            key={i}
            title={day.date}
            className={`w-3 h-3 rounded-sm transition-colors ${
              day.count > 0 
                ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]' 
                : 'bg-slate-100 dark:bg-slate-800'
            }`}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between items-center">
        <span className="text-[10px] text-slate-400 font-medium">Menos</span>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-sm bg-slate-100 dark:bg-slate-800" />
          <div className="w-2 h-2 rounded-sm bg-orange-200" />
          <div className="w-2 h-2 rounded-sm bg-orange-400" />
          <div className="w-2 h-2 rounded-sm bg-orange-600" />
        </div>
        <span className="text-[10px] text-slate-400 font-medium">Mais</span>
      </div>
    </div>
  );
}

// --- Components ---

function ScoreBar({ value, onChange, colorClass, label }: { value: number, onChange: (v: number) => void, colorClass: string, label: string }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <h3 className="font-black text-slate-800 dark:text-white text-sm uppercase tracking-wider">{label}</h3>
        <span className={`text-2xl font-black ${colorClass.includes('orange') ? 'text-orange-500' : 'text-blue-500'}`}>{value}</span>
      </div>
      <div className="flex gap-1.5 h-10">
        {Array.from({ length: 11 }).map((_, i) => (
          <motion.button
            key={i}
            type="button"
            whileHover={{ scaleY: 1.1, zIndex: 10 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange(i)}
            className={`flex-1 rounded-md transition-all duration-300 ${
              value === i 
                ? colorClass + ' shadow-lg ' + (colorClass.includes('orange') ? 'shadow-orange-500/20' : 'shadow-blue-500/20')
                : (value !== null && value !== 0 && i <= value)
                  ? colorClass + '/40'
                  : 'bg-slate-100 dark:bg-slate-800'
            }`}
            style={{ 
              opacity: (value !== null && value !== 0 && i > value) ? 0.3 : 1
            }}
          />
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-slate-400 font-black uppercase tracking-widest">
        <span>Sem impacto</span>
        <span>Máximo {label.split(' ').pop()}</span>
      </div>
    </div>
  );
}

  function WeekSchedule({ appointments = [], onConfirm, onCancel }: any) {
  const [minimized, setMinimized] = useState(false);
  const today = new Date();
  
  // Calculate Start of Week (Sunday)
  const startOfWeek = new Date(today);
  startOfWeek.setHours(0,0,0,0);
  startOfWeek.setDate(today.getDate() - today.getDay());
  
  // Calculate End of Week (Saturday)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23,59,59,999);

  const safeApps = Array.isArray(appointments) ? appointments : [];
  
  // Strict current week filter
  const currentWeekApps = safeApps.filter((a: any) => {
    const appDate = new Date(a.date);
    return appDate >= startOfWeek && appDate <= endOfWeek;
  });

  const pendingApps = currentWeekApps.filter((a: any) => a.status === 'pending');
  
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
      <div 
        className="p-4 flex items-center justify-between cursor-pointer"
        onClick={() => setMinimized(!minimized)}
      >
        <div className="flex items-center gap-2">
          <CalendarIcon className="text-orange-500" size={18} />
          <h3 className="font-bold text-sm text-slate-800 dark:text-white">Minha Semana</h3>
        </div>
        <div className="flex items-center gap-2">
          {pendingApps.length > 0 && (
            <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
              {pendingApps.length} Pendentes
            </span>
          )}
          {minimized ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronUp size={18} className="text-slate-400" />}
        </div>
      </div>

      <AnimatePresence>
        {!minimized && (
          <motion.div 
            initial={{ height: 0 }} 
            animate={{ height: 'auto' }} 
            exit={{ height: 0 }}
            className="px-4 pb-4 overflow-hidden"
          >
            <div className="grid grid-cols-7 gap-1 mb-4">
              {weekDays.map((date, i) => {
                const isToday = date.toDateString() === today.toDateString();
                const dayApps = currentWeekApps.filter((a: any) => new Date(a.date).toDateString() === date.toDateString());
                const hasPending = dayApps.some((a: any) => a.status === 'pending');
                
                return (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <span className={`text-[10px] font-bold uppercase ${isToday ? 'text-orange-500' : 'text-slate-400'}`}>
                      {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][i]}
                    </span>
                    <div className={`w-full aspect-square rounded-xl flex items-center justify-center relative transition-all ${
                      isToday ? 'bg-orange-500 text-white border-2 border-orange-200' : 'bg-slate-50 dark:bg-slate-800 text-slate-600'
                    }`}>
                      <span className="text-xs font-black">{date.getDate()}</span>
                      {dayApps.length > 0 && (
                        <div className={`absolute -bottom-1 w-1.5 h-1.5 rounded-full ${hasPending ? 'bg-red-500' : 'bg-emerald-500'}`} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {pendingApps.length > 0 ? (
              <div className="space-y-2">
                {pendingApps.map((app: any) => (
                  <div key={app.id} className="bg-orange-50 dark:bg-orange-900/10 p-3 rounded-2xl border border-orange-100 dark:border-orange-900/20 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest">{app.type}</p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{app.time}</p>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => onConfirm(app.id, 'confirmed')} className="p-2 bg-emerald-500 text-white rounded-xl shadow-sm hover:scale-105 transition"><Check size={14}/></button>
                       <button onClick={() => onCancel(app.id, 'canceled')} className="p-2 bg-slate-200 dark:bg-slate-800 text-slate-500 rounded-xl hover:scale-105 transition"><X size={14}/></button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-[10px] text-slate-400 font-bold uppercase py-2">Nenhum compromisso pendente</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Calculations ---
const calcIMC = (weight: number, heightCm: number) => {
  const h = heightCm / 100;
  return (weight / (h * h)).toFixed(1);
};

const calcPollock3 = (skinfolds: any, age: number) => {
  const sum3 = skinfolds.chest + skinfolds.abdominal + skinfolds.thigh;
  const bd = 1.10938 - (0.0008267 * sum3) + (0.0000016 * Math.pow(sum3, 2)) - (0.0002574 * age);
  return ((495 / bd) - 450).toFixed(1);
};

const calcPollock7 = (skinfolds: any, age: number) => {
  const sum7 = skinfolds.triceps + skinfolds.chest + skinfolds.axillary + skinfolds.subscapular + skinfolds.suprailiac + skinfolds.abdominal + skinfolds.thigh;
  const bd = 1.112 - (0.00043499 * sum7) + (0.00000055 * Math.pow(sum7, 2)) - (0.00028826 * age);
  return ((495 / bd) - 450).toFixed(1);
};

const calcGuedes = (skinfolds: any) => {
  const sum3 = skinfolds.triceps + skinfolds.suprailiac + skinfolds.abdominal;
  const bd = 1.17136 - (0.06706 * Math.log10(sum3));
  return ((495 / bd) - 450).toFixed(1);
};

const BODY_PARTS = [
  { id: 'neck', label: 'Pescoço' },
  { id: 'shoulders', label: 'Ombros' },
  { id: 'chest', label: 'Peitoral' },
  { id: 'back', label: 'Costas' },
  { id: 'arms', label: 'Braços' },
  { id: 'wrists', label: 'Punhos/Mãos' },
  { id: 'abdomen', label: 'Abdômen' },
  { id: 'hips', label: 'Quadril' },
  { id: 'thighs', label: 'Coxas' },
  { id: 'knees', label: 'Joelhos' },
  { id: 'calves', label: 'Panturrilhas' },
  { id: 'ankles', label: 'Tornozelos/Pés' }
];

export default function UserDashboard() {
  const navigate = useNavigate();
  const [pain, setPain] = useState<number>(0);
  const [fatigue, setFatigue] = useState<number>(0);
  const [hydration, setHydration] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [accessLogs, setAccessLogs] = useState<string[]>([]);
  const [latestEval, setLatestEval] = useState<any>(null);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [localReactions, setLocalReactions] = useState<Record<string, string | null>>({});

  const toggleReaction = (msgId: string, type: string) => {
    setLocalReactions(prev => ({
      ...prev,
      [msgId]: prev[msgId] === type ? null : type
    }));
  };

  // Profile States from PatientProfile
  const [selectedEvalId, setSelectedEvalId] = useState<string>('');
  const [chartMetric, setChartMetric] = useState<string>('weight');
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    perfil: false,
    recados: true,
    acompanhamento: true,
    historico: false,
    avaliacao: false,
    especifica: false,
    agendamentos: false,
    tabela: false
  });
  const [bfEquation, setBfEquation] = useState<'pollock3' | 'pollock7' | 'guedes'>('pollock7');
  const [showAllDates, setShowAllDates] = useState(false);

  const MEASUREMENT_LABELS: { [key: string]: string } = {
    neck: 'Pescoço', chest: 'Peito', biceps: 'Bíceps', forearm: 'Antebraço',
    waist: 'Cintura', abdomen: 'Abdômen', hip: 'Quadril',
    proximalThigh: 'Coxa Prox.', medialThigh: 'Coxa Med.', distalThigh: 'Coxa Dist.', calf: 'Panturrilha'
  };

  const SKINFOLD_LABELS: { [key: string]: string } = {
    triceps: 'Tríceps', subscapular: 'Subescapular', chest: 'Peitoral', axillary: 'Axilar Méd.',
    suprailiac: 'Suprailíaca', abdominal: 'Abdominal', thigh: 'Coxa',
    calf: 'Panturrilha', biceps: 'Bíceps', iliacCrest: 'Crista Ilíaca'
  };

  const TEST_LABELS: { [key: string]: string } = {
    velocidade10m: 'Veloc. 10m', velocidade20m: 'Veloc. 20m', yoyo: 'Yo-Yo Test', rast: 'RAST',
    illinois: 'Aceleração e Mudança', arrowhead: 'Arrowhead', cmj: 'Salto CMJ', dinamometria: 'Dinamom.',
    sprintBola: 'Sprint Bola', slalom: 'Agilidade com bola (s)', lspt: 'LSPT', wallPass: 'Precisão de passe (rep)',
    finalizacao: 'Finalização', ssg: 'SSG'
  };

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role !== 'athlete' && role !== 'user') {
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

        // Log access
        await supabaseService.logAccess(userId);

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

        // Fetch messages
        const msgs = await supabaseService.getMessages(userId);
        setMessages(msgs.map(m => ({
          id: m.id,
          text: m.text,
          date: m.created_at,
          author: m.profiles?.full_name || 'Admin'
        })));

        // Fetch access logs
        const logs = await supabaseService.getAccessLogs(userId);
        setAccessLogs(logs.map(l => l.date));

        // Fetch latest evaluation
        const evals = await supabaseService.getEvaluations(userId);
        if (evals && evals.length > 0) {
          const sorted = evals.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setEvaluations(sorted);
          setLatestEval(sorted[0]);
          setSelectedEvalId(sorted[0].id);
          setSelectedDates(sorted.slice(0, 5).map(e => e.date));
        }

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

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const selectedEval = evaluations.find(e => e.id === selectedEvalId);

  const getChartData = () => {
    return evaluations
      .filter(e => selectedDates.includes(e.date))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(e => {
        let value: any = 0;
        if (chartMetric === 'weight') value = e.data.weight;
        else if (chartMetric === 'imc') value = parseFloat(calcIMC(e.data.weight, e.data.height));
        else if (chartMetric === 'bf_pollock7') value = parseFloat(calcPollock7(e.data.skinfolds, profile?.dob ? new Date().getFullYear() - new Date(profile.dob).getFullYear() : 20));
        else if (chartMetric === 'urineColor') value = e.data.urineColor;
        else if (chartMetric === 'painLevel') value = e.data.painLevel;
        else if (e.data.specificTests && e.data.specificTests[chartMetric] !== undefined) {
          value = e.data.specificTests[chartMetric];
        }

        return {
          date: new Date(e.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          fullDate: e.date,
          value: value || 0
        };
      });
  };

  // Body Map State
  const [painLocations, setPainLocations] = useState<string[]>([]);
  
  const toggleBodyPart = (id: string) => {
    if (painLocations.includes(id)) {
      setPainLocations(painLocations.filter(p => p !== id));
    } else {
      setPainLocations([...painLocations, id]);
    }
  };

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

  const calculateStreak = () => {
    if (accessLogs.length === 0) return 0;
    const sortedDates = [...new Set(accessLogs)].map(d => new Date(d)).sort((a, b) => b.getTime() - a.getTime());
    let currentStreak = 0;
    
    // Check if we start the streak today or yesterday
    let checkDate = new Date();
    checkDate.setHours(0,0,0,0);
    
    const hasToday = sortedDates.some(d => {
      const logD = new Date(d);
      logD.setHours(0,0,0,0);
      return logD.getTime() === checkDate.getTime();
    });
    
    if (!hasToday) {
      checkDate.setDate(checkDate.getDate() - 1); // Start checking from yesterday if they haven't logged today yet
    }

    for (let i = 0; i < sortedDates.length; i++) {
        const logDate = new Date(sortedDates[i]);
        logDate.setHours(0,0,0,0);
        
        if (logDate.getTime() === checkDate.getTime()) {
           currentStreak++;
           checkDate.setDate(checkDate.getDate() - 1);
        } else if (logDate.getTime() < checkDate.getTime()) {
           break;
        }
    }
    return currentStreak;
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
        status: 'Pendente',
        pain_location: painLocations.join(', ')
      });
      
      if (painLocations.length > 0) {
        const locationsStr = painLocations.map(p => BODY_PARTS.find(bp => bp.id === p)?.label).join(', ');
        await supabaseService.addMessage(
          userId, 
          userId, 
          `[Relato Automático - Sistema] Cuidado: Relatei dores locais hoje em: ${locationsStr} (Nível Geral: ${pain})`
        );
      }
      
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
      <header className="bg-slate-900 dark:bg-slate-900 text-white p-2 sm:p-3 sticky top-0 z-10 shadow-md flex justify-between items-center h-12 sm:h-14">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500 rounded-lg flex items-center justify-center p-1.5 shadow-lg shadow-orange-500/20 overflow-hidden relative group">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-full h-full object-contain relative z-10"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent && !parent.querySelector('.txt-logo-dash')) {
                  const txt = document.createElement('span');
                  txt.className = 'txt-logo-dash text-white font-black text-[8px] leading-tight text-center';
                  txt.innerText = 'ELS';
                  parent.appendChild(txt);
                }
              }}
            />
          </div>
          <p className="text-[10px] sm:text-xs text-slate-400 border-l border-slate-700 pl-2 ml-1 font-bold uppercase tracking-widest leading-none">Monitoramento</p>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3">
          <ThemeToggle />
          {profile?.photo ? (
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-slate-700 shrink-0">
              <img src={profile.photo} alt="User" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
              <User size={14} />
            </div>
          )}
          <button onClick={() => navigate('/settings')} className="p-1.5 sm:p-2 bg-slate-800 rounded-full text-slate-300 hover:text-white transition">
            <Settings size={16} className="sm:w-5 sm:h-5" />
          </button>
          <button onClick={handleLogout} className="p-1.5 sm:p-2 bg-slate-800 rounded-full text-slate-300 hover:text-white transition">
            <LogOut size={16} className="sm:w-5 sm:h-5" />
          </button>
        </div>
      </header>

      <main className="p-4 max-w-md mx-auto space-y-6">
        {/* 1. Greeting & Gamification */}
        <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight leading-tight">Olá, {profile?.full_name?.split(' ')[0] || 'Atleta'}!</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-bold uppercase tracking-widest">Bom treino hoje</p>
          </div>
          {calculateStreak() > 0 && (
            <div className="flex items-center gap-1.5 bg-orange-100 dark:bg-orange-900/30 px-3 py-1.5 rounded-full border border-orange-200 dark:border-orange-800/50" title={`Você está há ${calculateStreak()} dias seguidos preenchendo o bem-estar!`}>
              <Flame size={16} className="text-orange-500" />
              <span className="text-orange-600 dark:text-orange-400 font-black text-sm">{calculateStreak()}</span>
            </div>
          )}
        </div>

        {/* 2. Informações de Contato (Collapsed by default) */}
        <AccordionSection 
          title="Informações de Contato" 
          icon={User} 
          isOpen={openSections.perfil} 
          onToggle={() => toggleSection('perfil')}
        >
          <div className="grid grid-cols-1 gap-4 py-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500">
                <Phone size={18} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">WhatsApp</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{profile?.phone || '--'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500">
                <Target size={18} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Objetivo</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{profile?.target_training || '--'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500">
                <Activity size={18} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Posição</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {profile?.position1}{profile?.position2 ? ` / ${profile.position2}` : ''}
                </p>
              </div>
            </div>
          </div>
        </AccordionSection>

        {/* 3. Recados */}
        <div className="animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="text-orange-500" size={18} />
            <h3 className="font-black text-slate-800 dark:text-white text-sm uppercase tracking-wider">Recados</h3>
          </div>
          <div className="space-y-3">
            {messages.length > 0 ? (
              messages.map(msg => (
                <div key={msg.id} className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-2xl border border-orange-100 dark:border-orange-900/30 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
                  <p className="text-sm text-slate-700 dark:text-slate-300 mb-2 leading-relaxed font-medium">{supabaseService.cleanMessageText(msg.text)}</p>
                  
                  {/* Reações */}
                  <div className="flex gap-2 mb-3">
                    <button 
                      onClick={() => toggleReaction(msg.id, 'like')}
                      className={`p-1.5 rounded-lg transition-all active:scale-95 border ${localReactions[msg.id] === 'like' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-500 border-blue-200 dark:border-blue-800' : 'bg-white/50 dark:bg-slate-800/50 text-slate-400 hover:text-blue-500 hover:bg-white dark:hover:bg-slate-800 border-slate-100 dark:border-slate-800'}`}
                    >
                      <ThumbsUp size={14} className={localReactions[msg.id] === 'like' ? 'fill-current' : ''} />
                    </button>
                    <button 
                      onClick={() => toggleReaction(msg.id, 'heart')}
                      className={`p-1.5 rounded-lg transition-all active:scale-95 border ${localReactions[msg.id] === 'heart' ? 'bg-red-100 dark:bg-red-900/30 text-red-500 border-red-200 dark:border-red-800' : 'bg-white/50 dark:bg-slate-800/50 text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-800 border-slate-100 dark:border-slate-800'}`}
                    >
                      <Heart size={14} className={localReactions[msg.id] === 'heart' ? 'fill-current' : ''} />
                    </button>
                    <button 
                      onClick={() => toggleReaction(msg.id, 'rocket')}
                      className={`p-1.5 rounded-lg transition-all active:scale-95 border ${localReactions[msg.id] === 'rocket' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-500 border-orange-200 dark:border-orange-800' : 'bg-white/50 dark:bg-slate-800/50 text-slate-400 hover:text-orange-500 hover:bg-white dark:hover:bg-slate-800 border-slate-100 dark:border-slate-800'}`}
                    >
                      <Rocket size={14} className={localReactions[msg.id] === 'rocket' ? 'fill-current' : ''} />
                    </button>
                    <button 
                      onClick={() => toggleReaction(msg.id, 'dislike')}
                      className={`p-1.5 rounded-lg transition-all active:scale-95 border ${localReactions[msg.id] === 'dislike' ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-200 border-slate-300 dark:border-slate-600' : 'bg-white/50 dark:bg-slate-800/50 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-white dark:hover:bg-slate-800 border-slate-100 dark:border-slate-800'}`}
                    >
                      <ThumbsDown size={14} className={localReactions[msg.id] === 'dislike' ? 'fill-current' : ''} />
                    </button>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                    <span>{msg.author}</span>
                    <span>{new Date(msg.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
                <p className="text-slate-400 text-xs italic font-medium">Nenhum recado no momento.</p>
              </div>
            )}
          </div>
        </div>

        {/* 3. Peso, Gordura, IMC */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-widest">Peso</p>
            <p className="text-lg font-black text-slate-800 dark:text-white">{latestEval?.data?.weight?.toFixed(1) || '--'} <span className="text-[10px] font-normal">kg</span></p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-widest">% Gordura</p>
            <p className="text-lg font-black text-orange-500">
              {latestEval?.data?.skinfolds ? (
                // Simple calculation for display
                ((latestEval.data.skinfolds.triceps + latestEval.data.skinfolds.subscapular + latestEval.data.skinfolds.suprailiac) * 0.1).toFixed(1)
              ) : '--'} <span className="text-[10px] font-normal">%</span>
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-widest">IMC</p>
            <p className="text-lg font-black text-blue-500">
              {latestEval?.data?.weight && latestEval?.data?.height ? (
                (latestEval.data.weight / Math.pow(latestEval.data.height / 100, 2)).toFixed(1)
              ) : '--'}
            </p>
          </div>
        </div>

        {/* Frequency Grid */}
        <FrequencyGrid logs={accessLogs} />

        {/* Weekly Appointments */}
        <WeekSchedule 
          appointments={appointments} 
          onConfirm={handleUpdateAppointmentStatus} 
          onCancel={handleUpdateAppointmentStatus} 
        />

        {submitted ? (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-8 rounded-3xl border border-emerald-100 dark:border-emerald-900/50 text-center animate-in fade-in zoom-in duration-500">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-xl font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-tight">Avaliação concluída</h3>
            <p className="text-sm text-emerald-600 dark:text-emerald-500 mt-1 font-medium">Obrigado pelo seu feedback diário!</p>
            <button 
              onClick={() => setSubmitted(false)}
              className="mt-6 px-6 py-2 bg-emerald-100 dark:bg-emerald-900/40 text-xs font-black text-emerald-700 dark:text-emerald-400 rounded-full uppercase tracking-widest hover:bg-emerald-200 transition"
            >
              Editar resposta
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 4. Nível de Hidratação */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-4">
                <Droplets className="text-cyan-500" size={20} />
                <h3 className="font-black text-slate-800 dark:text-white text-sm uppercase tracking-wider">Nível de Hidratação</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 font-medium">Selecione a cor da sua urina hoje:</p>
              
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl overflow-hidden">
                <div className="flex justify-between gap-1">
                  {URINE_COLORS.map((item) => (
                    <motion.button 
                      key={item.id}
                      type="button"
                      whileHover={{ scale: 1.2, zIndex: 10 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setHydration(item.id)}
                      className={`relative flex-1 aspect-square max-w-[32px] rounded-full border-2 transition-all duration-300 ${
                        hydration === item.id 
                          ? 'border-orange-500 shadow-lg scale-110 z-10' 
                          : hydration 
                            ? 'border-transparent' 
                            : 'border-slate-200 dark:border-slate-700'
                      }`}
                      style={{ 
                        backgroundColor: hydration && hydration !== item.id ? '#cbd5e1' : item.color,
                        opacity: hydration && hydration !== item.id ? 0.3 : 1,
                        filter: hydration && hydration !== item.id ? 'grayscale(100%)' : 'none'
                      }}
                    >
                      {hydration === item.id && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check size={14} className="text-orange-600 drop-shadow-sm font-black" />
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* 5. Pain */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
              <ScoreBar 
                label="Nível de Dor" 
                value={pain} 
                onChange={(val) => {
                  setPain(val);
                  if (val === 0) setPainLocations([]);
                }} 
                colorClass="bg-orange-500" 
              />

              {/* Botões do Corpo Interativo (Aparecem se a dor for > 0) */}
              <AnimatePresence>
                {pain > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-4 border-t border-slate-100 dark:border-slate-800 overflow-hidden"
                  >
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-bold text-center">Toque no boneco para indicar o local:</p>
                    
                    {/* Visual Body Map */}
                    <div className="relative w-full max-w-[200px] mx-auto aspect-[1/2] mb-8">
                       <div className="absolute inset-0 flex flex-col items-center gap-1">
                          {/* Head */}
                          <motion.button 
                            type="button"
                            whileTap={{ scale: 0.9 }}
                            onClick={() => toggleBodyPart('neck')}
                            className={`w-10 h-10 rounded-full border-2 transition-transform ${painLocations.includes('neck') ? 'bg-orange-500 border-orange-600 scale-110 shadow-lg' : 'bg-slate-200 dark:bg-slate-800 border-transparent'}`}
                          />
                          {/* Torso */}
                          <div className="flex gap-1 items-start">
                             <motion.button 
                               type="button"
                               onClick={() => toggleBodyPart('shoulders')}
                               className={`w-8 h-12 rounded-lg ${painLocations.includes('shoulders') ? 'bg-orange-500' : 'bg-slate-200 dark:bg-slate-800'}`}
                             />
                             <motion.button 
                               type="button"
                               onClick={() => toggleBodyPart('chest')}
                               className={`w-16 h-20 rounded-2xl ${painLocations.includes('chest') ? 'bg-orange-500' : 'bg-slate-200 dark:bg-slate-800'}`}
                             />
                             <motion.button 
                               type="button"
                               onClick={() => toggleBodyPart('shoulders')}
                               className={`w-8 h-12 rounded-lg ${painLocations.includes('shoulders') ? 'bg-orange-500' : 'bg-slate-200 dark:bg-slate-800'}`}
                             />
                          </div>
                          {/* Pelvis */}
                          <motion.button 
                              type="button"
                              onClick={() => toggleBodyPart('hips')}
                              className={`w-14 h-8 rounded-b-xl -mt-2 ${painLocations.includes('hips') ? 'bg-orange-500' : 'bg-slate-200 dark:bg-slate-800'}`}
                          />
                          {/* Legs */}
                          <div className="flex gap-4 mt-1">
                             <div className="flex flex-col gap-1">
                                <motion.button type="button" onClick={() => toggleBodyPart('thighs')} className={`w-7 h-14 rounded-lg ${painLocations.includes('thighs') ? 'bg-orange-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
                                <motion.button type="button" onClick={() => toggleBodyPart('knees')} className={`w-5 h-5 rounded-full ${painLocations.includes('knees') ? 'bg-orange-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
                                <motion.button type="button" onClick={() => toggleBodyPart('calves')} className={`w-5 h-12 rounded-lg ${painLocations.includes('calves') ? 'bg-orange-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
                                <motion.button type="button" onClick={() => toggleBodyPart('ankles')} className={`w-6 h-4 rounded-sm ${painLocations.includes('ankles') ? 'bg-orange-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
                             </div>
                             <div className="flex flex-col gap-1">
                                <motion.button type="button" onClick={() => toggleBodyPart('thighs')} className={`w-7 h-14 rounded-lg ${painLocations.includes('thighs') ? 'bg-orange-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
                                <motion.button type="button" onClick={() => toggleBodyPart('knees')} className={`w-5 h-5 rounded-full ${painLocations.includes('knees') ? 'bg-orange-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
                                <motion.button type="button" onClick={() => toggleBodyPart('calves')} className={`w-5 h-12 rounded-lg ${painLocations.includes('calves') ? 'bg-orange-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
                                <motion.button type="button" onClick={() => toggleBodyPart('ankles')} className={`w-6 h-4 rounded-sm ${painLocations.includes('ankles') ? 'bg-orange-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-2">
                      {BODY_PARTS.map(part => (
                        <button
                          key={part.id}
                          type="button"
                          onClick={() => toggleBodyPart(part.id)}
                          className={`px-3 py-1.5 rounded-full text-[10px] font-black transition-all border ${
                            painLocations.includes(part.id) 
                              ? 'bg-orange-500 text-white border-orange-500 shadow-sm' 
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400'
                          }`}
                        >
                          {part.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 6. Fadiga */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
              <ScoreBar 
                label="Nível de Fadiga" 
                value={fatigue} 
                onChange={setFatigue} 
                colorClass="bg-blue-500" 
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-slate-900 dark:bg-orange-500 text-white font-black text-sm py-5 rounded-3xl shadow-xl hover:shadow-2xl transition-all active:scale-[0.98] uppercase tracking-widest"
            >
              Enviar Feedback Diário
            </button>
          </form>
        )}

        {/* 6. Acompanhamento (Charts) */}
        <AccordionSection 
          title="Acompanhamento" 
          icon={BarChart2} 
          isOpen={openSections.acompanhamento} 
          onToggle={() => toggleSection('acompanhamento')}
          rightAction={
            <select 
              value={chartMetric}
              onChange={(e) => setChartMetric(e.target.value)}
              className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 border-none rounded-lg focus:ring-0"
            >
              {METRIC_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          }
        >
          <div className="w-full mt-4" style={{ height: '260px', minHeight: '260px' }}>
            {openSections.acompanhamento && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getChartData()} margin={{ top: 30, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }}
                    domain={['auto', 'auto']}
                  />
                  <RechartsTooltip 
                    cursor={{ fill: '#f8fafc' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-900 text-white p-2 rounded-lg shadow-xl text-[10px] font-bold">
                            {payload[0].value} {METRIC_OPTIONS.find(o => o.value === chartMetric)?.label}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {getChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === getChartData().length - 1 ? '#f97316' : '#cbd5e1'} />
                    ))}
                    <LabelList 
                      dataKey="value" 
                      position="top" 
                      style={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }} 
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </AccordionSection>

        {/* 7. Histórico */}
        <AccordionSection 
          title="Histórico de Avaliações" 
          icon={FileText} 
          isOpen={openSections.historico} 
          onToggle={() => toggleSection('historico')}
        >
          <div className="space-y-2 py-2">
            {evaluations.map((evalItem) => (
              <button
                key={evalItem.id}
                onClick={() => setSelectedEvalId(evalItem.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                  selectedEvalId === evalItem.id 
                    ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-900/50' 
                    : 'bg-white border-slate-100 dark:bg-slate-900 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    selectedEvalId === evalItem.id ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}>
                    <Calendar size={14} />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-800 dark:text-white">
                      {new Date(evalItem.date).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                      {evalItem.type === 'physical' ? 'Física' : 'Específica'}
                    </p>
                  </div>
                </div>
                {selectedEvalId === evalItem.id && <CheckCircle size={16} className="text-orange-500" />}
              </button>
            ))}
          </div>
        </AccordionSection>

        {/* 8. Avaliação Física */}
        <AccordionSection 
          title="Avaliação Física" 
          icon={Activity} 
          isOpen={openSections.avaliacao} 
          onToggle={() => toggleSection('avaliacao')}
        >
          {selectedEval?.type === 'physical' && selectedEval.is_liberated ? (
            <div className="space-y-6 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Peso</p>
                  <p className="text-sm font-black text-slate-800 dark:text-white">{selectedEval.data.weight} kg</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">% Gordura</p>
                  <p className="text-sm font-black text-orange-500">
                    {bfEquation === 'pollock7' ? calcPollock7(selectedEval.data.skinfolds, profile?.dob ? new Date().getFullYear() - new Date(profile.dob).getFullYear() : 20) : 
                     bfEquation === 'pollock3' ? calcPollock3(selectedEval.data.skinfolds, profile?.dob ? new Date().getFullYear() - new Date(profile.dob).getFullYear() : 20) : 
                     calcGuedes(selectedEval.data.skinfolds)}%
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">IMC</p>
                  <p className="text-sm font-black text-blue-500">{calcIMC(selectedEval.data.weight, selectedEval.data.height)}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Hidratação</p>
                  <div className="flex gap-1 mt-1">
                    {[1,2,3,4,5,6,7,8].map(v => (
                      <div 
                        key={v} 
                        className={`w-2 h-2 rounded-full ${selectedEval.data.urineColor === v ? 'ring-2 ring-offset-1 ring-slate-400' : ''}`}
                        style={{ backgroundColor: URINE_COLORS[v-1].color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Dobras Cutâneas (mm)</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(selectedEval.data.skinfolds).map(([key, val]: any) => (
                    <div key={key} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg text-[11px]">
                      <span className="font-bold text-slate-500">{SKINFOLD_LABELS[key] || key}</span>
                      <span className="font-black text-slate-800 dark:text-white">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-slate-400 italic">Selecione uma avaliação física liberada no histórico.</p>
            </div>
          )}
        </AccordionSection>

        {/* 9. Tabela de Medidas */}
        <AccordionSection 
          title="Tabela de Medidas" 
          icon={Ruler} 
          isOpen={openSections.tabela} 
          onToggle={() => toggleSection('tabela')}
        >
          {selectedEval?.type === 'physical' && selectedEval.is_liberated ? (
            <div className="grid grid-cols-2 gap-2 py-2">
              {Object.entries(selectedEval.data.measurements).map(([key, val]: any) => (
                <div key={key} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg text-[11px]">
                  <span className="font-bold text-slate-500">{MEASUREMENT_LABELS[key] || key}</span>
                  <span className="font-black text-slate-800 dark:text-white">{val} cm</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-slate-400 italic">Selecione uma avaliação física liberada no histórico.</p>
            </div>
          )}
        </AccordionSection>

        {/* 10. Avaliação Específica */}
        <AccordionSection 
          title="Avaliação Específica" 
          icon={Target} 
          isOpen={openSections.especifica} 
          onToggle={() => toggleSection('especifica')}
        >
          {selectedEval?.type === 'specific' && selectedEval.is_liberated ? (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(selectedEval.data.specificTests).map(([key, val]: any) => (
                  <TestRow 
                    key={key}
                    label={TEST_LABELS[key] || key} 
                    value={val} 
                    info={TEST_INFO[key as keyof typeof TEST_INFO] || ''}
                    isLiberated={true}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-slate-400 italic">Selecione uma avaliação específica liberada no histórico.</p>
            </div>
          )}
        </AccordionSection>
      </main>
    </div>
  );
}
