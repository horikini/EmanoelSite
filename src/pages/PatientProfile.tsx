import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, Activity, Ruler, Timer, Calendar, HelpCircle, Lock, Unlock, Plus, BarChart2, FileText, Target, MessageCircle, MapPin } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

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
  };
  specificTests: SpecificTests;
}

interface Patient {
  id: number;
  name: string;
  phone: string;
  guardianName?: string;
  guardianPhone?: string;
  age: number;
  city: string;
  registrationDate: string;
  trainingType: string;
  position1: string;
  position2: string;
  evaluations: Evaluation[];
}

// --- Mock Data Generator ---
const generateMockEvaluations = (): Evaluation[] => {
  return [
    {
      id: 'eval-0',
      date: '2023-08-10',
      isLiberated: true,
      weight: 71.5,
      height: 178,
      measurements: { neck: 37, chest: 96, biceps: 31, forearm: 27, waist: 84, abdomen: 86, hip: 95, proximalThigh: 55, medialThigh: 51, distalThigh: 43, calf: 37 },
      skinfolds: { triceps: 13, subscapular: 15, chest: 9, axillary: 11, suprailiac: 16, abdominal: 19, thigh: 15 },
      specificTests: { velocidade10m: 1.80, velocidade20m: 3.15, yoyo: 1680, rast: 6.8, illinois: 15.5, arrowhead: 8.6, cmj: 40, dinamometria: 15, sprintBola: 3.6, slalom: 17.0, lspt: 48, wallPass: 20, finalizacao: 7, ssg: 80 }
    },
    {
      id: 'eval-1',
      date: '2023-10-15',
      isLiberated: true,
      weight: 72.5,
      height: 178,
      measurements: { neck: 38, chest: 98, biceps: 32, forearm: 28, waist: 82, abdomen: 84, hip: 96, proximalThigh: 56, medialThigh: 52, distalThigh: 44, calf: 38 },
      skinfolds: { triceps: 12, subscapular: 14, chest: 8, axillary: 10, suprailiac: 15, abdominal: 18, thigh: 14 },
      specificTests: { velocidade10m: 1.75, velocidade20m: 3.10, yoyo: 1800, rast: 6.5, illinois: 15.2, arrowhead: 8.4, cmj: 42, dinamometria: 12, sprintBola: 3.4, slalom: 16.5, lspt: 45, wallPass: 22, finalizacao: 8, ssg: 85 }
    },
    {
      id: 'eval-2',
      date: '2023-12-10',
      isLiberated: true,
      weight: 73.2,
      height: 178,
      measurements: { neck: 38.5, chest: 100, biceps: 33, forearm: 28.5, waist: 81, abdomen: 82, hip: 97, proximalThigh: 57, medialThigh: 53, distalThigh: 45, calf: 38.5 },
      skinfolds: { triceps: 11, subscapular: 13, chest: 7, axillary: 9, suprailiac: 14, abdominal: 16, thigh: 13 },
      specificTests: { velocidade10m: 1.70, velocidade20m: 3.05, yoyo: 1920, rast: 6.2, illinois: 14.9, arrowhead: 8.2, cmj: 44, dinamometria: 10, sprintBola: 3.2, slalom: 15.8, lspt: 42, wallPass: 25, finalizacao: 9, ssg: 88 }
    },
    {
      id: 'eval-3',
      date: '2024-02-20',
      isLiberated: false,
      weight: 74.0,
      height: 178,
      measurements: { neck: 39, chest: 102, biceps: 34, forearm: 29, waist: 80, abdomen: 80, hip: 98, proximalThigh: 58, medialThigh: 54, distalThigh: 46, calf: 39 },
      skinfolds: { triceps: 10, subscapular: 12, chest: 6, axillary: 8, suprailiac: 12, abdominal: 14, thigh: 12 },
      specificTests: { velocidade10m: 1.65, velocidade20m: 2.98, yoyo: 2040, rast: 5.9, illinois: 14.5, arrowhead: 8.0, cmj: 47, dinamometria: 8, sprintBola: 3.0, slalom: 15.2, lspt: 38, wallPass: 28, finalizacao: 10, ssg: 92 }
    }
  ];
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
const TEST_INFO = {
  velocidade10m: "Tiros de 10 metros: Avalia a capacidade de aceleração inicial (arranque).",
  velocidade20m: "Tiros de 20 e 30 metros: Medem a velocidade máxima atingida em distâncias curtas.",
  yoyo: "Yo-Yo Intermittent Recovery Test: Considerado o 'padrão-ouro'. Corridas de 20m ida e volta com bipes progressivos e 10s de recuperação.",
  rast: "RAST: 6 tiros de 35 metros em velocidade máxima com 10s de descanso. Calcula potência anaeróbia e índice de fadiga.",
  illinois: "Teste de Illinois: Circuito com cones envolvendo corridas retas e em zigue-zague.",
  arrowhead: "Arrowhead Agility Test: Simula corridas rápidas em diagonal com cortes bruscos.",
  cmj: "Saltos Verticais (CMJ e SJ): Medem a potência de membros inferiores, essencial para disputas aéreas.",
  dinamometria: "Dinamometria Isocinética: Mede o desequilíbrio de força entre quadríceps e isquiotibiais.",
  sprintBola: "Sprint de 20m ou 30m com bola: Mede o grau de perda de velocidade ao conduzir a bola.",
  slalom: "Teste de Slalom com bola: Avalia a agilidade técnica através da condução em alta velocidade por cones.",
  lspt: "Loughborough Soccer Passing Test (LSPT): Passes contra alvos específicos ditados aleatoriamente.",
  wallPass: "Wall Pass Test: Maior número de passes e domínios limpos contra uma tabela em tempo predeterminado.",
  finalizacao: "Circuito de Finalização Anaeróbico: Pique em alta velocidade, recebe passe e finaliza em até dois toques.",
  ssg: "Jogos Reduzidos (SSG): Mini-jogos com GPS para cruzar dados físicos, técnicos e táticos."
};

const METRIC_OPTIONS = [
  { value: 'weight', label: 'Peso (kg)' },
  { value: 'imc', label: 'IMC' },
  { value: 'bf_pollock3', label: '% Gordura (Pollock 3)' },
  { value: 'bf_pollock7', label: '% Gordura (Pollock 7)' },
  { value: 'bf_guedes', label: '% Gordura (Guedes)' },
  { value: 'velocidade10m', label: 'Velocidade 10m (s)' },
  { value: 'velocidade20m', label: 'Velocidade 20m/30m (s)' },
  { value: 'yoyo', label: 'Yo-Yo Test (m)' },
  { value: 'rast', label: 'RAST (W/kg)' },
  { value: 'illinois', label: 'Illinois (s)' },
  { value: 'arrowhead', label: 'Arrowhead (s)' },
  { value: 'cmj', label: 'Salto CMJ/SJ (cm)' },
  { value: 'dinamometria', label: 'Dinamometria (%)' },
  { value: 'sprintBola', label: 'Sprint c/ Bola (s)' },
  { value: 'slalom', label: 'Slalom c/ Bola (s)' },
  { value: 'lspt', label: 'LSPT (Pts)' },
  { value: 'wallPass', label: 'Wall Pass (Reps)' },
  { value: 'finalizacao', label: 'Finalização' },
  { value: 'ssg', label: 'SSG' }
];

export default function PatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState<'perfil' | 'evolucao' | 'fisica' | 'especifica'>('perfil');
  const [selectedEvalId, setSelectedEvalId] = useState<string>('');
  
  // Chart States
  const [chartMetric, setChartMetric] = useState<string>('weight');
  const [selectedDates, setSelectedDates] = useState<string[]>([]);

  const isAdmin = localStorage.getItem('userRole') === 'admin';

  useEffect(() => {
    const savedRecords = localStorage.getItem('els_records');
    let patientName = 'Atleta Desconhecido';
    let phone = '(00) 00000-0000';
    
    if (savedRecords) {
      const records = JSON.parse(savedRecords);
      const record = records.find((r: any) => r.id === Number(id));
      if (record) {
        patientName = record.user;
        phone = record.phone;
      }
    }

    const evaluations = generateMockEvaluations();
    setPatient({
      id: Number(id),
      name: patientName,
      phone: phone,
      guardianName: 'Responsável Exemplo',
      guardianPhone: '5511988887777',
      age: 22,
      city: 'Barretos - SP',
      registrationDate: '2023-01-15',
      trainingType: 'Força e Potência',
      position1: 'Atacante',
      position2: 'Ponta Direita',
      evaluations: evaluations
    });
    
    if (evaluations.length > 0) {
      setSelectedEvalId(evaluations[evaluations.length - 1].id);
      setSelectedDates(evaluations.slice(-4).map(e => e.id));
    }
  }, [id]);

  if (!patient) return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-500">Carregando...</div>;

  // Filter evaluations for user (only liberated ones) unless admin
  const visibleEvaluations = isAdmin ? patient.evaluations : patient.evaluations.filter(e => e.isLiberated);
  const selectedEval = visibleEvaluations.find(e => e.id === selectedEvalId) || visibleEvaluations[0];

  const toggleLiberation = (evalId: string) => {
    if (!isAdmin) return;
    setPatient(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        evaluations: prev.evaluations.map(e => e.id === evalId ? { ...e, isLiberated: !e.isLiberated } : e)
      };
    });
  };

  const toggleChartDate = (evalId: string) => {
    setSelectedDates(prev => 
      prev.includes(evalId) ? prev.filter(id => id !== evalId) : [...prev, evalId]
    );
  };

  // Prepare Chart Data
  const chartData = visibleEvaluations
    .filter(e => selectedDates.includes(e.id))
    .map(e => {
      let value = 0;
      if (chartMetric === 'weight') value = e.weight;
      else if (chartMetric === 'imc') value = Number(calcIMC(e.weight, e.height));
      else if (chartMetric === 'bf_pollock3') value = Number(calcPollock3(e.skinfolds, patient.age));
      else if (chartMetric === 'bf_pollock7') value = Number(calcPollock7(e.skinfolds, patient.age));
      else if (chartMetric === 'bf_guedes') value = Number(calcGuedes(e.skinfolds));
      else value = (e.specificTests as any)[chartMetric] || 0;

      return {
        name: new Date(e.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }),
        value: value
      };
    });

  const [bfProtocol, setBfProtocol] = useState<'pollock3' | 'pollock7' | 'guedes'>('pollock7');
  const currentBf = selectedEval ? 
    (bfProtocol === 'pollock3' ? calcPollock3(selectedEval.skinfolds, patient.age) :
     bfProtocol === 'pollock7' ? calcPollock7(selectedEval.skinfolds, patient.age) :
     calcGuedes(selectedEval.skinfolds)) : '0.0';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pb-12 transition-colors">
      {/* Header */}
      <header className="bg-slate-900 dark:bg-slate-900 text-white p-4 sticky top-0 z-20 shadow-md flex items-center gap-4">
        <button 
          onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg text-sm hover:bg-slate-700 transition"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Voltar</span>
        </button>
        <h1 className="font-bold text-lg flex-1 text-center md:text-left">Perfil do Atleta</h1>
      </header>

      <main className="p-3 md:p-6 max-w-7xl mx-auto space-y-4">
        
        {/* Tabs Navigation */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
          {[
            { id: 'perfil', label: 'Perfil', icon: User },
            { id: 'evolucao', label: 'Evolução', icon: BarChart2 },
            { id: 'fisica', label: 'Avaliação Física', icon: Activity },
            { id: 'especifica', label: 'Avaliação Específica', icon: Target },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs whitespace-nowrap transition-all ${
                activeTab === tab.id 
                  ? 'bg-orange-500 text-white shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB: PERFIL */}
        {activeTab === 'perfil' && (
          <section className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center">
                  <User size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">{patient.name}</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-[10px]">ID: #{patient.id} • Idade: {patient.age} anos • Cadastrado em: {new Date(patient.registrationDate).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-[10px] font-bold uppercase text-slate-400">% Gordura:</span>
                  <select value={bfProtocol} onChange={e => setBfProtocol(e.target.value as any)} className="text-[10px] p-0.5 rounded bg-slate-50 dark:bg-slate-800 border-none outline-none text-slate-500">
                    <option value="pollock3">Pollock 3</option>
                    <option value="pollock7">Pollock 7</option>
                    <option value="guedes">Guedes</option>
                  </select>
                </div>
                <p className="text-2xl font-black text-orange-500 leading-none">{currentBf}%</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Contato do Atleta</p>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Phone size={12} className="text-slate-400" /> {patient.phone}
                  </p>
                  <button onClick={() => window.open(`https://wa.me/${patient.phone.replace(/\D/g, '')}`, '_blank')} className="bg-green-500 hover:bg-green-600 text-white p-1 rounded-full transition-colors">
                    <MessageCircle size={12} />
                  </button>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Responsável</p>
                <p className="font-medium text-xs text-slate-700 dark:text-slate-300 truncate">{patient.guardianName}</p>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Phone size={10} className="text-slate-400" /> {patient.guardianPhone}
                  </p>
                  <button onClick={() => window.open(`https://wa.me/${patient.guardianPhone?.replace(/\D/g, '')}`, '_blank')} className="bg-green-500 hover:bg-green-600 text-white p-1 rounded-full transition-colors">
                    <MessageCircle size={10} />
                  </button>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Localização</p>
                <p className="font-medium text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <MapPin size={12} className="text-slate-400" /> {patient.city}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Treinamento Alvo</p>
                <p className="font-medium text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Target size={12} className="text-slate-400" /> {patient.trainingType}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800 col-span-2 md:col-span-4 flex items-center gap-2">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Posições:</p>
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] px-2 py-0.5 rounded-full font-bold">{patient.position1}</span>
                {patient.position2 && patient.position2 !== 'Nenhuma' && (
                  <span className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] px-2 py-0.5 rounded-full font-bold">{patient.position2}</span>
                )}
              </div>
              
              {/* Mobile BF% */}
              <div className="sm:hidden col-span-2 bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg border border-orange-100 dark:border-orange-900/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase text-orange-600 dark:text-orange-400">% Gordura:</span>
                  <select value={bfProtocol} onChange={e => setBfProtocol(e.target.value as any)} className="text-[10px] p-0.5 rounded bg-white dark:bg-slate-800 border-none outline-none text-slate-600 dark:text-slate-300">
                    <option value="pollock3">Pollock 3</option>
                    <option value="pollock7">Pollock 7</option>
                    <option value="guedes">Guedes</option>
                  </select>
                </div>
                <p className="text-lg font-black text-orange-600 dark:text-orange-400 leading-none">{currentBf}%</p>
              </div>
            </div>
          </section>
        )}

        {/* TAB: EVOLUÇÃO */}
        {activeTab === 'evolucao' && (
          <section className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
              <h3 className="text-md font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <BarChart2 size={16} className="text-orange-500" />
                Gráfico de Evolução
              </h3>
              <select 
                value={chartMetric}
                onChange={(e) => setChartMetric(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-xs rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-orange-500 w-full md:w-auto"
              >
                {METRIC_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-4">
              {visibleEvaluations.map(e => (
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
            </div>

            <div className="h-64 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                  <RechartsTooltip 
                    cursor={{ fill: 'rgba(249, 115, 22, 0.1)' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: '#1e293b', color: '#f8fafc', fontSize: '12px' }}
                    itemStyle={{ color: '#f97316', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={40}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#f97316' : '#94a3b8'} />
                    ))}
                    <LabelList dataKey="value" position="insideTop" fill="#ffffff" fontSize={10} dy={5} fontWeight="bold" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* TABS: FÍSICA & ESPECÍFICA (Shared Header) */}
        {(activeTab === 'fisica' || activeTab === 'especifica') && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            {/* Date Selector & Admin Controls */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-3 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-3">
              <div className="flex overflow-x-auto hide-scrollbar gap-1.5 w-full md:w-auto">
                {visibleEvaluations.map(e => (
                  <button
                    key={e.id}
                    onClick={() => setSelectedEvalId(e.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                      selectedEvalId === e.id
                        ? 'bg-slate-800 dark:bg-slate-700 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {new Date(e.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                  </button>
                ))}
              </div>

              {isAdmin && selectedEval && (
                <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-slate-100 dark:border-slate-800 pt-3 md:pt-0">
                  <button 
                    onClick={() => toggleLiberation(selectedEval.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      selectedEval.isLiberated 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}
                  >
                    {selectedEval.isLiberated ? <Unlock size={12} /> : <Lock size={12} />}
                    {selectedEval.isLiberated ? 'Liberado' : 'Oculto'}
                  </button>
                  <button className="flex items-center gap-1.5 bg-orange-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-orange-600 transition-all">
                    <Plus size={12} />
                    Nova Avaliação
                  </button>
                </div>
              )}
            </div>

            {!selectedEval ? (
              <div className="text-center py-12 text-slate-500">Nenhuma avaliação disponível.</div>
            ) : (
              <>
                {/* TAB CONTENT: FÍSICA */}
                {activeTab === 'fisica' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <section className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                        <Ruler size={14} className="text-slate-400" />
                        Medidas Básicas
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800 text-center">
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Peso</p>
                          <p className="text-lg font-black text-slate-700 dark:text-slate-200">{selectedEval.weight} <span className="text-[10px] font-normal text-slate-500">kg</span></p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800 text-center">
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Altura</p>
                          <p className="text-lg font-black text-slate-700 dark:text-slate-200">{selectedEval.height} <span className="text-[10px] font-normal text-slate-500">cm</span></p>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg border border-blue-100 dark:border-blue-900/50 text-center col-span-2">
                          <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase">IMC</p>
                          <p className="text-xl font-black text-blue-700 dark:text-blue-300">{calcIMC(selectedEval.weight, selectedEval.height)}</p>
                        </div>
                      </div>
                    </section>

                    <section className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 lg:col-span-2">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">Antropometria (Perímetros em cm)</h3>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {[
                          { label: 'Pescoço', value: selectedEval.measurements.neck },
                          { label: 'Tórax', value: selectedEval.measurements.chest },
                          { label: 'Bíceps', value: selectedEval.measurements.biceps },
                          { label: 'Antebraço', value: selectedEval.measurements.forearm },
                          { label: 'Cintura', value: selectedEval.measurements.waist },
                          { label: 'Abdômen', value: selectedEval.measurements.abdomen },
                          { label: 'Quadril', value: selectedEval.measurements.hip },
                          { label: 'Coxa Prox.', value: selectedEval.measurements.proximalThigh },
                          { label: 'Coxa Med.', value: selectedEval.measurements.medialThigh },
                          { label: 'Coxa Dist.', value: selectedEval.measurements.distalThigh },
                          { label: 'Panturrilha', value: selectedEval.measurements.calf },
                        ].map((item, idx) => (
                          <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-md border border-slate-100 dark:border-slate-800 flex flex-col justify-center items-center text-center">
                            <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase">{item.label}</p>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 lg:col-span-3">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">Pregas Cutâneas (mm)</h3>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
                        {[
                          { label: 'Tríceps', value: selectedEval.skinfolds.triceps },
                          { label: 'Subescapular', value: selectedEval.skinfolds.subscapular },
                          { label: 'Peitoral', value: selectedEval.skinfolds.chest },
                          { label: 'Axilar Média', value: selectedEval.skinfolds.axillary },
                          { label: 'Supra-ilíaca', value: selectedEval.skinfolds.suprailiac },
                          { label: 'Abdominal', value: selectedEval.skinfolds.abdominal },
                          { label: 'Coxa', value: selectedEval.skinfolds.thigh },
                        ].map((item, idx) => (
                          <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800 text-center">
                            <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase mb-0.5">{item.label}</p>
                            <p className="text-sm font-black text-slate-700 dark:text-slate-200">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                )}

                {/* TAB CONTENT: ESPECÍFICA */}
                {activeTab === 'especifica' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* 1. Velocidade e Aceleração */}
                    <section className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">1. Velocidade e Aceleração</h3>
                      <div className="space-y-2">
                        <TestRow label="Tiros de 10m (s)" value={selectedEval.specificTests.velocidade10m} info={TEST_INFO.velocidade10m} isAdmin={isAdmin} />
                        <TestRow label="Tiros de 20m/30m (s)" value={selectedEval.specificTests.velocidade20m} info={TEST_INFO.velocidade20m} isAdmin={isAdmin} />
                      </div>
                    </section>

                    {/* 2. Resistência Intermitente */}
                    <section className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">2. Resistência e Potência</h3>
                      <div className="space-y-2">
                        <TestRow label="Yo-Yo Test (m)" value={selectedEval.specificTests.yoyo} info={TEST_INFO.yoyo} isAdmin={isAdmin} />
                        <TestRow label="RAST Test (W/kg)" value={selectedEval.specificTests.rast} info={TEST_INFO.rast} isAdmin={isAdmin} />
                      </div>
                    </section>

                    {/* 3. Agilidade */}
                    <section className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">3. Agilidade (COD)</h3>
                      <div className="space-y-2">
                        <TestRow label="Teste de Illinois (s)" value={selectedEval.specificTests.illinois} info={TEST_INFO.illinois} isAdmin={isAdmin} />
                        <TestRow label="Arrowhead Test (s)" value={selectedEval.specificTests.arrowhead} info={TEST_INFO.arrowhead} isAdmin={isAdmin} />
                      </div>
                    </section>

                    {/* 4. Força Explosiva */}
                    <section className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">4. Força Explosiva</h3>
                      <div className="space-y-2">
                        <TestRow label="Salto CMJ/SJ (cm)" value={selectedEval.specificTests.cmj} info={TEST_INFO.cmj} isAdmin={isAdmin} />
                        <TestRow label="Dinamometria (%)" value={selectedEval.specificTests.dinamometria} info={TEST_INFO.dinamometria} isAdmin={isAdmin} />
                      </div>
                    </section>

                    {/* Parte 2: Com Bola */}
                    <section className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 md:col-span-2">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">Parte 2: Avaliações Técnico-Físicas (Com Bola)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                        <TestRow label="Sprint com Bola (s)" value={selectedEval.specificTests.sprintBola} info={TEST_INFO.sprintBola} isAdmin={isAdmin} />
                        <TestRow label="Slalom com Bola (s)" value={selectedEval.specificTests.slalom} info={TEST_INFO.slalom} isAdmin={isAdmin} />
                        <TestRow label="LSPT (Pts)" value={selectedEval.specificTests.lspt} info={TEST_INFO.lspt} isAdmin={isAdmin} />
                        <TestRow label="Wall Pass Test (Reps)" value={selectedEval.specificTests.wallPass} info={TEST_INFO.wallPass} isAdmin={isAdmin} />
                        <TestRow label="Finalização sob Fadiga" value={selectedEval.specificTests.finalizacao} info={TEST_INFO.finalizacao} isAdmin={isAdmin} />
                        <TestRow label="Jogos Reduzidos SSG" value={selectedEval.specificTests.ssg} info={TEST_INFO.ssg} isAdmin={isAdmin} />
                      </div>
                    </section>

                  </div>
                )}
              </>
            )}
          </div>
        )}

      </main>
    </div>
  );
}

// Helper component for specific test rows
function TestRow({ label, value, info, isAdmin }: { label: string, value?: number, info: string, isAdmin: boolean }) {
  return (
    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{label}</span>
        {isAdmin && (
          <div className="group relative flex items-center justify-center">
            <HelpCircle size={12} className="text-slate-400 cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 bg-slate-800 text-white text-[10px] rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none shadow-xl">
              {info}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
            </div>
          </div>
        )}
      </div>
      <span className="text-sm font-black text-blue-600 dark:text-blue-400">
        {value !== undefined ? value : '--'}
      </span>
    </div>
  );
}
