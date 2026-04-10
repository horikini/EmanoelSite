import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, MessageCircle, Search, Filter, AlertTriangle, CheckCircle, Activity } from 'lucide-react';

type Record = {
  id: number;
  date: string;
  user: string;
  phone: string;
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

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role !== 'admin') {
      navigate('/login');
    }

    // Load mock data
    const saved = localStorage.getItem('els_records');
    if (saved) {
      setRecords(JSON.parse(saved));
    } else {
      // Initial mock data if empty
      const initial: Record[] = [
        { id: 1, date: new Date().toISOString(), user: 'Carlos Silva', phone: '5511999999999', pain: 2, fatigue: 4, hydration: '3', status: 'Pendente' },
        { id: 2, date: new Date(Date.now() - 86400000).toISOString(), user: 'Marcos Paulo', phone: '5511988888888', pain: 8, fatigue: 9, hydration: '6', status: 'Ruim' },
      ];
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

  const filteredRecords = records.filter(r => 
    r.user.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-slate-900 text-white p-4 sticky top-0 z-20 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="h-8 w-auto object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              document.getElementById('fallback-admin-logo')!.style.display = 'flex';
            }}
          />
          <div id="fallback-admin-logo" className="hidden w-8 h-8 bg-orange-500 rounded-md items-center justify-center font-bold italic">EP</div>
          <h1 className="font-bold text-lg hidden sm:block">Admin CRM - ELS POWER</h1>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg text-sm hover:bg-slate-700 transition">
          <LogOut size={16} />
          <span>Sair</span>
        </button>
      </header>

      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Painel de Monitoramento</h2>
            <p className="text-slate-500">Acompanhe o bem-estar dos atletas</p>
          </div>
          
          <div className="flex w-full md:w-auto gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar atleta..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
              />
            </div>
            <button className="p-2 border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50">
              <Filter size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Total Relatórios</p>
              <p className="text-2xl font-bold text-slate-800">{records.length}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Atenção Necessária</p>
              <p className="text-2xl font-bold text-slate-800">
                {records.filter(r => r.pain >= 7 || r.fatigue >= 7 || parseInt(r.hydration) >= 6).length}
              </p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Bons Resultados</p>
              <p className="text-2xl font-bold text-slate-800">
                {records.filter(r => r.status === 'Bom' || r.status === 'Continue assim').length}
              </p>
            </div>
          </div>
        </div>

        {/* Desktop Table / Mobile Cards */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500">
                  <th className="p-4 font-medium">Atleta</th>
                  <th className="p-4 font-medium">Data</th>
                  <th className="p-4 font-medium text-center">Dor (0-10)</th>
                  <th className="p-4 font-medium text-center">Fadiga (0-10)</th>
                  <th className="p-4 font-medium text-center">Hidratação</th>
                  <th className="p-4 font-medium">Feedback / Status</th>
                  <th className="p-4 font-medium text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{record.user}</p>
                      <p className="text-xs text-slate-500">{record.phone}</p>
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {new Date(record.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex w-8 h-8 items-center justify-center rounded-full font-bold text-sm ${
                        record.pain >= 7 ? 'bg-red-100 text-red-700' : 
                        record.pain >= 4 ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-green-100 text-green-700'
                      }`}>
                        {record.pain}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex w-8 h-8 items-center justify-center rounded-full font-bold text-sm ${
                        record.fatigue >= 7 ? 'bg-red-100 text-red-700' : 
                        record.fatigue >= 4 ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-green-100 text-green-700'
                      }`}>
                        {record.fatigue}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex w-8 h-8 items-center justify-center rounded-full font-bold text-sm ${
                        parseInt(record.hydration) >= 6 ? 'bg-red-100 text-red-700' : 
                        parseInt(record.hydration) >= 4 ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-green-100 text-green-700'
                      }`}>
                        {record.hydration}
                      </span>
                    </td>
                    <td className="p-4">
                      <select 
                        value={record.status}
                        onChange={(e) => updateStatus(record.id, e.target.value)}
                        className={`text-sm rounded-full px-3 py-1 font-medium border-none outline-none cursor-pointer ${
                          STATUS_OPTIONS.find(o => o.label === record.status)?.color || 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {STATUS_OPTIONS.map(opt => (
                          <option key={opt.label} value={opt.label}>{opt.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => openWhatsApp(record.phone, record.user)}
                        className="inline-flex items-center justify-center w-10 h-10 bg-green-500 text-white rounded-full hover:bg-green-600 transition shadow-sm"
                        title="Enviar WhatsApp"
                      >
                        <MessageCircle size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredRecords.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      Nenhum registro encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
