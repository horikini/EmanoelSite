import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, User, Phone, Activity, Ruler, Timer, Calendar, HelpCircle, Lock, Unlock, Plus, BarChart2, FileText, Target, ChevronDown, ChevronUp, MoreHorizontal, Camera, Edit2, Save, X, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

import { supabase } from '../lib/supabase';
import { supabaseService, Profile } from '../lib/supabaseService';

// --- Interfaces ---
interface SpecificTests {
  velocidade10m?: number;
  velocidade20m?: number;
  yoyo?: number;
  rast?: number;
  illinois?: number;
  arrowhead?: number;
  cmj?: number;
  dinamometria?: number;
  sprintBola?: number;
  slalom?: number;
  lspt?: number;
  wallPass?: number;
  finalizacao?: number;
  ssg?: number;
}

interface Evaluation {
  id: string;
  date: string;
  isLiberated: boolean;
  weight: number;
  height: number;
  measurements: {
    neck: number; chest: number; biceps: number; forearm: number;
    waist: number; abdomen: number; hip: number;
    proximalThigh: number; medialThigh: number; distalThigh: number; calf: number;
  };
  skinfolds: {
    triceps: number; subscapular: number; chest: number; axillary: number;
    suprailiac: number; abdominal: number; thigh: number;
    calf?: number; biceps?: number; iliacCrest?: number;
  };
  specificTests: SpecificTests;
  urineColor?: number;
  painLevel?: number;
}

interface Patient {
  id: string | number;
  name: string;
  phone: string;
  email?: string;
  city?: string;
  registrationDate?: string;
  targetTraining?: string;
  position1?: string;
  position2?: string;
  photo?: string;
  guardianName?: string;
  guardianPhone?: string;
  age: number;
  evaluations: Evaluation[];
}

interface Appointment {
  id: string;
  athleteId: string | number;
  athleteName: string;
  date: string;
  time: string;
  type: string;
  status: 'pending' | 'confirmed' | 'canceled';
  createdAt: string;
}

// --- Mock Data Generator ---
const generateMockEvaluations = (): Evaluation[] => {
  const evals: Evaluation[] = [];
  const startDate = new Date('2023-06-01');
  
  for (let i = 0; i < 12; i++) {
    const date = new Date(startDate);
    date.setMonth(startDate.getMonth() + i);
    
    evals.push({
      id: `eval-${i}`,
      date: date.toISOString().split('T')[0],
      isLiberated: true, // Simulate all results liberated as requested
      weight: 70 + Math.random() * 5,
      height: 178,
      measurements: { 
        neck: 37 + Math.random(), chest: 95 + Math.random() * 5, biceps: 31 + Math.random() * 3, 
        forearm: 27 + Math.random() * 2, waist: 78 + Math.random() * 5, abdomen: 80 + Math.random() * 5, 
        hip: 94 + Math.random() * 4, proximalThigh: 54 + Math.random() * 4, medialThigh: 50 + Math.random() * 4, 
        distalThigh: 42 + Math.random() * 3, calf: 37 + Math.random() * 2 
      },
      skinfolds: { 
        triceps: 10 + Math.random() * 4, subscapular: 12 + Math.random() * 4, chest: 6 + Math.random() * 4, 
        axillary: 8 + Math.random() * 4, suprailiac: 12 + Math.random() * 5, abdominal: 14 + Math.random() * 6, 
        thigh: 12 + Math.random() * 4, calf: 10 + Math.random() * 3, biceps: 4 + Math.random() * 3, 
        iliacCrest: 13 + Math.random() * 5 
      },
      specificTests: { 
        velocidade10m: 1.8 - (i * 0.02), velocidade20m: 3.2 - (i * 0.03), yoyo: 1600 + (i * 50), 
        rast: 6.8 - (i * 0.1), illinois: 16 - (i * 0.2), arrowhead: 8.8 - (i * 0.1), 
        cmj: 38 + (i * 1), dinamometria: 15 - (i * 0.5), sprintBola: 3.6 - (i * 0.05), 
        slalom: 17 - (i * 0.2), lspt: 50 - (i * 1), wallPass: 18 + i, 
        finalizacao: 6 + Math.floor(i/2), ssg: 80 + i 
      },
      urineColor: Math.floor(Math.random() * 3) + 1,
      painLevel: Math.floor(Math.random() * 3)
    });
  }
  return evals;
};

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

// --- Constants ---
const URINE_COLORS = [
  '#fef8d4', // 1
  '#fceea4', // 2
  '#f8e58c', // 3
  '#f4d334', // 4
  '#f2ce64', // 5
  '#f4c251', // 6
  '#e2ab46', // 7
  '#988c54', // 8
];

const TEST_INFO = {
  velocidade10m: "Tiros de 10 metros: Avalia a capacidade de aceleração inicial (arranque).",
  velocidade20m: "Tiros de 20 e 30 metros: Medem a velocidade máxima atingida em distâncias curtas.",
  yoyo: "Yo-Yo Intermittent Recovery Test: Considerado o 'padrão-ouro'. Corridas de 20m ida e volta com bipes progressivos e 10s de recuperação.",
  rast: "RAST: 6 tiros de 35 metros em velocidade máxima com 10s de descanso. Calcula potência anaeróbia e índice de fadiga.",
  illinois: "Aceleração e Velocidade de mudança: Circuito com cones envolvendo corridas retas e em zigue-zague.",
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
  { value: 'yoyo', label: 'Yo-Yo Test (m)' },
  { value: 'cmj', label: 'Salto CMJ (cm)' },
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

export default function PatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [selectedEvalId, setSelectedEvalId] = useState<string>('');
  
  // Chart States
  const [chartMetric, setChartMetric] = useState<string>('weight');
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  
  // UI States
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    perfil: true,
    acompanhamento: true,
    historico: false,
    avaliacao: false,
    especifica: false,
    agendamentos: false,
    tabela: false
  });
  const [bfEquation, setBfEquation] = useState<'pollock3' | 'pollock7' | 'guedes'>('pollock7');
  const [showAllDates, setShowAllDates] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    phone: '',
    city: '',
    targetTraining: '',
    position1: '',
    position2: '',
    photo: ''
  });

  const isAdmin = localStorage.getItem('userRole') === 'admin';
  const isUser = localStorage.getItem('userRole') === 'athlete' || localStorage.getItem('userRole') === 'user';
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (!id) return;

        // Fetch profile
        const profile = await supabaseService.getProfile(id);
        
        // Fetch evaluations
        const evals = await supabaseService.getEvaluations(id);
        
        // Map evaluations from Supabase format
        const mappedEvals: Evaluation[] = evals.map(e => ({
          id: e.id,
          date: e.date,
          isLiberated: e.is_liberated,
          weight: e.data.weight,
          height: e.data.height,
          measurements: e.data.measurements,
          skinfolds: e.data.skinfolds,
          specificTests: e.data.specificTests,
          urineColor: e.data.urineColor,
          painLevel: e.data.painLevel
        }));

        // If no evaluations, generate mock ones for demonstration
        const finalEvals = mappedEvals.length > 0 ? mappedEvals : generateMockEvaluations();

        setPatient({
          id: profile.id,
          name: profile.full_name,
          phone: profile.phone || '(00) 00000-0000',
          email: profile.email,
          city: profile.city,
          registrationDate: profile.registration_date,
          targetTraining: profile.target_training,
          position1: profile.position1,
          position2: profile.position2,
          photo: profile.photo,
          age: profile.dob ? new Date().getFullYear() - new Date(profile.dob).getFullYear() : 20,
          evaluations: finalEvals
        });

        setEditForm({
          phone: profile.phone || '',
          city: profile.city || '',
          targetTraining: profile.target_training || '',
          position1: profile.position1 || '',
          position2: profile.position2 || '',
          photo: profile.photo || ''
        });

        if (finalEvals.length > 0) {
          setSelectedEvalId(finalEvals[finalEvals.length - 1].id);
          setSelectedDates(finalEvals.map(e => e.id));
        }

        // Fetch appointments
        const apps = await supabaseService.getAppointments();
        setAppointments(apps.filter(a => String(a.athlete_id) === String(id)).map(a => ({
          id: a.id || Math.random().toString(),
          athleteId: a.athlete_id,
          athleteName: a.profiles?.full_name || profile.full_name,
          date: a.date,
          time: a.time,
          type: a.type,
          status: a.status as any,
          createdAt: a.date
        })));

      } catch (error) {
        console.error('Error loading patient data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'eval') {
      setOpenSections(prev => ({ ...prev, avaliacao: true, especifica: true }));
    }
  }, [location.search]);

  if (loading) return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-500">Carregando...</div>;
  if (!patient) return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-500">Atleta não encontrado.</div>;

  // Filter evaluations for user (only liberated ones) unless admin
  const visibleEvaluations = (isAdmin ? patient.evaluations : patient.evaluations.filter(e => e.isLiberated))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const selectedEval = visibleEvaluations.find(e => e.id === selectedEvalId) || visibleEvaluations[visibleEvaluations.length - 1];

  const toggleLiberation = async (evalId: string, type: 'physical' | 'specific') => {
    if (!isAdmin) return;
    try {
      const ev = patient.evaluations.find(e => e.id === evalId);
      if (!ev) return;
      
      // In a real app, we'd have separate flags for physical and specific liberation
      // For now, we'll simulate it by updating the isLiberated flag
      if (!evalId.startsWith('eval-')) {
        await supabaseService.updateEvaluation(evalId, { is_liberated: !ev.isLiberated });
      }
      
      setPatient(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          evaluations: prev.evaluations.map(e => e.id === evalId ? { ...e, isLiberated: !e.isLiberated } : e)
        };
      });
    } catch (error) {
      console.error('Error toggling liberation:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!patient) return;
    try {
      await supabaseService.updateProfile(String(patient.id), {
        phone: editForm.phone,
        city: editForm.city,
        target_training: editForm.targetTraining,
        position1: editForm.position1,
        position2: editForm.position2,
        photo: editForm.photo
      });
      
      setPatient({
        ...patient,
        phone: editForm.phone,
        city: editForm.city,
        targetTraining: editForm.targetTraining,
        position1: editForm.position1,
        position2: editForm.position2,
        photo: editForm.photo
      });
      setIsEditingProfile(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Erro ao atualizar perfil.');
    }
  };

  const toggleChartDate = (evalId: string) => {
    setSelectedDates(prev => 
      prev.includes(evalId) ? prev.filter(id => id !== evalId) : [...prev, evalId]
    );
  };

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Prepare Chart Data
  let chartData = visibleEvaluations
    .filter(e => selectedDates.includes(e.id))
    .map(e => {
      let value = 0;
      if (chartMetric === 'weight') value = Number(e.weight.toFixed(1));
      else if (chartMetric === 'imc') value = Number(calcIMC(e.weight, e.height));
      else if (chartMetric === 'bf_pollock7') value = Number(calcPollock7(e.skinfolds, patient.age));
      else if (chartMetric === 'urineColor') value = e.urineColor || 0;
      else if (chartMetric === 'painLevel') value = e.painLevel || 0;
      else {
        const rawValue = (e.specificTests as any)[chartMetric] || 0;
        // Round speed tests to 2 decimals, others to 1 or 0
        value = chartMetric.startsWith('velocidade') || chartMetric === 'arrowhead' || chartMetric === 'sprintBola' 
          ? Number(Number(rawValue).toFixed(2)) 
          : Number(Number(rawValue).toFixed(1));
      }

      return {
        name: new Date(e.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        value: value,
        isGhost: false,
        displayValue: value
      };
    });

  if (chartData.length > 6) {
    chartData = chartData.slice(-6);
  } else if (chartData.length > 0 && chartData.length < 6) {
    const lastValue = chartData[chartData.length - 1].value;
    while (chartData.length < 6) {
      chartData.push({
        name: '-',
        value: lastValue,
        isGhost: true,
        displayValue: ''
      });
    }
  } else if (chartData.length === 0) {
    for (let i = 0; i < 6; i++) {
      chartData.push({ name: '-', value: 10, isGhost: true, displayValue: '' });
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pb-12 transition-colors">
      {/* Header */}
      <header className="bg-slate-900/80 dark:bg-slate-900/80 backdrop-blur-md text-white p-4 sticky top-0 z-20 shadow-lg border-b border-white/10 flex items-center gap-4">
        <button 
          onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg text-sm hover:bg-white/20 transition border border-white/10"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Voltar</span>
        </button>
        <h1 className="font-bold text-lg flex-1 text-center md:text-left drop-shadow-md">Perfil do Atleta</h1>
      </header>

      <main className="p-3 md:p-6 max-w-7xl mx-auto space-y-4">
        
        {/* ALL SECTIONS RENDERED SEQUENTIALLY */}

        {/* 1. PERFIL */}
        <AccordionSection 
          title="Perfil" 
          icon={User} 
          isOpen={openSections.perfil} 
          onToggle={() => toggleSection('perfil')}
          rightAction={
            (isUser || isAdmin) && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (isEditingProfile) handleSaveProfile();
                  else setIsEditingProfile(true);
                }}
                className="flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-[10px] font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                {isEditingProfile ? <Save size={12} /> : <Edit2 size={12} />}
                {isEditingProfile ? 'Salvar' : 'Editar'}
              </button>
            )
          }
        >
            <div className="flex items-center gap-4 mb-6 mt-2">
              <div className="relative group">
                <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center overflow-hidden border-2 border-white dark:border-slate-800 shadow-md">
                  {patient.photo ? (
                    <img src={patient.photo} alt={patient.name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={40} />
                  )}
                </div>
                {isEditingProfile && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={20} />
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setEditForm(prev => ({ ...prev, photo: reader.result as string }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{patient.name}</h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">ID: #{patient.id} • {patient.age} anos</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/50">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Contato</p>
                {isEditingProfile ? (
                  <input 
                    type="text" 
                    value={editForm.phone} 
                    onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-orange-500"
                  />
                ) : (
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{patient.phone}</p>
                )}
                {patient.email && <p className="text-xs text-slate-500 dark:text-slate-400">{patient.email}</p>}
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Localização</p>
                {isEditingProfile ? (
                  <input 
                    type="text" 
                    value={editForm.city} 
                    onChange={e => setEditForm(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-orange-500"
                  />
                ) : (
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{patient.city || 'Não informada'}</p>
                )}
                <p className="text-xs text-slate-500 dark:text-slate-400">Desde {patient.registrationDate ? new Date(patient.registrationDate).toLocaleDateString('pt-BR') : '-'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Esportivo (Objetivo)</p>
                {isEditingProfile ? (
                  <input 
                    type="text" 
                    value={editForm.targetTraining} 
                    onChange={e => setEditForm(prev => ({ ...prev, targetTraining: e.target.value }))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-orange-500"
                  />
                ) : (
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{patient.targetTraining || 'Não informado'}</p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Posições</p>
                {isEditingProfile ? (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Pos 1"
                      value={editForm.position1} 
                      onChange={e => setEditForm(prev => ({ ...prev, position1: e.target.value }))}
                      className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <input 
                      type="text" 
                      placeholder="Pos 2"
                      value={editForm.position2} 
                      onChange={e => setEditForm(prev => ({ ...prev, position2: e.target.value }))}
                      className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                ) : (
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{patient.position1 || '-'} {patient.position2 ? `/ ${patient.position2}` : ''}</p>
                )}
              </div>
            </div>
            
            {isAdmin && (
              <button 
                onClick={() => navigate(`/admin?action=new-eval&athleteId=${patient.id}`)}
                className="w-full mt-6 bg-orange-500 text-white py-3 rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-orange-600 transition shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Nova Avaliação
              </button>
            )}
        </AccordionSection>

        {/* AGENDAMENTOS SECTION */}
        <AccordionSection 
          title="Agendamentos" 
          icon={Calendar} 
          isOpen={openSections.agendamentos} 
          onToggle={() => toggleSection('agendamentos')}
          rightAction={
            isAdmin && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  // Navigate to admin with scheduling pre-filled
                  navigate(`/admin?tab=scheduling&athleteId=${patient.id}`);
                }}
                className="flex items-center gap-1 px-2 py-1 bg-orange-500 text-white rounded-lg text-[10px] font-bold hover:bg-orange-600 transition shadow-sm"
              >
                <Plus size={12} />
                Agendamento
              </button>
            )
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
            {appointments.length === 0 ? (
              <div className="col-span-full py-8 text-center text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                Nenhum agendamento para este atleta.
              </div>
            ) : (
              appointments.map(app => (
                <div key={app.id} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-[10px] text-orange-500 font-bold uppercase tracking-wider">{app.type}</p>
                    <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      app.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      app.status === 'canceled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {app.status === 'confirmed' ? 'Confirmado' : app.status === 'canceled' ? 'Cancelado' : 'Pendente'}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                      <Calendar size={12} />
                      {new Date(app.date).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                      <Timer size={12} />
                      {app.time}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </AccordionSection>

        {/* 2. EVOLUÇÃO */}
        <AccordionSection 
          title="Acompanhamento" 
          icon={BarChart2} 
          isOpen={openSections.acompanhamento} 
          onToggle={() => toggleSection('acompanhamento')}
        >
            <div className="flex flex-col items-center gap-3 mb-4 relative mt-2">
              <div className="w-full flex justify-center">
                <select 
                  value={chartMetric}
                  onChange={(e) => setChartMetric(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-sm font-bold rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-orange-500 text-center"
                >
                  {METRIC_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4 justify-center items-center">
              {visibleEvaluations.slice(showAllDates ? 0 : -6).map(e => (
                <button
                  key={e.id}
                  onClick={() => toggleChartDate(e.id)}
                  className={`px-2 py-1 rounded-full text-[10px] font-bold transition-all ${
                    selectedDates.includes(e.id)
                      ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {new Date(e.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                </button>
              ))}
              {visibleEvaluations.length > 6 && (
                <button 
                  onClick={() => setShowAllDates(!showAllDates)}
                  className="p-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  title={showAllDates ? "Mostrar menos" : "Mostrar datas anteriores"}
                >
                  <MoreHorizontal size={14} />
                </button>
              )}
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10 }} 
                    width={30}
                  />
                  <RechartsTooltip 
                    cursor={{ fill: 'rgba(249, 115, 22, 0.05)' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#0f172a', color: '#fff', fontSize: '12px' }}
                    itemStyle={{ color: '#f97316', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={40}>
                    <LabelList 
                      dataKey="displayValue" 
                      position="top" 
                      fill="#64748b" 
                      fontSize={10}
                      fontWeight="bold"
                      offset={8}
                    />
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.isGhost ? '#e2e8f0' : '#f97316'} 
                        fillOpacity={entry.isGhost ? 0.3 : (index === chartData.filter(d=>!d.isGhost).length - 1 ? 1 : 0.5)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
        </AccordionSection>

            {!selectedEval ? (
              <div className="text-center py-12 text-slate-500">Nenhuma avaliação disponível.</div>
            ) : (
              <>
                {/* 4. AVALIAÇÃO FÍSICA */}
                <AccordionSection 
                  title="Avaliação Física" 
                  icon={Ruler} 
                  isOpen={openSections.avaliacao} 
                  onToggle={() => toggleSection('avaliacao')}
                  rightAction={
                    isAdmin && (
                      <button 
                        onClick={() => toggleLiberation(selectedEval.id, 'physical')}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          selectedEval.isLiberated 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}
                      >
                        {selectedEval.isLiberated ? <Unlock size={10} /> : <Lock size={10} />}
                        {selectedEval.isLiberated ? 'Liberado' : 'Oculto'}
                      </button>
                    )
                  }
                >
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
                    <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                        <div className="flex items-center gap-2">
                          Medidas Básicas
                        </div>
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800 text-center">
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Peso</p>
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{selectedEval.weight.toFixed(1)} <span className="text-[10px] font-normal text-slate-500">kg</span></p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800 text-center">
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Altura</p>
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{Math.round(selectedEval.height)} <span className="text-[10px] font-normal text-slate-500">cm</span></p>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg border border-blue-100 dark:border-blue-900/50 text-center col-span-2">
                          <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase">IMC</p>
                          <p className="text-sm font-bold text-blue-700 dark:text-blue-300">{calcIMC(selectedEval.weight, selectedEval.height)}</p>
                        </div>
                        
                        <div className="col-span-2 mt-2">
                          <select 
                            value={bfEquation}
                            onChange={(e: any) => setBfEquation(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-xs rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-orange-500"
                          >
                            <option value="pollock3">Equação: Pollock 3</option>
                            <option value="pollock7">Equação: Pollock 7</option>
                            <option value="guedes">Equação: Guedes</option>
                          </select>
                        </div>

                        <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg border border-orange-100 dark:border-orange-900/50 text-center col-span-2">
                          <p className="text-[10px] text-orange-600 dark:text-orange-400 font-bold uppercase mb-1">% Gordura</p>
                          <p className="text-sm font-bold text-orange-700 dark:text-orange-500">
                            {bfEquation === 'pollock3' ? calcPollock3(selectedEval.skinfolds, patient.age) : bfEquation === 'pollock7' ? calcPollock7(selectedEval.skinfolds, patient.age) : calcGuedes(selectedEval.skinfolds)}%
                          </p>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900/50 text-center">
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase mb-1">Massa Magra</p>
                          <p className="text-sm font-bold text-emerald-700 dark:text-emerald-500">
                            {(100 - Number(bfEquation === 'pollock3' ? calcPollock3(selectedEval.skinfolds, patient.age) : bfEquation === 'pollock7' ? calcPollock7(selectedEval.skinfolds, patient.age) : calcGuedes(selectedEval.skinfolds))).toFixed(1)}%
                          </p>
                        </div>
                        <div className="bg-cyan-50 dark:bg-cyan-900/20 p-2 rounded-lg border border-cyan-100 dark:border-cyan-900/50 text-center">
                          <p className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold uppercase mb-1">Hidratação</p>
                          <p className="text-sm font-bold text-cyan-700 dark:text-cyan-500">
                            {((100 - Number(bfEquation === 'pollock3' ? calcPollock3(selectedEval.skinfolds, patient.age) : bfEquation === 'pollock7' ? calcPollock7(selectedEval.skinfolds, patient.age) : calcGuedes(selectedEval.skinfolds))) * 0.73).toFixed(1)}%
                          </p>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded-lg border border-purple-100 dark:border-purple-900/50 text-center col-span-2">
                          <p className="text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase mb-1">Massa Óssea (Estimada)</p>
                          <p className="text-sm font-bold text-purple-700 dark:text-purple-500">
                            {(selectedEval.weight * 0.15).toFixed(1)} <span className="text-[10px] font-normal">kg</span>
                          </p>
                        </div>
                      </div>

                      {/* New Section: Coloração da Urina & Nível de Dor */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                        {/* Coloração da Urina */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">Coloração da Urina</p>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-6 h-6 rounded border border-slate-200 dark:border-slate-700 shadow-sm"
                                style={{ backgroundColor: selectedEval.urineColor ? URINE_COLORS[selectedEval.urineColor - 1] : '#e2e8f0' }}
                              ></div>
                              <span className="text-lg font-black text-slate-700 dark:text-slate-200">
                                {selectedEval.urineColor !== undefined ? selectedEval.urineColor : '--'}
                              </span>
                              <span className="text-[10px] text-slate-400">(escala 1-8)</span>
                            </div>
                          </div>
                          {selectedEval.urineColor !== undefined && (
                            <div className="text-right">
                              {selectedEval.urineColor <= 3 && <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Bem hidratado</span>}
                              {selectedEval.urineColor >= 4 && selectedEval.urineColor <= 6 && <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400">Atenção</span>}
                              {selectedEval.urineColor >= 7 && <span className="text-xs font-bold text-red-600 dark:text-red-400">Desidratado</span>}
                            </div>
                          )}
                        </div>

                        {/* Nível de Dor */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">Nível de Dor</p>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-black text-slate-700 dark:text-slate-200">
                                {selectedEval.painLevel !== undefined ? selectedEval.painLevel : '--'}
                              </span>
                              <span className="text-[10px] text-slate-400">(escala 0-10)</span>
                            </div>
                          </div>
                          {selectedEval.painLevel !== undefined && (
                            <div className="flex gap-1">
                              {[...Array(10)].map((_, i) => (
                                <div 
                                  key={i} 
                                  className={`w-2 h-6 rounded-sm ${i < selectedEval.painLevel! ? (
                                    i < 3 ? 'bg-emerald-400' : i < 7 ? 'bg-yellow-400' : 'bg-red-500'
                                  ) : 'bg-slate-200 dark:bg-slate-700'}`}
                                ></div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </section>

                  <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 lg:col-span-2">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span>Antropometria</span>
                        <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">Perímetros (cm)</span>
                      </div>
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {[
                        { label: 'Pescoço', value: selectedEval.measurements.neck },
                        { label: 'Tórax', value: selectedEval.measurements.chest },
                        { label: 'Bíceps', value: selectedEval.measurements.biceps, isLimb: true },
                        { label: 'Antebraço', value: selectedEval.measurements.forearm, isLimb: true },
                        { label: 'Cintura', value: selectedEval.measurements.waist },
                        { label: 'Abdômen', value: selectedEval.measurements.abdomen },
                        { label: 'Quadril', value: selectedEval.measurements.hip },
                        { label: 'Coxa Prox.', value: selectedEval.measurements.proximalThigh, isLimb: true },
                        { label: 'Coxa Med.', value: selectedEval.measurements.medialThigh, isLimb: true },
                        { label: 'Coxa Dist.', value: selectedEval.measurements.distalThigh, isLimb: true },
                        { label: 'Panturrilha', value: selectedEval.measurements.calf, isLimb: true },
                      ].map((item, idx) => (
                        <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800 flex flex-col justify-center text-center">
                          <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">{item.label}</p>
                          {item.isLimb ? (
                            <p className="text-[11px] font-black text-slate-700 dark:text-slate-200">
                              D {Math.round(item.value)} <span className="mx-1 text-slate-300">|</span> E {Math.round(item.value)}
                            </p>
                          ) : (
                            <p className="text-sm font-black text-slate-700 dark:text-slate-200">{Math.round(item.value)}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 lg:col-span-3">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
                      <span>Pregas Cutâneas (mm)</span>
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-2 mb-4">
                      {[
                        { label: 'Tríceps', value: selectedEval.skinfolds.triceps },
                        { label: 'Subescapular', value: selectedEval.skinfolds.subscapular },
                        { label: 'Peitoral', value: selectedEval.skinfolds.chest },
                        { label: 'Axilar Média', value: selectedEval.skinfolds.axillary },
                        { label: 'Supra-ilíaca', value: selectedEval.skinfolds.suprailiac },
                        { label: 'Abdominal', value: selectedEval.skinfolds.abdominal },
                        { label: 'Coxa', value: selectedEval.skinfolds.thigh },
                        { label: 'Panturrilha', value: selectedEval.skinfolds.calf },
                        { label: 'Bíceps', value: selectedEval.skinfolds.biceps },
                        { label: 'Crista Ilíaca', value: selectedEval.skinfolds.iliacCrest },
                      ].map((item, idx) => (
                        <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800 text-center">
                          <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">{item.label}</p>
                          <p className="text-sm font-black text-slate-700 dark:text-slate-200">{item.value !== undefined ? Math.round(item.value) : '--'}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </AccordionSection>

                {/* 5. AVALIAÇÃO ESPECÍFICA */}
                <AccordionSection 
                  title="Avaliação Específica" 
                  icon={Target} 
                  isOpen={openSections.especifica} 
                  onToggle={() => toggleSection('especifica')}
                  rightAction={
                    isAdmin && (
                      <button 
                        onClick={() => toggleLiberation(selectedEval.id, 'specific')}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          selectedEval.isLiberated 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}
                      >
                        {selectedEval.isLiberated ? <Unlock size={10} /> : <Lock size={10} />}
                        {selectedEval.isLiberated ? 'Liberado' : 'Oculto'}
                      </button>
                    )
                  }
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    
                    {/* 1. Velocidade e Aceleração */}
                    <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
                        <span>1. Velocidade e Aceleração</span>
                      </h3>
                      <div className="space-y-2">
                        <TestRow label="Tiros de 10m (s)" value={selectedEval.specificTests.velocidade10m ? Number(selectedEval.specificTests.velocidade10m.toFixed(2)) : undefined} info={TEST_INFO.velocidade10m} isLiberated={selectedEval.isLiberated} />
                        <TestRow label="Tiros de 20m/30m (s)" value={selectedEval.specificTests.velocidade20m ? Number(selectedEval.specificTests.velocidade20m.toFixed(2)) : undefined} info={TEST_INFO.velocidade20m} isLiberated={selectedEval.isLiberated} />
                      </div>
                    </section>

                    {/* 2. Resistência Intermitente */}
                    <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
                        <span>2. Resistência e Potência</span>
                      </h3>
                      <div className="space-y-2">
                        <TestRow label="Yo-Yo Test (m)" value={selectedEval.specificTests.yoyo} info={TEST_INFO.yoyo} isLiberated={selectedEval.isLiberated} />
                        <TestRow label="RAST Test (W/kg)" value={selectedEval.specificTests.rast ? Math.round(selectedEval.specificTests.rast) : undefined} info={TEST_INFO.rast} isLiberated={selectedEval.isLiberated} />
                      </div>
                    </section>

                    {/* 3. Agilidade */}
                    <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
                        <span>3. Agilidade (COD)</span>
                      </h3>
                      <div className="space-y-2">
                        <TestRow label="Aceleração e Velocidade de mudança" value={selectedEval.specificTests.illinois} info={TEST_INFO.illinois} isLiberated={selectedEval.isLiberated} />
                        <TestRow label="Arrowhead Test (s)" value={selectedEval.specificTests.arrowhead ? Number(selectedEval.specificTests.arrowhead.toFixed(2)) : undefined} info={TEST_INFO.arrowhead} isLiberated={selectedEval.isLiberated} />
                      </div>
                    </section>

                    {/* 4. Força Explosiva */}
                    <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
                        <span>4. Força Explosiva</span>
                      </h3>
                      <div className="space-y-2">
                        <TestRow label="Salto CMJ/SJ (cm)" value={selectedEval.specificTests.cmj} info={TEST_INFO.cmj} isLiberated={selectedEval.isLiberated} />
                        <TestRow label="Dinamometria (%)" value={selectedEval.specificTests.dinamometria} info={TEST_INFO.dinamometria} isLiberated={selectedEval.isLiberated} />
                      </div>
                    </section>

                    {/* Parte 2: Com Bola */}
                    <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 md:col-span-2">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
                        <span>Avaliações Técnico-Físicas (Com Bola)</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                        <TestRow label="Sprint com Bola (s)" value={selectedEval.specificTests.sprintBola ? Number(selectedEval.specificTests.sprintBola.toFixed(2)) : undefined} info={TEST_INFO.sprintBola} isLiberated={selectedEval.isLiberated} />
                        <TestRow label="Agilidade com bola (s)" value={selectedEval.specificTests.slalom ? Number(selectedEval.specificTests.slalom.toFixed(2)) : undefined} info={TEST_INFO.slalom} isLiberated={selectedEval.isLiberated} />
                        <TestRow label="LSPT (Pts)" value={selectedEval.specificTests.lspt} info={TEST_INFO.lspt} isLiberated={selectedEval.isLiberated} />
                        <TestRow label="Precisão de passe (rep)" value={selectedEval.specificTests.wallPass} info={TEST_INFO.wallPass} isLiberated={selectedEval.isLiberated} />
                        <TestRow label="Finalização sob Fadiga" value={selectedEval.specificTests.finalizacao} info={TEST_INFO.finalizacao} isLiberated={selectedEval.isLiberated} />
                        <TestRow label="Jogos Reduzidos SSG" value={selectedEval.specificTests.ssg} info={TEST_INFO.ssg} isLiberated={selectedEval.isLiberated} />
                      </div>
                    </section>

                  </div>
                </AccordionSection>
              </>
            )}

        {/* RESUMO COMPLETO */}
        <AccordionSection 
          title="Resumo completo" 
          icon={FileText} 
          isOpen={openSections.tabela} 
          onToggle={() => toggleSection('tabela')}
        >
          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50">
                  <th className="p-3 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800 sticky left-0 bg-slate-50 dark:bg-slate-800 z-10">Data</th>
                  <th className="p-3 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">Peso</th>
                  <th className="p-3 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">% BF</th>
                  <th className="p-3 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">Vel. 10m</th>
                  <th className="p-3 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">Vel. 20m</th>
                  <th className="p-3 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">Yo-Yo</th>
                  <th className="p-3 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">RAST</th>
                  <th className="p-3 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">CMJ</th>
                  <th className="p-3 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">LSPT</th>
                  <th className="p-3 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">SSG</th>
                </tr>
              </thead>
              <tbody>
                {visibleEvaluations.map((e, idx) => (
                  <tr key={e.id} className={`${idx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-800/20'} hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors`}>
                    <td className="p-3 text-xs font-bold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 sticky left-0 bg-inherit z-10">
                      {new Date(e.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-3 text-xs text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">{e.weight.toFixed(1)}kg</td>
                    <td className="p-3 text-xs text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">{calcPollock7(e.skinfolds, patient.age)}%</td>
                    <td className="p-3 text-xs text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">{e.specificTests.velocidade10m?.toFixed(2)}s</td>
                    <td className="p-3 text-xs text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">{e.specificTests.velocidade20m?.toFixed(2)}s</td>
                    <td className="p-3 text-xs text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">{e.yoyo}m</td>
                    <td className="p-3 text-xs text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">{e.specificTests.rast?.toFixed(1)}</td>
                    <td className="p-3 text-xs text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">{e.cmj}cm</td>
                    <td className="p-3 text-xs text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">{e.lspt}</td>
                    <td className="p-3 text-xs text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">{e.ssg}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AccordionSection>

      </main>
    </div>
  );
}

// Helper component for specific test rows
function TestRow({ label, value, info, isLiberated }: { label: string, value?: number, info: string, isLiberated: boolean }) {
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
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-slate-800 text-white text-[10px] rounded-lg z-50 shadow-xl">
                {info}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
              </div>
            )}
          </div>
        )}
      </div>
      <span className="text-sm font-black text-blue-600 dark:text-blue-400">
        {value !== undefined ? value : '--'}
      </span>
    </div>
  );
}
