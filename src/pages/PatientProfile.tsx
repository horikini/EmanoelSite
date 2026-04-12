import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, Activity, Ruler, Timer, Calendar, HelpCircle, Lock, Unlock, Plus, BarChart2, FileText, Target, ChevronDown, ChevronUp, MoreHorizontal } from 'lucide-react';
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
    calf?: number; biceps?: number; iliacCrest?: number;
  };
  specificTests: SpecificTests;
  urineColor?: number;
  painLevel?: number;
}

interface Patient {
  id: number;
  name: string;
  phone: string;
  email?: string;
  city?: string;
  registrationDate?: string;
  targetTraining?: string;
  position1?: string;
  position2?: string;
  guardianName?: string;
  guardianPhone?: string;
  age: number;
  evaluations: Evaluation[];
}

// --- Mock Data Generator ---
const generateMockEvaluations = (): Evaluation[] => {
  return [
    {
      id: 'eval-1',
      date: '2023-10-15',
      isLiberated: true,
      weight: 72.5,
      height: 178,
      measurements: { neck: 38, chest: 98, biceps: 32, forearm: 28, waist: 82, abdomen: 84, hip: 96, proximalThigh: 56, medialThigh: 52, distalThigh: 44, calf: 38 },
      skinfolds: { triceps: 12, subscapular: 14, chest: 8, axillary: 10, suprailiac: 15, abdominal: 18, thigh: 14, calf: 12, biceps: 6, iliacCrest: 16 },
      specificTests: { velocidade10m: 1.75, velocidade20m: 3.10, yoyo: 1800, rast: 6.5, illinois: 15.2, arrowhead: 8.4, cmj: 42, dinamometria: 12, sprintBola: 3.4, slalom: 16.5, lspt: 45, wallPass: 22, finalizacao: 8, ssg: 85 },
      urineColor: 2,
      painLevel: 1
    },
    {
      id: 'eval-2',
      date: '2023-12-10',
      isLiberated: true,
      weight: 73.2,
      height: 178,
      measurements: { neck: 38.5, chest: 100, biceps: 33, forearm: 28.5, waist: 81, abdomen: 82, hip: 97, proximalThigh: 57, medialThigh: 53, distalThigh: 45, calf: 38.5 },
      skinfolds: { triceps: 11, subscapular: 13, chest: 7, axillary: 9, suprailiac: 14, abdominal: 16, thigh: 13, calf: 11, biceps: 5, iliacCrest: 15 },
      specificTests: { velocidade10m: 1.70, velocidade20m: 3.05, yoyo: 1920, rast: 6.2, illinois: 14.9, arrowhead: 8.2, cmj: 44, dinamometria: 10, sprintBola: 3.2, slalom: 15.8, lspt: 42, wallPass: 25, finalizacao: 9, ssg: 88 },
      urineColor: 4,
      painLevel: 3
    },
    {
      id: 'eval-3',
      date: '2024-02-20',
      isLiberated: false,
      weight: 74.0,
      height: 178,
      measurements: { neck: 39, chest: 102, biceps: 34, forearm: 29, waist: 80, abdomen: 80, hip: 98, proximalThigh: 58, medialThigh: 54, distalThigh: 46, calf: 39 },
      skinfolds: { triceps: 10, subscapular: 12, chest: 6, axillary: 8, suprailiac: 12, abdominal: 14, thigh: 12, calf: 10, biceps: 4, iliacCrest: 13 },
      specificTests: { velocidade10m: 1.65, velocidade20m: 2.98, yoyo: 2040, rast: 5.9, illinois: 14.5, arrowhead: 8.0, cmj: 47, dinamometria: 8, sprintBola: 3.0, slalom: 15.2, lspt: 38, wallPass: 28, finalizacao: 10, ssg: 92 },
      urineColor: 1,
      painLevel: 0
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
  { value: 'bf_pollock7', label: '% Gordura (Pollock 7)' },
  { value: 'urineColor', label: 'Coloração da Urina (1-8)' },
  { value: 'painLevel', label: 'Nível de Dor (0-10)' },
  { value: 'velocidade10m', label: 'Velocidade 10m (s)' },
  { value: 'yoyo', label: 'Yo-Yo Test (m)' },
  { value: 'cmj', label: 'Salto CMJ (cm)' },
];

function AccordionSection({ title, icon: Icon, isOpen, onToggle, children, rightAction }: any) {
  return (
    <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
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
      {isOpen && <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800">{children}</div>}
    </section>
  );
}

export default function PatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [selectedEvalId, setSelectedEvalId] = useState<string>('');
  
  // Chart States
  const [chartMetric, setChartMetric] = useState<string>('weight');
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  
  // UI States
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    perfil: true,
    acompanhamento: true,
    historico: true,
    avaliacao: true,
    especifica: true
  });
  const [bfEquation, setBfEquation] = useState<'pollock3' | 'pollock7' | 'guedes'>('pollock7');
  const [showAllDates, setShowAllDates] = useState(false);

  const isAdmin = localStorage.getItem('userRole') === 'admin';

  useEffect(() => {
    const savedRecords = localStorage.getItem('els_records');
    let patientName = 'Atleta Desconhecido';
    let phone = '(00) 00000-0000';
    let email = '';
    let city = '';
    let registrationDate = '';
    let targetTraining = '';
    let position1 = '';
    let position2 = '';
    
    if (savedRecords) {
      const records = JSON.parse(savedRecords);
      const record = records.find((r: any) => r.id === Number(id));
      if (record) {
        patientName = record.user;
        phone = record.phone;
        email = record.email || '';
        city = record.city || '';
        registrationDate = record.registrationDate || '';
        targetTraining = record.targetTraining || '';
        position1 = record.position1 || '';
        position2 = record.position2 || '';
      }
    }

    const evaluations = generateMockEvaluations();
    setPatient({
      id: Number(id),
      name: patientName,
      phone: phone,
      email: email,
      city: city,
      registrationDate: registrationDate,
      targetTraining: targetTraining,
      position1: position1,
      position2: position2,
      guardianName: 'Responsável Exemplo',
      guardianPhone: '5511988887777',
      age: 22,
      evaluations: evaluations
    });
    
    if (evaluations.length > 0) {
      setSelectedEvalId(evaluations[evaluations.length - 1].id);
      setSelectedDates(evaluations.map(e => e.id));
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

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Prepare Chart Data
  let chartData = visibleEvaluations
    .filter(e => selectedDates.includes(e.id))
    .map(e => {
      let value = 0;
      if (chartMetric === 'weight') value = e.weight;
      else if (chartMetric === 'imc') value = Number(calcIMC(e.weight, e.height));
      else if (chartMetric === 'bf_pollock7') value = Number(calcPollock7(e.skinfolds, patient.age));
      else if (chartMetric === 'urineColor') value = e.urineColor || 0;
      else if (chartMetric === 'painLevel') value = e.painLevel || 0;
      else value = (e.specificTests as any)[chartMetric] || 0;

      return {
        name: new Date(e.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }),
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
        
        {/* ALL SECTIONS RENDERED SEQUENTIALLY */}

        {/* 1. PERFIL */}
        <AccordionSection 
          title="1. Perfil" 
          icon={User} 
          isOpen={openSections.perfil} 
          onToggle={() => toggleSection('perfil')}
        >
            <div className="flex items-center gap-3 mb-4 mt-2">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center">
                <User size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">{patient.name}</h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs">ID: #{patient.id} • Idade: {patient.age} anos</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-x-8 gap-y-4 bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800/50">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Contato</p>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{patient.phone}</p>
                {patient.email && <p className="text-xs text-slate-500 dark:text-slate-400">{patient.email}</p>}
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Responsável</p>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{patient.guardianName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{patient.guardianPhone}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Localização</p>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{patient.city || 'Não informada'}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Desde {patient.registrationDate ? new Date(patient.registrationDate).toLocaleDateString('pt-BR') : '-'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Esportivo</p>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{patient.targetTraining || 'Não informado'}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{patient.position1 || '-'} {patient.position2 ? `/ ${patient.position2}` : ''}</p>
              </div>
            </div>
        </AccordionSection>

        {/* 2. EVOLUÇÃO */}
        <AccordionSection 
          title="2. Acompanhamento" 
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
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={false} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                    label={{ value: METRIC_OPTIONS.find(m => m.value === chartMetric)?.label, angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 12, offset: -10 }}
                  />
                  <RechartsTooltip 
                    cursor={{ fill: 'rgba(249, 115, 22, 0.1)' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#1e293b', color: '#fff' }}
                    formatter={(value: any, name: any, props: any) => {
                      if (props?.payload?.isGhost) return ['Sem dados', ''];
                      return [value, METRIC_OPTIONS.find(m => m.value === chartMetric)?.label];
                    }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60}>
                    <LabelList dataKey="displayValue" position="insideBottom" fill="#fff" fontSize={12} fontWeight="bold" />
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.isGhost ? 'rgba(148, 163, 184, 0.2)' : (index === chartData.filter(d=>!d.isGhost).length - 1 ? '#f97316' : '#94a3b8')} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
        </AccordionSection>

        {/* 3. BOX DE DATAS (HISTÓRICO) */}
        <AccordionSection 
          title="3. Histórico de Avaliações" 
          icon={Calendar} 
          isOpen={openSections.historico} 
          onToggle={() => toggleSection('historico')}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 mt-2">
              <div className="flex overflow-x-auto hide-scrollbar gap-2 w-full md:w-auto">
                {visibleEvaluations.map(e => (
                  <button
                    key={e.id}
                    onClick={() => setSelectedEvalId(e.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      selectedEvalId === e.id
                        ? 'bg-slate-800 dark:bg-slate-700 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {new Date(e.date).toLocaleDateString('pt-BR')}
                  </button>
                ))}
              </div>

              {isAdmin && selectedEval && (
                <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-slate-100 dark:border-slate-800 pt-3 md:pt-0">
                  <button 
                    onClick={() => toggleLiberation(selectedEval.id)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedEval.isLiberated 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}
                  >
                    {selectedEval.isLiberated ? <Unlock size={14} /> : <Lock size={14} />}
                    {selectedEval.isLiberated ? 'Liberado p/ Atleta' : 'Oculto p/ Atleta'}
                  </button>
                  <button className="flex items-center gap-1 bg-orange-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-orange-600 transition-all">
                    <Plus size={14} />
                    Nova Avaliação
                  </button>
                </div>
              )}
            </div>
        </AccordionSection>

            {!selectedEval ? (
              <div className="text-center py-12 text-slate-500">Nenhuma avaliação disponível.</div>
            ) : (
              <>
                {/* 4. AVALIAÇÃO FÍSICA */}
                <AccordionSection 
                  title="4. Avaliação Física" 
                  icon={Ruler} 
                  isOpen={openSections.avaliacao} 
                  onToggle={() => toggleSection('avaliacao')}
                  rightAction={
                    isAdmin && (
                      <button 
                        onClick={() => toggleLiberation(selectedEval.id)}
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
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{selectedEval.weight} <span className="text-[10px] font-normal text-slate-500">kg</span></p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800 text-center">
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Altura</p>
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{selectedEval.height} <span className="text-[10px] font-normal text-slate-500">cm</span></p>
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
                      {isAdmin && (
                        <button 
                          onClick={() => toggleLiberation(selectedEval.id)}
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                            selectedEval.isLiberated 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          }`}
                        >
                          {selectedEval.isLiberated ? <Unlock size={10} /> : <Lock size={10} />}
                          {selectedEval.isLiberated ? 'Liberado' : 'Oculto'}
                        </button>
                      )}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
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
                        <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800 flex flex-col justify-center">
                          <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase">{item.label}</p>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 lg:col-span-3">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
                      <span>Pregas Cutâneas (mm)</span>
                      {isAdmin && (
                        <button 
                          onClick={() => toggleLiberation(selectedEval.id)}
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                            selectedEval.isLiberated 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          }`}
                        >
                          {selectedEval.isLiberated ? <Unlock size={10} /> : <Lock size={10} />}
                          {selectedEval.isLiberated ? 'Liberado' : 'Oculto'}
                        </button>
                      )}
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
                          <p className="text-sm font-black text-slate-700 dark:text-slate-200">{item.value !== undefined ? item.value : '--'}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </AccordionSection>

                {/* 5. AVALIAÇÃO ESPECÍFICA */}
                <AccordionSection 
                  title="5. Avaliação Específica" 
                  icon={Target} 
                  isOpen={openSections.especifica} 
                  onToggle={() => toggleSection('especifica')}
                  rightAction={
                    isAdmin && (
                      <button 
                        onClick={() => toggleLiberation(selectedEval.id)}
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
                        <TestRow label="Tiros de 10m (s)" value={selectedEval.specificTests.velocidade10m} info={TEST_INFO.velocidade10m} isAdmin={isAdmin} />
                        <TestRow label="Tiros de 20m/30m (s)" value={selectedEval.specificTests.velocidade20m} info={TEST_INFO.velocidade20m} isAdmin={isAdmin} />
                      </div>
                    </section>

                    {/* 2. Resistência Intermitente */}
                    <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
                        <span>2. Resistência e Potência</span>
                      </h3>
                      <div className="space-y-2">
                        <TestRow label="Yo-Yo Test (m)" value={selectedEval.specificTests.yoyo} info={TEST_INFO.yoyo} isAdmin={isAdmin} />
                        <TestRow label="RAST Test (W/kg)" value={selectedEval.specificTests.rast} info={TEST_INFO.rast} isAdmin={isAdmin} />
                      </div>
                    </section>

                    {/* 3. Agilidade */}
                    <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
                        <span>3. Agilidade (COD)</span>
                      </h3>
                      <div className="space-y-2">
                        <TestRow label="Teste de Illinois (s)" value={selectedEval.specificTests.illinois} info={TEST_INFO.illinois} isAdmin={isAdmin} />
                        <TestRow label="Arrowhead Test (s)" value={selectedEval.specificTests.arrowhead} info={TEST_INFO.arrowhead} isAdmin={isAdmin} />
                      </div>
                    </section>

                    {/* 4. Força Explosiva */}
                    <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
                        <span>4. Força Explosiva</span>
                      </h3>
                      <div className="space-y-2">
                        <TestRow label="Salto CMJ/SJ (cm)" value={selectedEval.specificTests.cmj} info={TEST_INFO.cmj} isAdmin={isAdmin} />
                        <TestRow label="Dinamometria (%)" value={selectedEval.specificTests.dinamometria} info={TEST_INFO.dinamometria} isAdmin={isAdmin} />
                      </div>
                    </section>

                    {/* Parte 2: Com Bola */}
                    <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 md:col-span-2">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
                        <span>Avaliações Técnico-Físicas (Com Bola)</span>
                      </h3>
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
                </AccordionSection>
              </>
            )}

      </main>
    </div>
  );
}

// Helper component for specific test rows
function TestRow({ label, value, info, isAdmin }: { label: string, value?: number, info: string, isAdmin: boolean }) {
  return (
    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{label}</span>
        {isAdmin && (
          <div className="group relative flex items-center justify-center">
            <HelpCircle size={12} className="text-slate-400 cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-slate-800 text-white text-[10px] rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none shadow-xl">
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
