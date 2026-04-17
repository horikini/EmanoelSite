import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, MessageCircle, Search, Filter, AlertTriangle, CheckCircle, Activity, User, Plus, X, Calendar as CalendarIcon, Clock, Check, Bell, Ruler, ArrowLeft, ChevronLeft, ChevronRight, Eye, MessageSquare, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeToggle } from '../components/ThemeToggle';
import Select from 'react-select';

type AthleticRecord = {
  id: string | number;
  date: string;
  user: string;
  phone: string;
  email?: string;
  dob?: string;
  city?: string;
  registrationDate?: string;
  targetTraining?: string;
  position1?: string;
  position2?: string;
  pain: number;
  fatigue: number;
  hydration: string;
  status: string;
  pain_location?: string;
};

type Appointment = {
  id: string;
  athleteId: string | number;
  athleteName: string;
  date: string;
  time: string;
  type: string;
  status: 'pending' | 'confirmed' | 'canceled';
  createdAt: string;
};

import { supabase } from '../lib/supabase';
import { supabaseService } from '../lib/supabaseService';

const STATUS_OPTIONS = [
  { label: 'Pendente', color: 'bg-slate-100 text-slate-600' },
  { label: 'Bom', color: 'bg-green-100 text-green-700' },
  { label: 'Médio', color: 'bg-yellow-100 text-yellow-700' },
  { label: 'Ruim', color: 'bg-red-100 text-red-700' },
  { label: 'Precisamos conversar', color: 'bg-orange-100 text-orange-700' },
  { label: 'Continue assim', color: 'bg-blue-100 text-blue-700' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem('userRole') === 'admin';
  const [records, setRecords] = useState<AthleticRecord[]>([]);
  const [allAthletes, setAllAthletes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'monitoring' | 'scheduling' | 'athletes' | 'messages'>('monitoring');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  
  // Messages Tab State
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const [accessLogs, setAccessLogs] = useState<any[]>([]);
  const [newMessageRecado, setNewMessageRecado] = useState<{
    recipients: string[];
    sendToAll: boolean;
    frequency: string;
    text: string;
  }>({
    recipients: [],
    sendToAll: true,
    frequency: 'once', 
    text: ''
  });

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{title: string, message: string, onConfirm: () => void} | null>(null);
  const [newAppointment, setNewAppointment] = useState({ 
    athleteId: '' as string | number, 
    date: new Date().toLocaleDateString('sv-SE'), 
    time: '', 
    type: 'Avaliação Física',
    isWeekly: false,
    weeksCount: 4,
    selectedDays: [new Date().getDay().toString()]
  });
  const [newAthlete, setNewAthlete] = useState({ name: '', dob: '', email: '', phone: '', city: '', targetTraining: '', position1: '', position2: '' });
  const [pendingAthletes, setPendingAthletes] = useState<any[]>([]);
  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);
  const [adminProfile, setAdminProfile] = useState<any>(null);
  const [isAdminProfileModalOpen, setIsAdminProfileModalOpen] = useState(false);
  const [adminEditForm, setAdminEditForm] = useState({ full_name: '', photo: '' });

  // Calendar State
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedDayContext, setSelectedDayContext] = useState<Date | null>(new Date());
  
  // WhatsApp notification State
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [scheduledSummary, setScheduledSummary] = useState<any>(null);
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role !== 'admin') {
      navigate('/login');
      return;
    }

    const loadData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        let adminProf = null;
        if (userId) {
          adminProf = await supabaseService.getProfile(userId);
          setAdminProfile(adminProf);
          setAdminEditForm({ full_name: adminProf.full_name || 'Admin', photo: adminProf.photo || '' });
        }

        const [profiles, monitoring, apps, messagesData, logsData] = await Promise.all([
          supabaseService.getProfiles(),
          supabaseService.getMonitoringRecords(),
          supabaseService.getAppointments(),
          supabaseService.getAllMessages(),
          supabaseService.getAllAccessLogs()
        ]);

        if (messagesData) setAllMessages(messagesData);
        if (logsData) setAccessLogs(logsData);

        if (profiles && monitoring) {
          const athletes = profiles.filter(p => p.role === 'athlete' || p.role === 'user');
          setAllAthletes(athletes);
          
          const pending = profiles.filter(p => p.status === 'pending');
          setPendingAthletes(pending);

          const mappedRecords = monitoring.map(m => {
            const profile = profiles.find(p => p.id === m.athlete_id);
            return {
              id: profile?.id || m.athlete_id,
              date: m.date,
              user: profile?.full_name || 'Desconhecido',
              phone: profile?.phone || '',
              email: profile?.email,
              dob: profile?.dob,
              city: profile?.city,
              registrationDate: profile?.registration_date,
              targetTraining: profile?.target_training,
              position1: profile?.position1,
              position2: profile?.position2,
              pain: m.pain,
              fatigue: m.fatigue,
              hydration: m.hydration,
              status: m.status,
              pain_location: m.pain_location
            };
          });
          setRecords(mappedRecords);
        }

        if (apps) {
          setAppointments(apps.map(a => ({
            id: a.id || Math.random().toString(),
            athleteId: a.athlete_id,
            athleteName: a.profiles?.full_name || 'Desconhecido',
            date: a.date,
            time: a.time,
            type: a.type,
            status: a.status as any,
            createdAt: a.date
          })));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [navigate]);

  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
  const [evaluationType, setEvaluationType] = useState<'physical' | 'specific' | null>(null);
  const [selectedAthleteForEval, setSelectedAthleteForEval] = useState<any>(null);
  const [evalForm, setEvalForm] = useState<any>({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    height: '',
    measurements: {
      neck: '', chest: '', biceps: '', forearm: '',
      waist: '', abdomen: '', hip: '',
      proximalThigh: '', medialThigh: '', distalThigh: '', calf: ''
    },
    skinfolds: {
      triceps: '', subscapular: '', chest: '', axillary: '',
      suprailiac: '', abdominal: '', thigh: '',
      calf: '', biceps: '', iliacCrest: ''
    },
    specificTests: {
      velocidade10m: '', velocidade20m: '', yoyo: '', rast: '',
      illinois: '', arrowhead: '', cmj: '', dinamometria: '',
      sprintBola: '', slalom: '', lspt: '', wallPass: '',
      finalizacao: '', ssg: ''
    }
  });

  const handleOpenEvalModal = (athlete: any) => {
    setSelectedAthleteForEval(athlete);
    setEvalForm({
      ...evalForm,
      height: athlete.height || '',
      date: new Date().toISOString().split('T')[0]
    });
    setIsEvaluationModalOpen(true);
    setEvaluationType(null);
  };

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

  const handleSaveEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAthleteForEval) return;

    try {
      // Logic for copying left to right if one is empty (simplified for this structure)
      // In a real anthropometry form, you'd have left/right fields. 
      // Here we have single fields, but we can apply the logic if we split them.
      
      const dataToSave = {
        ...evalForm,
        weight: parseFloat(evalForm.weight),
        height: parseFloat(evalForm.height),
        measurements: Object.fromEntries(Object.entries(evalForm.measurements).map(([k, v]) => [k, parseFloat(v as string) || 0])),
        skinfolds: Object.fromEntries(Object.entries(evalForm.skinfolds).map(([k, v]) => [k, parseFloat(v as string) || 0])),
        specificTests: Object.fromEntries(Object.entries(evalForm.specificTests).map(([k, v]) => [k, parseFloat(v as string) || 0])),
        isLiberated: false
      };

      await supabaseService.addEvaluation(selectedAthleteForEval.id, dataToSave);
      
      setIsEvaluationModalOpen(false);
      setEvaluationType(null);
      alert('Avaliação salva com sucesso!');
    } catch (error) {
      console.error('Error saving evaluation:', error);
      alert('Erro ao salvar avaliação.');
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreatingAppointment) return;

    const athlete = allAthletes.find(a => String(a.id) === String(newAppointment.athleteId));
    if (!athlete) return;

    setIsCreatingAppointment(true);
    const iterations = newAppointment.isWeekly ? newAppointment.weeksCount : 1;
    const daysToSchedule = newAppointment.isWeekly ? newAppointment.selectedDays : [new Date(newAppointment.date + 'T12:00:00').getDay().toString()];

    try {
      for (const dayStr of daysToSchedule) {
        const day = parseInt(dayStr);
        const baseDate = new Date(newAppointment.date + 'T00:00:00');
        
        if (newAppointment.isWeekly) {
          const currentDay = baseDate.getDay();
          let diff = day - currentDay;
          if (diff < 0) diff += 7;
          baseDate.setDate(baseDate.getDate() + diff);
        }

        for (let i = 0; i < iterations; i++) {
          const currentDate = new Date(baseDate);
          currentDate.setDate(baseDate.getDate() + (i * 7));
          
          await supabaseService.addAppointment({
            athlete_id: String(athlete.id),
            date: currentDate.toISOString().split('T')[0],
            time: newAppointment.time,
            type: newAppointment.type,
            status: 'pending'
          });
        }
      }
      
      // Reload appointments
      const apps = await supabaseService.getAppointments();
      setAppointments(apps.map(a => ({
        id: a.id || Math.random().toString(),
        athleteId: a.athlete_id,
        athleteName: a.profiles?.full_name || 'Desconhecido',
        date: a.date,
        time: a.time,
        type: a.type,
        status: a.status as any,
        createdAt: a.date
      })));
      
      // Set up summary for WhatsApp
      let summaryText = '';
      if (!newAppointment.isWeekly) {
         summaryText = `agendamento para a data ${new Date(newAppointment.date + 'T12:00:00').toLocaleDateString('pt-BR')} e horario ${newAppointment.time}`;
      } else {
         const daysMap: any = { '1': 'Seg', '2': 'Ter', '3': 'Qua', '4': 'Qui', '5': 'Sex', '6': 'Sáb', '0': 'Dom' };
         const dayNames = newAppointment.selectedDays.map((d: string) => daysMap[d]).join(', ');
         summaryText = `agendamento para as datas (${dayNames}) e horario ${newAppointment.time} durante as proximas ${newAppointment.weeksCount} semanas`;
      }
      
      setScheduledSummary({
        athleteName: athlete.full_name,
        athletePhone: athlete.phone,
        summaryText
      });
      
      setIsAppointmentModalOpen(false);
      setIsWhatsAppModalOpen(true);

      setNewAppointment({ 
        athleteId: '', 
        date: new Date().toLocaleDateString('sv-SE'), 
        time: '', 
        type: 'Avaliação Física',
        isWeekly: false,
        weeksCount: 4,
        selectedDays: [new Date().getDay().toString()]
      });
    } catch (error) {
      console.error('Error creating appointments:', error);
      alert('Erro ao criar agendamentos.');
    } finally {
      setIsCreatingAppointment(false);
    }
  };

  const deleteAppointment = async (id: string) => {
    setConfirmAction({
      title: "Excluir Agendamento",
      message: "Deseja realmente excluir este agendamento?",
      onConfirm: async () => {
        try {
          await supabase.from('appointments').delete().eq('id', id);
          setAppointments(appointments.filter(a => a.id !== id));
        } catch (error) {
          console.error('Error deleting appointment:', error);
        }
      }
    });
    setIsConfirmModalOpen(true);
  };

  const confirmAppointment = async (id: string) => {
    try {
      await supabaseService.updateAppointmentStatus(id, 'confirmed');
      setAppointments(appointments.map(a => a.id === id ? { ...a, status: 'confirmed' } : a));
    } catch (error) {
      console.error('Error confirming appointment:', error);
    }
  };

  const sendAppointmentWhatsApp = (app: Appointment) => {
    const athlete = records.find(r => r.id === app.athleteId);
    if (!athlete) return;
    const dateStr = new Date(app.date).toLocaleDateString('pt-BR');
    const text = encodeURIComponent(`Olá, ${app.athleteName}, o seu agendamento está marcado para ${dateStr} às ${app.time}, favor confirmar, até mais! abraços`);
    window.open(`https://wa.me/${athlete.phone}?text=${text}`, '_blank');
  };

  const handleSaveAdminProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;
      
      await supabaseService.updateProfile(userId, {
        full_name: adminEditForm.full_name,
        photo: adminEditForm.photo
      });
      
      setAdminProfile({ ...adminProfile, ...adminEditForm });
      setIsAdminProfileModalOpen(false);
      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating admin profile:', error);
      alert('Erro ao atualizar perfil.');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    navigate('/');
  };

  const updateStatus = async (id: string | number, newStatus: string) => {
    try {
      const updated = records.map(r => r.id === id ? { ...r, status: newStatus } : r);
      setRecords(updated);
      // In a full implementation, we'd update the specific monitoring record in Supabase
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const openWhatsApp = (phone: string, name: string) => {
    const text = encodeURIComponent(`Olá ${name}, vi seu relatório.`);
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAthlete.name || !newAthlete.email || !newAthlete.phone) {
      alert('Nome, email e telefone são obrigatórios.');
      return;
    }

    setConfirmAction({
      title: "Confirmar Cadastro",
      message: `Deseja realmente cadastrar o atleta ${newAthlete.name}?`,
      onConfirm: async () => {
        try {
          // Chama a Serverless Function da Vercel
          const response = await fetch('/api/criar-atleta', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: newAthlete.name,
              email: newAthlete.email,
              phone: newAthlete.phone,
            }),
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || 'Erro ao criar atleta');
          }

          alert('Atleta criado com sucesso! A senha provisória é o telefone (apenas números).');
          setIsModalOpen(false);
          setNewAthlete({ name: '', dob: '', email: '', phone: '', city: '', targetTraining: '', position1: '', position2: '' });
          
          // Recarrega a lista
          const profiles = await supabaseService.getProfiles();
          if (profiles) {
            const pending = profiles.filter(p => p.status === 'pending');
            setPendingAthletes(pending);
          }
        } catch (error: any) {
          console.error('Erro ao adicionar atleta:', error);
          if (error.message === 'Failed to fetch') {
             alert('Aviso de Rede (Failed to fetch): O servidor falhou ao processar a requisição. Verifique as configurações de URL/Chave do Supabase.');
          } else {
             alert(`Erro: ${error.message}`);
          }
        }
      }
    });
    setIsConfirmModalOpen(true);
  };

  const handleApproveAthlete = async (id: string) => {
    const athlete = pendingAthletes.find(a => a.id === id);
    setConfirmAction({
      title: "Aprovar Atleta",
      message: `Deseja realmente aprovar o atleta ${athlete?.full_name}?`,
      onConfirm: async () => {
        try {
          await supabaseService.updateProfile(id, { status: 'active' });
          setPendingAthletes(pendingAthletes.filter(a => a.id !== id));
          alert('Atleta aprovado com sucesso!');
        } catch (error) {
          console.error('Error approving athlete:', error);
          alert('Erro ao aprovar atleta.');
        }
      }
    });
    setIsConfirmModalOpen(true);
  };

  const filteredRecords = records.filter(r => 
    r.user.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredAthletes = allAthletes.filter(a => 
    a.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderCalendar = () => {
    const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
    const firstDay = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay();
    const days = [];
    
    // Previous month blanks
    for (let i = 0; i < firstDay; i++) {
       days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
       const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
       const isSelected = selectedDayContext && date.toDateString() === selectedDayContext.toDateString();
       
       // Compare ignoring time zones
       const hasAppointments = appointments.some(a => {
         const dateParts = a.date.split('-');
         if (dateParts.length !== 3) return false;
         const appDate = new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2]));
         return appDate.toDateString() === date.toDateString();
       });
       
       days.push(
         <button 
           key={day}
           onClick={() => setSelectedDayContext(date)}
           className={`p-2 w-10 h-10 rounded-full flex mx-auto items-center justify-center text-sm font-medium transition-all ${
             isSelected ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 
             'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
           } relative`}
         >
           {day}
           {hasAppointments && !isSelected && (
             <div className="absolute bottom-1 w-1 h-1 bg-orange-500 rounded-full"></div>
           )}
         </button>
       );
    }
    
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 mb-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
           <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() -1, 1))} className="p-2 text-slate-500 hover:text-orange-500 bg-slate-100 dark:bg-slate-800 rounded-lg transition"><ChevronLeft size={20} /></button>
           <div className="font-bold text-slate-800 dark:text-white capitalize">
             {calendarMonth.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
           </div>
           <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() +1, 1))} className="p-2 text-slate-500 hover:text-orange-500 bg-slate-100 dark:bg-slate-800 rounded-lg transition"><ChevronRight size={20} /></button>
        </div>
        <div className="grid grid-cols-7 text-center mb-2">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
            <div key={d} className="text-[10px] font-bold text-slate-400 uppercase">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-2">
          {days}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors">
      {/* Header */}
      <header className="bg-slate-900/80 dark:bg-slate-900/80 backdrop-blur-md text-white p-2 sm:p-3 sticky top-0 z-20 shadow-md flex justify-between items-center border-b border-white/10 h-12 sm:h-14">
        <div className="flex items-center gap-2">
          <div 
            className="flex items-center gap-2 sm:gap-3 cursor-pointer hover:bg-white/10 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl transition-all border border-white/5 bg-white/5 backdrop-blur-xl shadow-inner"
            onClick={() => setIsAdminProfileModalOpen(true)}
          >
            {adminProfile?.photo ? (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border-2 border-orange-500/50 shadow-lg shadow-orange-500/20 shrink-0">
                <img src={adminProfile.photo} alt="Admin" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700 shrink-0">
                <User size={14} className="sm:w-4 sm:h-4" />
              </div>
            )}
            <div>
              <h1 className="font-black text-[11px] sm:text-xs tracking-tight leading-none">{adminProfile?.full_name || 'Admin'}</h1>
              <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Administrador</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3">
          <button 
            onClick={() => setIsPendingModalOpen(true)}
            className="relative p-1.5 sm:p-2 text-slate-300 hover:text-white transition-colors"
          >
            <Bell size={16} className="sm:w-5 sm:h-5" />
            {pendingAthletes.length > 0 && (
              <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full">
                {pendingAthletes.length}
              </span>
            )}
          </button>
          <ThemeToggle />
          <button onClick={handleLogout} className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 bg-slate-800 rounded-lg text-sm hover:bg-slate-700 transition">
            <LogOut size={16} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      <main className="p-3 md:p-8 max-w-7xl mx-auto">
        {/* Tabs */}
        <div className="grid grid-cols-3 gap-1 mb-8 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-2xl w-full sm:w-fit sm:flex sm:items-center">
          <button 
            onClick={() => setActiveTab('monitoring')}
            className={`px-1 py-3 rounded-xl text-[10px] sm:text-xs sm:px-4 font-black transition-all text-center uppercase tracking-tighter sm:tracking-normal ${activeTab === 'monitoring' ? 'bg-white dark:bg-slate-800 text-orange-500 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            <span className="sm:hidden">Monitora</span>
            <span className="hidden sm:inline">Monitoramento</span>
          </button>
          <button 
            onClick={() => setActiveTab('scheduling')}
            className={`px-1 py-3 rounded-xl text-[10px] sm:text-xs sm:px-4 font-black transition-all text-center uppercase tracking-tighter sm:tracking-normal ${activeTab === 'scheduling' ? 'bg-white dark:bg-slate-800 text-orange-500 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            <span className="sm:hidden">Agenda</span>
            <span className="hidden sm:inline">Agendamento</span>
          </button>
          <button 
            onClick={() => setActiveTab('messages')}
            className={`px-1 py-3 rounded-xl text-[10px] sm:text-xs sm:px-4 font-black transition-all flex items-center justify-center gap-1 uppercase tracking-tighter sm:tracking-normal ${activeTab === 'messages' ? 'bg-white dark:bg-slate-800 text-orange-500 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            Recados
          </button>
        </div>

        {activeTab === 'monitoring' && (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">Monitoramento</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Acompanhe o bem-estar dos atletas</p>
              </div>
              
              <div className="flex w-full md:w-auto gap-2">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Buscar atleta..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-xs"
                  />
                </div>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-1.5 bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-orange-600 transition shrink-0 shadow-sm"
                >
                  <Plus size={16} />
                  <span className="hidden sm:inline">Cadastrar</span>
                </button>
              </div>
            </div>

            <div className="flex flex-row flex-wrap gap-3 mb-6">
              <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3 flex-1 min-w-[100px]">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center shrink-0">
                  <Activity size={12} />
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium uppercase leading-none mb-1">Total</p>
                  <p className="text-base font-bold text-slate-800 dark:text-white leading-none">{records.length}</p>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3 flex-1 min-w-[100px]">
                <div className="w-6 h-6 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center shrink-0">
                  <AlertTriangle size={12} />
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium uppercase leading-none mb-1">Atenção</p>
                  <p className="text-base font-bold text-slate-800 dark:text-white leading-none">
                    {records.filter(r => r.pain >= 7 || r.fatigue >= 7 || parseInt(r.hydration) >= 6).length}
                  </p>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3 flex-1 min-w-[100px]">
                <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center shrink-0">
                  <CheckCircle size={12} />
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium uppercase leading-none mb-1">Bons</p>
                  <p className="text-base font-bold text-slate-800 dark:text-white leading-none">
                    {records.filter(r => r.status === 'Bom' || r.status === 'Continue assim').length}
                  </p>
                </div>
              </div>
            </div>

            {/* Botão Largo de Cadastro */}
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full mb-6 bg-orange-500 text-white py-3 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-orange-500/20 hover:bg-orange-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Cadastrar Atleta
            </button>

            {/* Mobile View: Cards */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {filteredRecords.map((record) => (
                <div key={record.id} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-sm text-slate-800 dark:text-white">{record.user}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{new Date(record.date).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <Link 
                        to={`/patient/${record.id}`}
                        className="w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center"
                        title="Perfil do Atleta"
                      >
                        <User size={14} />
                      </Link>
                      <button 
                        onClick={() => openWhatsApp(record.phone, record.user)}
                        className="w-7 h-7 bg-green-500 text-white rounded-full flex items-center justify-center"
                      >
                        <MessageCircle size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 text-center">
                    <div className="flex-1">
                      <p className="text-[9px] text-slate-400 uppercase font-bold">Dor</p>
                      <p className={`text-sm font-bold ${record.pain >= 7 ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>{record.pain}</p>
                    </div>
                    <div className="flex-1 border-x border-slate-100 dark:border-slate-800">
                      <p className="text-[9px] text-slate-400 uppercase font-bold">Fadiga</p>
                      <p className={`text-sm font-bold ${record.fatigue >= 7 ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>{record.fatigue}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-[9px] text-slate-400 uppercase font-bold">Hidrat.</p>
                      <p className={`text-sm font-bold ${parseInt(record.hydration) >= 6 ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>{record.hydration}</p>
                    </div>
                  </div>

                  {record.pain_location && (
                    <div className="bg-red-50 dark:bg-red-900/10 p-2 rounded-lg border border-red-100 dark:border-red-900/20 mb-1">
                       <p className="text-[9px] font-black text-red-600 dark:text-red-400 uppercase leading-none mb-1">Locais de Dor:</p>
                       <p className="text-[10px] text-red-700 dark:text-red-300 font-bold">{record.pain_location}</p>
                    </div>
                  )}

                  <div className="pt-1">
                    <select 
                      value={record.status}
                      onChange={(e) => updateStatus(record.id, e.target.value)}
                      className={`w-full text-[11px] rounded-lg px-2 py-1.5 font-bold border-none outline-none cursor-pointer ${
                        STATUS_OPTIONS.find(o => o.label === record.status)?.color || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {STATUS_OPTIONS.map(opt => (
                        <option key={opt.label} value={opt.label}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden md:block bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 uppercase">
                      <th className="px-3 py-2 font-bold">Atleta</th>
                      <th className="px-3 py-2 font-bold">Data</th>
                      <th className="px-3 py-2 font-bold text-center">Dor</th>
                      <th className="px-3 py-2 font-bold text-center">Fadiga</th>
                      <th className="px-3 py-2 font-bold text-center">Hidrat.</th>
                      <th className="px-3 py-2 font-bold">Feedback</th>
                      <th className="px-3 py-2 font-bold text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                        <td className="px-3 py-2">
                          <p className="font-bold text-xs text-slate-800 dark:text-white">{record.user}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">{record.phone}</p>
                        </td>
                        <td className="px-3 py-2 text-[11px] text-slate-600 dark:text-slate-400">
                          {new Date(record.date).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span className={`inline-flex w-6 h-6 items-center justify-center rounded-full font-bold text-[11px] ${
                            record.pain >= 7 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 
                            record.pain >= 4 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          }`}>
                            {record.pain}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span className={`inline-flex w-6 h-6 items-center justify-center rounded-full font-bold text-[11px] ${
                            record.fatigue >= 7 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 
                            record.fatigue >= 4 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          }`}>
                            {record.fatigue}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span className={`inline-flex w-6 h-6 items-center justify-center rounded-full font-bold text-[11px] ${
                            parseInt(record.hydration) >= 6 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 
                            parseInt(record.hydration) >= 4 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          }`}>
                            {record.hydration}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <select 
                            value={record.status}
                            onChange={(e) => updateStatus(record.id, e.target.value)}
                            className={`text-[10px] rounded-lg px-2 py-1 font-bold border-none outline-none cursor-pointer ${
                              STATUS_OPTIONS.find(o => o.label === record.status)?.color || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            {STATUS_OPTIONS.map(opt => (
                              <option key={opt.label} value={opt.label}>{opt.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <div className="flex justify-end gap-1">
                            <Link 
                              to={`/patient/${record.id}`}
                              className="p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                              title="Perfil do Atleta"
                            >
                              <User size={14} />
                            </Link>
                            <button 
                              onClick={() => openWhatsApp(record.phone, record.user)}
                              className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                            >
                              <MessageCircle size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Atletas List - Integrated below monitoring */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Lista de Atletas</h3>
                <span className="text-[10px] font-bold text-slate-500 uppercase bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                  {filteredAthletes.length} Atletas
                </span>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                        <th className="px-3 py-2 font-bold">Nome</th>
                        <th className="px-3 py-2 font-bold text-center">Status</th>
                        <th className="px-3 py-2 font-bold text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredAthletes.map((athlete) => (
                        <tr key={athlete.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                          <td className="px-3 py-2">
                            <p className="font-bold text-xs text-slate-800 dark:text-white">{athlete.full_name}</p>
                            <p className="text-[9px] text-slate-500 dark:text-slate-400">{athlete.phone || 'Sem telefone'}</p>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              athlete.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              athlete.status === 'blocked' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                              'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            }`}>
                              {athlete.status === 'active' ? 'Ativo' : athlete.status === 'blocked' ? 'Bloqueado' : 'Pendente'}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <div className="flex justify-end gap-1">
                              <Link 
                                to={`/patient/${athlete.id}`}
                                className="px-2 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-[10px] font-bold flex items-center gap-1"
                              >
                                <User size={12} />
                                <span className="hidden xs:inline">Perfil Completo</span>
                              </Link>
                              <button 
                                onClick={() => handleOpenEvalModal(athlete)}
                                className="px-4 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-[10px] font-bold flex items-center justify-center gap-1 min-w-[80px]"
                              >
                                <Plus size={12} />
                                <span>Avaliar</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'scheduling' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">Agendamentos</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Gerencie as avaliações e treinos</p>
              </div>
              <button 
                onClick={() => setIsAppointmentModalOpen(true)}
                className="flex items-center gap-1.5 bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-orange-600 transition shadow-lg shadow-orange-500/20"
              >
                <Plus size={18} />
                Novo Agendamento
              </button>
            </div>
            
            {renderCalendar()}
            
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
              Agendamentos para {selectedDayContext?.toLocaleDateString('pt-BR') || 'Selecione uma data'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {appointments.filter(app => {
                  if(!selectedDayContext) return true;
                  const dateParts = app.date.split('-');
                  if (dateParts.length !== 3) return false;
                  const appDate = new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2]));
                  return appDate.toDateString() === selectedDayContext.toDateString();
              }).length === 0 ? (
                <div className="col-span-full bg-white dark:bg-slate-900 p-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
                  <CalendarIcon size={48} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Nenhum agendamento para este dia.</p>
                </div>
              ) : (
                appointments.filter(app => {
                  if(!selectedDayContext) return true;
                  const dateParts = app.date.split('-');
                  const appDate = new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2]));
                  return appDate.toDateString() === selectedDayContext.toDateString();
                }).sort((a,b) => a.time.localeCompare(b.time)).map(app => (
                  <div key={app.id} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 text-orange-500 dark:text-orange-400 rounded-lg flex items-center justify-center font-bold text-xs shrink-0">
                          {app.athleteName.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-bold text-xs text-slate-800 dark:text-white leading-tight truncate">{app.athleteName}</p>
                          <span className="text-[9px] text-slate-500 font-medium truncate block">{app.type}</span>
                        </div>
                      </div>
                      <div className="flex bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800 items-center gap-1.5 shrink-0">
                        <Clock size={12} className="text-orange-500" />
                        <span className="text-xs font-black text-slate-700 dark:text-slate-300">{app.time}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${
                          app.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          app.status === 'canceled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {app.status === 'confirmed' ? <Check size={8} /> : app.status === 'canceled' ? <X size={8} /> : <Clock size={8} />}
                          {app.status === 'confirmed' ? 'Confirmado' : app.status === 'canceled' ? 'Cancelado' : 'Pendente'}
                        </div>
                        {app.status === 'pending' && (
                          <button 
                            onClick={() => confirmAppointment(app.id)}
                            className="bg-green-500 text-white p-1 rounded hover:bg-green-600 transition"
                            title="Confirmar Agendamento"
                          >
                            <Check size={10} />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => sendAppointmentWhatsApp(app)}
                          className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors bg-green-50 dark:bg-green-900/20 p-1.5 rounded-md"
                          title="Enviar WhatsApp"
                        >
                          <MessageCircle size={12} />
                        </button>
                        <button 
                          onClick={() => deleteAppointment(app.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors bg-slate-50 dark:bg-slate-800 p-1.5 rounded-md"
                          title="Excluir Agendamento"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">Recados</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Envie mensagens globais ou diretas para os atletas</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form de Envio */}
              <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 h-fit">
                <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <MessageSquare size={18} className="text-orange-500" />
                  Novo Recado
                </h3>
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!newMessageRecado.text || isSendingMessage) return;
                    if (!newMessageRecado.sendToAll && newMessageRecado.recipients.length === 0) {
                      alert('Selecione ao menos um atleta ou marque "Todos os Atletas".');
                      return;
                    }

                    setIsSendingMessage(true);
                    try {
                      const adminId = adminProfile?.id || '';
                      
                      let athleteIdsToSend = [];
                      if (newMessageRecado.sendToAll) {
                        athleteIdsToSend = allAthletes.map(a => a.id);
                      } else {
                        athleteIdsToSend = newMessageRecado.recipients;
                      }

                      const promises = athleteIdsToSend.map(id => 
                        supabaseService.addMessage(id, adminId, newMessageRecado.text)
                      );
                      
                      await Promise.all(promises);
                      
                      alert('Recado enviado com sucesso!');
                      const messagesData = await supabaseService.getAllMessages();
                      if (messagesData) setAllMessages(messagesData);
                      
                      setNewMessageRecado({ recipients: [], sendToAll: true, frequency: 'once', text: '' });
                    } catch (error) {
                      console.error(error);
                      alert('Erro ao enviar recado.');
                    } finally {
                      setIsSendingMessage(false);
                    }
                  }} 
                  className="space-y-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <input 
                        type="checkbox" 
                        id="sendToAll"
                        className="w-4 h-4 accent-orange-500 rounded border-slate-300"
                        checked={newMessageRecado.sendToAll}
                        onChange={(e) => setNewMessageRecado({...newMessageRecado, sendToAll: e.target.checked})}
                      />
                      <label htmlFor="sendToAll" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                        Enviar para Todos os Atletas
                      </label>
                    </div>

                    {!newMessageRecado.sendToAll && (
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Selecionar Atletas
                        </label>
                        
                        {/* Tags de Atletas Selecionados */}
                        {newMessageRecado.recipients.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {newMessageRecado.recipients.map(id => {
                              const athlete = allAthletes.find(a => String(a.id) === String(id));
                              return (
                                <div key={id} className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                                    {athlete?.full_name || 'Desconhecido'}
                                  </span>
                                  <button 
                                    type="button"
                                    onClick={() => setNewMessageRecado({
                                      ...newMessageRecado, 
                                      recipients: newMessageRecado.recipients.filter(r => r !== id)
                                    })}
                                    className="text-slate-400 hover:text-red-500 transition"
                                  >
                                    <X size={10} />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        <Select
                          isMulti
                          options={allAthletes.map(a => ({ value: a.id, label: a.full_name }))}
                          value={allAthletes
                            .filter(a => newMessageRecado.recipients.includes(a.id))
                            .map(a => ({ value: a.id, label: a.full_name }))
                          }
                          onChange={(selected: any) => {
                            setNewMessageRecado({
                              ...newMessageRecado,
                              recipients: selected ? selected.map((s: any) => s.value) : []
                            });
                          }}
                          placeholder="Escolha os atletas..."
                          className="react-select-container"
                          classNamePrefix="react-select"
                          styles={{
                            control: (base) => ({
                              ...base,
                              backgroundColor: 'transparent',
                              borderColor: 'rgb(226, 232, 240)',
                              borderRadius: '0.75rem',
                              padding: '0.25rem',
                              fontSize: '0.875rem'
                            }),
                            menu: (base) => ({
                              ...base,
                              backgroundColor: 'white',
                              zIndex: 50
                            })
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Frequência (Configuração)</label>
                    <select
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 outline-none text-slate-800 dark:text-white"
                      value={newMessageRecado.frequency}
                      onChange={(e) => setNewMessageRecado({...newMessageRecado, frequency: e.target.value})}
                    >
                      <option value="once">Enviar uma vez</option>
                      <option value="daily">Todos os dias</option>
                      <option value="weekly">Toda semana</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Mensagem</label>
                    <textarea
                      required
                      placeholder="Escreva a mensagem..."
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 outline-none text-slate-800 dark:text-white h-32 resize-none"
                      value={newMessageRecado.text}
                      onChange={(e) => setNewMessageRecado({...newMessageRecado, text: e.target.value})}
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSendingMessage}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl transition flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSendingMessage ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>Enviando...</span>
                      </div>
                    ) : (
                      <>
                        <Send size={18} />
                        Enviar Recado
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Histórico */}
              <div className="lg:col-span-2">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Histórico de Recados</h3>
                
                {allMessages.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
                    <MessageSquare size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Nenhum recado enviado ainda.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Unique messages grouped heuristically by content/date to show a cleaner broadcast view */}
                    {Array.from(new Map(allMessages.map(m => [m.text.substring(0, 50) + new Date(m.created_at).toDateString(), m])).values()).map((msg: any) => {
                       // Count how many athletes received a similar message on that day
                       const recipientsCount = allMessages.filter(m => m.text === msg.text && new Date(m.created_at).toDateString() === new Date(msg.created_at).toDateString()).length;
                       
                       // Find views by checking access logs after the message date
                       const messageDate = new Date(msg.created_at).getTime();
                       const viewCount = accessLogs.filter(log => new Date(log.date).getTime() >= messageDate).reduce((acc, log) => {
                         acc.add(log.user_id);
                         return acc;
                       }, new Set()).size;

                       return (
                        <div key={msg.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">
                              {new Date(msg.created_at).toLocaleString('pt-BR')}
                            </span>
                            <div className="flex gap-2">
                              <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold">
                                Envios: {recipientsCount}
                              </span>
                              <span className="text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                <Eye size={10} />
                                Visus: {viewCount}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-slate-700 dark:text-slate-300">{supabaseService.cleanMessageText(msg.text)}</p>
                          <div className="mt-3 pt-3 border-t border-slate-50 dark:border-slate-800 flex items-center gap-2">
                            <div className="w-5 h-5 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 text-[10px]">
                              {msg.profiles?.full_name?.charAt(0) || 'A'}
                            </div>
                            <span className="text-xs text-slate-500">Por {msg.profiles?.full_name || 'Admin'}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Modal de Agendamento */}
      {isAppointmentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-xl relative border border-slate-200 dark:border-slate-800">
            <button 
              onClick={() => setIsAppointmentModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-full p-1"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <CalendarIcon className="text-orange-500" size={24} />
              Novo Agendamento
            </h3>
            <div className="flex gap-2 mb-6 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button 
                type="button"
                onClick={() => setNewAppointment({...newAppointment, isWeekly: false})}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${!newAppointment.isWeekly ? 'bg-white dark:bg-slate-900 text-orange-500 shadow-sm' : 'text-slate-500'}`}
              >
                Por Data
              </button>
              <button 
                type="button"
                onClick={() => setNewAppointment({...newAppointment, isWeekly: true})}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${newAppointment.isWeekly ? 'bg-white dark:bg-slate-900 text-orange-500 shadow-sm' : 'text-slate-500'}`}
              >
                Dias da Semana
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Atleta</label>
                <Select
                  required
                  placeholder="Busque o atleta..."
                  value={allAthletes.map(a => ({ value: a.id, label: a.full_name })).find(opt => opt.value === newAppointment.athleteId) || null}
                  onChange={(option: any) => setNewAppointment({ ...newAppointment, athleteId: option ? option.value : '' })}
                  options={allAthletes.map(a => ({ value: a.id, label: a.full_name }))}
                  className="text-sm"
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderRadius: '0.75rem',
                      borderColor: '#e2e8f0',
                      padding: '2px',
                    })
                  }}
                  noOptionsMessage={() => "Nenhum atleta encontrado"}
                  isClearable
                />
              </div>

              {!newAppointment.isWeekly ? (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-left-2 duration-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Data (DD.MM.AA)</label>
                    <input 
                      required 
                      type="date" 
                      min={new Date().toISOString().split('T')[0]}
                      max={new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                      value={newAppointment.date}
                      onChange={e => {
                        const d = new Date(e.target.value + 'T12:00:00');
                        setNewAppointment({
                          ...newAppointment, 
                          date: e.target.value,
                          selectedDays: [d.getDay().toString()]
                        });
                      }}
                      className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Horário</label>
                    <input 
                      required 
                      type="time" 
                      step="900" /* 15 minutes increments */
                      value={newAppointment.time}
                      onChange={e => setNewAppointment({...newAppointment, time: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" 
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Dias da Semana</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: '1', label: 'Seg' },
                        { id: '2', label: 'Ter' },
                        { id: '3', label: 'Qua' },
                        { id: '4', label: 'Qui' },
                        { id: '5', label: 'Sex' },
                        { id: '6', label: 'Sáb' },
                        { id: '0', label: 'Dom' },
                      ].map(day => (
                        <button
                          key={day.id}
                          type="button"
                          onClick={() => {
                            const selected = newAppointment.selectedDays.includes(day.id)
                              ? newAppointment.selectedDays.filter(d => d !== day.id)
                              : [...newAppointment.selectedDays, day.id];
                            setNewAppointment({ ...newAppointment, selectedDays: selected });
                          }}
                          className={`py-2 rounded-lg text-[10px] font-bold transition-all border ${
                            newAppointment.selectedDays.includes(day.id)
                              ? 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/20'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'
                          }`}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Horário</label>
                      <input 
                        required
                        type="time" 
                        value={newAppointment.time}
                        onChange={e => setNewAppointment({...newAppointment, time: e.target.value})}
                        className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl outline-none focus:border-orange-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Número de semanas</label>
                      <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                        <input 
                          type="range" 
                          min="2" max="6" 
                          value={newAppointment.weeksCount}
                          onChange={e => setNewAppointment({...newAppointment, weeksCount: Number(e.target.value)})}
                          className="flex-1 accent-orange-500"
                        />
                        <span className="text-xs font-bold text-orange-500 w-4 text-center">{newAppointment.weeksCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <button 
                type="submit" 
                disabled={isCreatingAppointment}
                className="w-full bg-orange-500 text-white font-bold py-2.5 text-sm rounded-xl hover:bg-orange-600 active:scale-[0.98] transition-all mt-6 shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingAppointment ? 'Agendando...' : 'Agendar'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Aprovação */}
      {isAdminProfileModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-xl relative border border-slate-200 dark:border-slate-800">
            <button 
              onClick={() => setIsAdminProfileModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-full p-1"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <User className="text-orange-500" size={24} />
              Editar Perfil Admin
            </h3>
            
            <form onSubmit={handleSaveAdminProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nome Principal</label>
                <input 
                  type="text" 
                  required
                  value={adminEditForm.full_name}
                  onChange={e => setAdminEditForm({...adminEditForm, full_name: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Foto de Perfil</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
                    {adminEditForm.photo ? (
                      <img src={adminEditForm.photo} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User size={24} className="text-slate-400" />
                    )}
                  </div>
                  <label className="cursor-pointer bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-bold transition-colors border border-slate-200 dark:border-slate-700">
                    Escolher Foto
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setAdminEditForm(prev => ({ ...prev, photo: reader.result as string }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20 mt-6"
              >
                Salvar Alterações
              </button>
            </form>
          </div>
        </div>
      )}

      {isPendingModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl p-6 shadow-xl relative border border-slate-200 dark:border-slate-800 my-8">
            <button 
              onClick={() => setIsPendingModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-full p-1"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <Bell className="text-orange-500" size={24} />
              Atletas Aguardando Aprovação
            </h3>
            
            {pendingAthletes.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-center py-8">Nenhum atleta aguardando aprovação no momento.</p>
            ) : (
              <div className="space-y-4">
                {pendingAthletes.map(athlete => (
                  <div key={athlete.id} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{athlete.full_name}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{athlete.email} • {athlete.phone}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {athlete.city} • {athlete.target_training} • {athlete.position1}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleApproveAthlete(athlete.id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap flex items-center gap-2"
                    >
                      <CheckCircle size={16} />
                      Aprovar Acesso
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Cadastro */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-lg p-4 shadow-xl relative border border-slate-200 dark:border-slate-800 my-4">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-full p-1"
            >
              <X size={16} />
            </button>
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <User className="text-orange-500" size={18} />
              Cadastrar Novo Atleta
            </h3>
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-2">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-0.5">Nome Completo</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="Ex: João Silva"
                    value={newAthlete.name} 
                    onChange={e => setNewAthlete({...newAthlete, name: e.target.value})} 
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-0.5">Data de Nascimento</label>
                  <input 
                    required 
                    type="date" 
                    value={newAthlete.dob} 
                    onChange={e => setNewAthlete({...newAthlete, dob: e.target.value})} 
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-0.5">Telefone / WhatsApp</label>
                  <input 
                    required 
                    type="tel" 
                    placeholder="(00) 00000-0000"
                    value={newAthlete.phone} 
                    onChange={e => setNewAthlete({...newAthlete, phone: e.target.value})} 
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-0.5">E-mail</label>
                  <input 
                    required 
                    type="email" 
                    placeholder="joao@email.com"
                    value={newAthlete.email} 
                    onChange={e => setNewAthlete({...newAthlete, email: e.target.value})} 
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-0.5">Cidade</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="Ex: Barretos"
                    value={newAthlete.city} 
                    onChange={e => setNewAthlete({...newAthlete, city: e.target.value})} 
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-0.5">Treinamento Alvo</label>
                  <select 
                    required
                    value={newAthlete.targetTraining} 
                    onChange={e => setNewAthlete({...newAthlete, targetTraining: e.target.value})} 
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                  >
                    <option value="">Selecione...</option>
                    <option value="Preparação Física">Preparação Física</option>
                    <option value="Desenvolvimento Técnico">Desenvolvimento Técnico</option>
                    <option value="Prevenção de Lesões">Prevenção de Lesões</option>
                    <option value="Inteligência Aguda">Inteligência Aguda</option>
                    <option value="Força e Reabilitação">Força e Reabilitação</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-0.5">Posição 1</label>
                  <select 
                    required
                    value={newAthlete.position1} 
                    onChange={e => setNewAthlete({...newAthlete, position1: e.target.value})} 
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                  >
                    <option value="">Selecione...</option>
                    <option value="Goleiro">Goleiro</option>
                    <option value="Zagueiro">Zagueiro</option>
                    <option value="Lateral Direito">Lateral Direito</option>
                    <option value="Lateral Esquerdo">Lateral Esquerdo</option>
                    <option value="Volante">Volante</option>
                    <option value="Meio-Campo">Meio-Campo</option>
                    <option value="Ponta Direita">Ponta Direita</option>
                    <option value="Ponta Esquerda">Ponta Esquerda</option>
                    <option value="Atacante / Centroavante">Atacante / Centroavante</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-0.5">Posição 2</label>
                  <select 
                    value={newAthlete.position2} 
                    onChange={e => setNewAthlete({...newAthlete, position2: e.target.value})} 
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                  >
                    <option value="">Selecione...</option>
                    <option value="Goleiro">Goleiro</option>
                    <option value="Zagueiro">Zagueiro</option>
                    <option value="Lateral Direito">Lateral Direito</option>
                    <option value="Lateral Esquerdo">Lateral Esquerdo</option>
                    <option value="Volante">Volante</option>
                    <option value="Meio-Campo">Meio-Campo</option>
                    <option value="Ponta Direita">Ponta Direita</option>
                    <option value="Ponta Esquerda">Ponta Esquerda</option>
                    <option value="Atacante / Centroavante">Atacante / Centroavante</option>
                  </select>
                </div>
              </div>
              <button 
                type="submit" 
                className="w-full bg-orange-500 text-white font-bold py-2 text-xs rounded-lg hover:bg-orange-600 active:scale-[0.98] transition-all mt-4 shadow-lg shadow-orange-500/20 uppercase tracking-wider"
              >
                Salvar Cadastro
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Evaluation Modal */}
      <AnimatePresence>
        {isEvaluationModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-4xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 my-8"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">Nova Avaliação</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Atleta: {selectedAthleteForEval?.full_name}</p>
                </div>
                <button onClick={() => setIsEvaluationModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              {!evaluationType ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-8">
                  <button 
                    onClick={() => setEvaluationType('physical')}
                    className="flex flex-col items-center gap-4 p-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-transparent hover:border-orange-500 transition group"
                  >
                    <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition">
                      <Ruler size={32} />
                    </div>
                    <div className="text-center">
                      <h4 className="font-bold text-slate-800 dark:text-white">Avaliação Física</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Antropometria e Pregas Cutâneas</p>
                    </div>
                  </button>
                  <button 
                    onClick={() => setEvaluationType('specific')}
                    className="flex flex-col items-center gap-4 p-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-transparent hover:border-blue-500 transition group"
                  >
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition">
                      <Activity size={32} />
                    </div>
                    <div className="text-center">
                      <h4 className="font-bold text-slate-800 dark:text-white">Avaliação Específica</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Testes de Campo e Performance</p>
                    </div>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSaveEvaluation} className="space-y-6">
                  <div className="flex items-center gap-4 mb-4">
                    <button 
                      type="button" 
                      onClick={() => setEvaluationType(null)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"
                    >
                      <ArrowLeft size={20} className="text-slate-400" />
                    </button>
                    <h4 className="font-bold text-slate-700 dark:text-slate-200">
                      {evaluationType === 'physical' ? 'Dados da Avaliação Física' : 'Dados da Avaliação Específica'}
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">Data</label>
                      <input 
                        type="date" 
                        value={evalForm.date}
                        onChange={e => setEvalForm({...evalForm, date: e.target.value})}
                        className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    </div>
                    {evaluationType === 'physical' && (
                      <>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">Peso (kg)</label>
                          <input 
                            type="number" step="0.1"
                            value={evalForm.weight}
                            onChange={e => setEvalForm({...evalForm, weight: e.target.value})}
                            className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:ring-1 focus:ring-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">Altura (cm)</label>
                          <input 
                            type="number"
                            value={evalForm.height}
                            onChange={e => setEvalForm({...evalForm, height: e.target.value})}
                            className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:ring-1 focus:ring-orange-500"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {evaluationType === 'physical' ? (
                    <div className="space-y-4">
                      <div>
                        <h5 className="text-xs font-bold text-slate-800 dark:text-white mb-2 border-b border-slate-100 dark:border-slate-800 pb-1 uppercase tracking-wider">Antropometria (cm)</h5>
                        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                          {Object.keys(evalForm.measurements).map(key => (
                            <div key={key}>
                              <label className="block text-[9px] text-slate-400 font-bold uppercase mb-0.5 h-5 flex items-end">{MEASUREMENT_LABELS[key] || key}</label>
                              <input 
                                type="number" step="0.1"
                                value={evalForm.measurements[key]}
                                onChange={e => setEvalForm({
                                  ...evalForm, 
                                  measurements: { ...evalForm.measurements, [key]: e.target.value }
                                })}
                                className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:ring-1 focus:ring-orange-500"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-800 dark:text-white mb-2 border-b border-slate-100 dark:border-slate-800 pb-1 uppercase tracking-wider">Pregas Cutâneas (mm)</h5>
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                          {Object.keys(evalForm.skinfolds).map(key => (
                            <div key={key}>
                              <label className="block text-[9px] text-slate-400 font-bold uppercase mb-0.5 h-5 flex items-end">{SKINFOLD_LABELS[key] || key}</label>
                              <input 
                                type="number" step="0.1"
                                value={evalForm.skinfolds[key]}
                                onChange={e => setEvalForm({
                                  ...evalForm, 
                                  skinfolds: { ...evalForm.skinfolds, [key]: e.target.value }
                                })}
                                className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:ring-1 focus:ring-orange-500"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-white mb-2 border-b border-slate-100 dark:border-slate-800 pb-1 uppercase tracking-wider">Testes de Performance</h5>
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                        {Object.keys(evalForm.specificTests).map(key => (
                          <div key={key}>
                            <label className="block text-[9px] text-slate-400 font-bold uppercase mb-0.5 h-7 flex items-end leading-tight">{TEST_LABELS[key] || key}</label>
                            <input 
                              type="number" step="0.01"
                              value={evalForm.specificTests[key]}
                              onChange={e => setEvalForm({
                                ...evalForm, 
                                specificTests: { ...evalForm.specificTests, [key]: e.target.value }
                              })}
                              className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button 
                      type="button"
                      onClick={() => setIsEvaluationModalOpen(false)}
                      className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-xl font-bold text-xs hover:bg-orange-600 transition shadow-lg shadow-orange-500/20"
                    >
                      Salvar
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {isConfirmModalOpen && confirmAction && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{confirmAction.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{confirmAction.message}</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => {
                    confirmAction.onConfirm();
                    setIsConfirmModalOpen(false);
                  }}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition shadow-lg shadow-orange-500/20"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* WhatsApp Modal */}
      <AnimatePresence>
        {isWhatsAppModalOpen && scheduledSummary && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                <MessageCircle className="text-green-500" />
                Notificar Atleta
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                Deseja enviar uma mensagem para <strong>{scheduledSummary.athleteName}</strong> informando sobre o agendamento?
              </p>
              
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl mb-6 text-xs text-slate-600 dark:text-slate-300 italic border border-slate-200 dark:border-slate-700">
                "Olá {scheduledSummary.athleteName}, acabei de fazer o seu {scheduledSummary.summaryText}. Qualquer duvida entre em contato! Obrigado Equipe ELS Power."
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setIsWhatsAppModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  Sem mensagem
                </button>
                <button 
                  onClick={() => {
                    const text = encodeURIComponent(`Olá ${scheduledSummary.athleteName}, acabei de fazer o seu ${scheduledSummary.summaryText}. Qualquer duvida entre em contato! Obrigado Equipe ELS Power.`);
                    window.open(`https://wa.me/${scheduledSummary.athletePhone}?text=${text}`, '_blank');
                    setIsWhatsAppModalOpen(false);
                  }}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-xl font-bold text-sm hover:bg-green-600 transition shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
                >
                  <MessageCircle size={16} />
                  Enviar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
