import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { supabaseService, Profile } from '../lib/supabaseService';
import { User, Phone, MapPin, Calendar, Target, Activity } from 'lucide-react';

export default function CompleteProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Partial<Profile>>({
    full_name: '',
    phone: '',
    dob: '',
    city: '',
    target_training: '',
    position1: '',
    position2: ''
  });

  useEffect(() => {
    const loadProfile = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        navigate('/login');
        return;
      }
      try {
        const data = await supabaseService.getProfile(userId);
        setProfile({
          full_name: data.full_name || '',
          phone: data.phone || '',
          dob: data.dob || '',
          city: data.city || '',
          target_training: data.target_training || '',
          position1: data.position1 || '',
          position2: data.position2 || ''
        });
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };
    loadProfile();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    try {
      // Set status to pending so admin has to approve
      await supabaseService.updateProfile(userId, {
        ...profile,
        status: 'pending'
      });
      navigate('/pending-approval');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Erro ao salvar os dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 font-sans transition-colors">
      <div className="bg-white dark:bg-slate-900 w-full max-w-[600px] rounded-3xl p-8 shadow-sm border border-gray-200 dark:border-slate-800">
        <div className="flex flex-col items-center mb-8">
          <img 
            src="/logo.png" 
            alt="ELS POWER Logo" 
            className="h-20 w-auto object-contain mb-4"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">Complete seu Cadastro</h1>
          <p className="text-gray-600 dark:text-slate-400 text-sm text-center">
            Precisamos de mais algumas informações para liberar seu acesso à plataforma.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <User size={14} /> Nome Completo
              </label>
              <input 
                required 
                type="text" 
                value={profile.full_name} 
                onChange={e => setProfile({...profile, full_name: e.target.value})} 
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Calendar size={14} /> Data de Nascimento
              </label>
              <input 
                required 
                type="date" 
                value={profile.dob} 
                onChange={e => setProfile({...profile, dob: e.target.value})} 
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Phone size={14} /> Telefone / WhatsApp
              </label>
              <input 
                required 
                type="tel" 
                placeholder="(00) 00000-0000"
                value={profile.phone} 
                onChange={e => setProfile({...profile, phone: e.target.value})} 
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <MapPin size={14} /> Cidade
              </label>
              <input 
                required 
                type="text" 
                placeholder="Ex: Barretos"
                value={profile.city} 
                onChange={e => setProfile({...profile, city: e.target.value})} 
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Target size={14} /> Tipo de Treinamento Alvo
              </label>
              <select 
                required
                value={profile.target_training} 
                onChange={e => setProfile({...profile, target_training: e.target.value})} 
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
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
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Activity size={14} /> Posição 1
              </label>
              <select 
                required
                value={profile.position1} 
                onChange={e => setProfile({...profile, position1: e.target.value})} 
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
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
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Activity size={14} /> Posição 2 (Opcional)
              </label>
              <select 
                value={profile.position2} 
                onChange={e => setProfile({...profile, position2: e.target.value})} 
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
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
            disabled={loading}
            className="w-full bg-[#0b57d0] hover:bg-[#0842a0] dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium py-3 rounded-full transition-all mt-6 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Enviar para Aprovação'}
          </button>
        </form>
      </div>
    </div>
  );
}
