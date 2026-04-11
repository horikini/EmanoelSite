import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, MessageCircle, Search, Filter, AlertTriangle, CheckCircle, Activity, User, Plus, X } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

type Record = {
  id: number;
  date: string;
  user: string;
  phone: string;
  email?: string;
  dob?: string;
  city?: string;
  trainingType?: string;
  position1?: string;
  position2?: string;
  registrationDate?: string;
  pain: number;
  fatigue: number;
  hydration: string;
  status: string;
};

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
  const [newAthlete, setNewAthlete] = useState({ 
    name: '', dob: '', email: '', phone: '', city: '', trainingType: 'Força e Potência', position1: 'Atacante', position2: 'Ponta' 
  });

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role !== 'admin') {
      navigate('/login');
    }

    // Load mock data
    const saved = localStorage.getItem('els_records');
    if (saved && JSON.parse(saved).length >= 20) {
      setRecords(JSON.parse(saved));
    } else {
      // Generate 20 mock records
      const names = ['Carlos Silva', 'Marcos Paulo', 'João Atleta', 'Lucas Souza', 'Gabriel Lima', 'Rafael Santos', 'Bruno Oliveira', 'Thiago Costa', 'Felipe Rocha', 'André Mendes', 'Mateus Alvez', 'Vitor Hugo', 'Daniel Cruz', 'Igor Ferreira', 'Gustavo Lima', 'Rodrigo Melo', 'Samuel Paz', 'Diego Torres', 'Renan Silva', 'Alexandre Pato'];
      const initial: Record[] = names.map((name, index) => ({
        id: index + 1,
        date: new Date(Date.now() - Math.random() * 1000000000).toISOString(),
        user: name,
        phone: '55119' + Math.floor(10000000 + Math.random() * 90000000),
        pain: Math.floor(Math.random() * 11),
        fatigue: Math.floor(Math.random() * 11),
        hydration: String(Math.floor(1 + Math.random() * 8)),
        status: index % 5 === 0 ? 'Pendente' : STATUS_OPTIONS[Math.floor(Math.random() * STATUS_OPTIONS.length)].label
      }));
      setRecords(initial);
      localStorage.setItem('els_records', JSON.stringify(initial));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    navigate('/');
  };

  const updateStatus = (id: number, newStatus: string) => {
    const updated = records.map(r => r.id === id ? { ...r, status: newStatus } : r);
    setRecords(updated);
    localStorage.setItem('els_records', JSON.stringify(updated));
  };

  const openWhatsApp = (phone: string, name: string) => {
    const text = encodeURIComponent(`Olá ${name}, vi seu relatório no ELS POWER.`);
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = records.length > 0 ? Math.max(...records.map(r => r.id)) + 1 : 1;
    const newRecord: Record = {
      id: newId,
      date: new Date().toISOString(),
      user: newAthlete.name,
      phone: newAthlete.phone,
      email: newAthlete.email,
      dob: newAthlete.dob,
      city: newAthlete.city,
      trainingType: newAthlete.trainingType,
      position1: newAthlete.position1,
      position2: newAthlete.position2,
      registrationDate: new Date().toISOString(),
      pain: 0,
      fatigue: 0,
      hydration: "1",
      status: "Pendente"
    };
    const updated = [newRecord, ...records];
    setRecords(updated);
    localStorage.setItem('els_records', JSON.stringify(updated));
    setIsModalOpen(false);
    setNewAthlete({ name: '', dob: '', email: '', phone: '', city: '', trainingType: 'Força e Potência', position1: 'Atacante', position2: 'Ponta' });
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
          <ThemeToggle />
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg text-sm hover:bg-slate-700 transition">
            <LogOut size={16} />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      <main className="p-3 md:p-8 max-w-7xl mx-auto">
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center shrink-0">
              <Activity size={16} />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase">Total</p>
              <p className="text-lg font-bold text-slate-800 dark:text-white leading-none">{records.length}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center shrink-0">
              <AlertTriangle size={16} />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase">Atenção</p>
              <p className="text-lg font-bold text-slate-800 dark:text-white leading-none">
                {records.filter(r => r.pain >= 7 || r.fatigue >= 7 || parseInt(r.hydration) >= 6).length}
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center shrink-0">
              <CheckCircle size={16} />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase">Bons</p>
              <p className="text-lg font-bold text-slate-800 dark:text-white leading-none">
                {records.filter(r => r.status === 'Bom' || r.status === 'Continue assim').length}
              </p>
            </div>
          </div>
        </div>

        {/* Mobile View: Cards | Desktop View: Table */}
        <div className="md:hidden space-y-3">
          {filteredRecords.map((record) => (
            <div key={record.id} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-sm text-slate-800 dark:text-white">{record.user}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{new Date(record.date).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="flex gap-1.5">
                  <Link 
                    to={`/admin/patient/${record.id}`}
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
                        className={`text-[10px] rounded-full px-2 py-1 font-bold border-none outline-none cursor-pointer ${
                          STATUS_OPTIONS.find(o => o.label === record.status)?.color || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {STATUS_OPTIONS.map(opt => (
                          <option key={opt.label} value={opt.label}>{opt.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link 
                          to={`/admin/patient/${record.id}`}
                          className="inline-flex items-center justify-center w-7 h-7 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition shadow-sm"
                          title="Perfil do Atleta"
                        >
                          <User size={14} />
                        </Link>
                        <button 
                          onClick={() => openWhatsApp(record.phone, record.user)}
                          className="inline-flex items-center justify-center w-7 h-7 bg-green-500 text-white rounded-full hover:bg-green-600 transition shadow-sm"
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
      </main>

      {/* Modal de Cadastro */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg p-5 shadow-xl relative border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-full p-1"
            >
              <X size={16} />
            </button>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <User className="text-orange-500" size={20} />
              Cadastrar Novo Atleta
            </h3>
            <form onSubmit={handleRegister} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Nome Completo</label>
                <input required type="text" placeholder="Ex: João Silva" value={newAthlete.name} onChange={e => setNewAthlete({...newAthlete, name: e.target.value})} className="w-full px-2 py-1.5 text-xs border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Data de Nascimento</label>
                <input required type="date" value={newAthlete.dob} onChange={e => setNewAthlete({...newAthlete, dob: e.target.value})} className="w-full px-2 py-1.5 text-xs border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Cidade</label>
                <input required type="text" placeholder="Ex: Barretos - SP" value={newAthlete.city} onChange={e => setNewAthlete({...newAthlete, city: e.target.value})} className="w-full px-2 py-1.5 text-xs border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">E-mail</label>
                <input required type="email" placeholder="joao@email.com" value={newAthlete.email} onChange={e => setNewAthlete({...newAthlete, email: e.target.value})} className="w-full px-2 py-1.5 text-xs border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Telefone / WhatsApp</label>
                <input required type="tel" placeholder="(00) 00000-0000" value={newAthlete.phone} onChange={e => setNewAthlete({...newAthlete, phone: e.target.value})} className="w-full px-2 py-1.5 text-xs border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Tipo de Treinamento Alvo</label>
                <select value={newAthlete.trainingType} onChange={e => setNewAthlete({...newAthlete, trainingType: e.target.value})} className="w-full px-2 py-1.5 text-xs border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all">
                  <option value="Força e Potência">Força e Potência</option>
                  <option value="Resistência">Resistência</option>
                  <option value="Agilidade e Velocidade">Agilidade e Velocidade</option>
                  <option value="Reabilitação">Reabilitação</option>
                  <option value="Manutenção">Manutenção</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Posição 1</label>
                <select value={newAthlete.position1} onChange={e => setNewAthlete({...newAthlete, position1: e.target.value})} className="w-full px-2 py-1.5 text-xs border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all">
                  <option value="Goleiro">Goleiro</option>
                  <option value="Zagueiro">Zagueiro</option>
                  <option value="Lateral">Lateral</option>
                  <option value="Volante">Volante</option>
                  <option value="Meio-Campo">Meio-Campo</option>
                  <option value="Ponta">Ponta</option>
                  <option value="Atacante">Atacante</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Posição 2</label>
                <select value={newAthlete.position2} onChange={e => setNewAthlete({...newAthlete, position2: e.target.value})} className="w-full px-2 py-1.5 text-xs border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all">
                  <option value="Nenhuma">Nenhuma</option>
                  <option value="Goleiro">Goleiro</option>
                  <option value="Zagueiro">Zagueiro</option>
                  <option value="Lateral">Lateral</option>
                  <option value="Volante">Volante</option>
                  <option value="Meio-Campo">Meio-Campo</option>
                  <option value="Ponta">Ponta</option>
                  <option value="Atacante">Atacante</option>
                </select>
              </div>
              <button 
                type="submit" 
                className="sm:col-span-2 w-full bg-orange-500 text-white font-bold py-2 text-xs rounded-lg hover:bg-orange-600 active:scale-[0.98] transition-all mt-2 shadow-sm"
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
