import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, MessageCircle, Search, Filter, AlertTriangle, CheckCircle, Activity, User, Plus, X, Calendar as CalendarIcon, Clock, Check, Bell } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

type Record = {
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
  const [records, setRecords] = useState<Record[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'monitoring' | 'scheduling'>('monitoring');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
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

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role !== 'admin') {
      navigate('/login');
      return;
    }

    const loadData = async () => {
      try {
        const [profiles, monitoring, apps] = await Promise.all([
          supabaseService.getProfiles(),
          supabaseService.getMonitoringRecords(),
          supabaseService.getAppointments()
        ]);

        if (profiles && monitoring) {
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
              status: m.status
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

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    const athlete = records.find(r => String(r.id) === String(newAppointment.athleteId));
    if (!athlete) return;

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
      
      setIsAppointmentModalOpen(false);
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
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      await supabase.from('appointments').delete().eq('id', id);
      setAppointments(appointments.filter(a => a.id !== id));
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
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
    const text = encodeURIComponent(`Olá, ${app.athleteName}, o seu agendamento está marcado para ${dateStr} às ${app.time}, favor confirmar, até mais! abraços ELS POWER`);
    window.open(`https://wa.me/${athlete.phone}?text=${text}`, '_blank');
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
    const text = encodeURIComponent(`Olá ${name}, vi seu relatório no ELS POWER.`);
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Para criar um novo atleta, ele deve se cadastrar na tela de login, ou você pode usar o painel do Supabase (Authentication > Users).');
    setIsModalOpen(false);
  };

  const handleApproveAthlete = async (id: string) => {
    try {
      await supabaseService.updateProfile(id, { status: 'active' });
      setPendingAthletes(pendingAthletes.filter(a => a.id !== id));
      alert('Atleta aprovado com sucesso!');
    } catch (error) {
      console.error('Error approving athlete:', error);
      alert('Erro ao aprovar atleta.');
    }
  };

  const filteredRecords = records.filter(r => 
    r.user.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors">
      {/* Header */}
      <header className="bg-slate-900 dark:bg-slate-900 text-white p-3 sticky top-0 z-20 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img 
            src="/logo.jpeg" 
            alt="Logo" 
            className="h-8 w-auto object-contain"
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src.endsWith('.jpeg')) target.src = '/logo.jpg';
              else if (target.src.endsWith('.jpg')) target.src = '/logo.png';
              else {
                target.style.display = 'none';
                document.getElementById('fallback-admin-logo')!.style.display = 'flex';
              }
            }}
          />
          <div id="fallback-admin-logo" className="hidden w-8 h-8 bg-orange-500 rounded-md items-center justify-center font-bold italic">⚽</div>
          <h1 className="font-bold text-lg hidden xs:block">Admin CRM</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsPendingModalOpen(true)}
            className="relative p-2 text-slate-300 hover:text-white transition-colors"
          >
            <Bell size={20} />
            {pendingAthletes.length > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                {pendingAthletes.length}
              </span>
            )}
          </button>
          <ThemeToggle />
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg text-sm hover:bg-slate-700 transition">
            <LogOut size={16} />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      <main className="p-3 md:p-8 max-w-7xl mx-auto">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl w-fit">
          <button 
            onClick={() => setActiveTab('monitoring')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'monitoring' ? 'bg-white dark:bg-slate-900 text-orange-500 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Monitoramento
          </button>
          <button 
            onClick={() => setActiveTab('scheduling')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'scheduling' ? 'bg-white dark:bg-slate-900 text-orange-500 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Agendamento
          </button>
        </div>

        {activeTab === 'monitoring' ? (
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
          </>
        ) : (
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {appointments.length === 0 ? (
                <div className="col-span-full bg-white dark:bg-slate-900 p-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
                  <CalendarIcon size={48} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Nenhum agendamento realizado.</p>
                </div>
              ) : (
                appointments.map(app => (
                  <div key={app.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl flex items-center justify-center font-bold">
                          {app.athleteName.charAt(0)}
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-800 dark:text-white">{app.athleteName}</p>
                          <button 
                            onClick={() => sendAppointmentWhatsApp(app)}
                            className="text-green-500 hover:text-green-600 transition-colors"
                            title="Enviar WhatsApp"
                          >
                            <MessageCircle size={14} />
                          </button>
                        </div>
                      </div>
                      <button 
                        onClick={() => deleteAppointment(app.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors p-1"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-2">
                        <CalendarIcon size={14} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{new Date(app.date).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-2">
                        <Clock size={14} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{app.time}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          app.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          app.status === 'canceled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {app.status === 'confirmed' ? <Check size={10} /> : app.status === 'canceled' ? <X size={10} /> : <Clock size={10} />}
                          {app.status === 'confirmed' ? 'Confirmado' : app.status === 'canceled' ? 'Cancelado' : 'Pendente'}
                        </div>
                        {app.status === 'pending' && (
                          <button 
                            onClick={() => confirmAppointment(app.id)}
                            className="bg-green-500 text-white p-1 rounded-md hover:bg-green-600 transition"
                            title="Confirmar Agendamento"
                          >
                            <Check size={12} />
                          </button>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">Criado em {new Date(app.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                ))
              )}
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
                <select 
                  required
                  value={newAppointment.athleteId}
                  onChange={e => setNewAppointment({...newAppointment, athleteId: Number(e.target.value)})}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                >
                  <option value="">Selecione um atleta...</option>
                  {records.map(r => (
                    <option key={r.id} value={r.id}>{r.user}</option>
                  ))}
                </select>
              </div>

              {!newAppointment.isWeekly ? (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-left-2 duration-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Data de Início</label>
                    <input 
                      required 
                      type="date" 
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
                          min="2" max="12" 
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
                className="w-full bg-orange-500 text-white font-bold py-2.5 text-sm rounded-xl hover:bg-orange-600 active:scale-[0.98] transition-all mt-6 shadow-lg shadow-orange-500/20"
              >
                Agendar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Aprovação */}
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
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl p-6 shadow-xl relative border border-slate-200 dark:border-slate-800 my-8">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-full p-1"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <User className="text-orange-500" size={24} />
              Cadastrar Novo Atleta
            </h3>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nome Completo</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="Ex: João Silva"
                    value={newAthlete.name} 
                    onChange={e => setNewAthlete({...newAthlete, name: e.target.value})} 
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Data de Nascimento</label>
                  <input 
                    required 
                    type="date" 
                    value={newAthlete.dob} 
                    onChange={e => setNewAthlete({...newAthlete, dob: e.target.value})} 
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">E-mail</label>
                  <input 
                    required 
                    type="email" 
                    placeholder="joao@email.com"
                    value={newAthlete.email} 
                    onChange={e => setNewAthlete({...newAthlete, email: e.target.value})} 
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Telefone / WhatsApp</label>
                  <input 
                    required 
                    type="tel" 
                    placeholder="(00) 00000-0000"
                    value={newAthlete.phone} 
                    onChange={e => setNewAthlete({...newAthlete, phone: e.target.value})} 
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Cidade</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="Ex: Barretos"
                    value={newAthlete.city} 
                    onChange={e => setNewAthlete({...newAthlete, city: e.target.value})} 
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tipo de Treinamento Alvo</label>
                  <select 
                    required
                    value={newAthlete.targetTraining} 
                    onChange={e => setNewAthlete({...newAthlete, targetTraining: e.target.value})} 
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
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
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Posição 1</label>
                  <select 
                    required
                    value={newAthlete.position1} 
                    onChange={e => setNewAthlete({...newAthlete, position1: e.target.value})} 
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
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
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Posição 2 (Opcional)</label>
                  <select 
                    value={newAthlete.position2} 
                    onChange={e => setNewAthlete({...newAthlete, position2: e.target.value})} 
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
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
                className="w-full bg-orange-500 text-white font-bold py-2.5 text-sm rounded-xl hover:bg-orange-600 active:scale-[0.98] transition-all mt-6 shadow-lg shadow-orange-500/20"
              >
                Salvar Cadastro
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
