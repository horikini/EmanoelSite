import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { supabaseService } from '../lib/supabaseService';
import { Clock, LogOut, MessageCircle } from 'lucide-react';

export default function PendingApproval() {
  const navigate = useNavigate();
  const [athleteName, setAthleteName] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const userId = localStorage.getItem('userId');
      if (userId) {
        try {
          const profile = await supabaseService.getProfile(userId);
          setAthleteName(profile.full_name || '');
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    navigate('/');
  };

  const whatsappNumber = '5577991463640';
  const welcomeMessage = encodeURIComponent(`Olá! Acabei de realizar meu cadastro na plataforma ELS POWER como atleta (${athleteName}). Gostaria de solicitar a aprovação do meu perfil para começar o monitoramento.`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${welcomeMessage}`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 font-sans transition-colors">
      <div className="bg-white dark:bg-slate-900 w-full max-w-[400px] rounded-3xl p-8 shadow-sm border border-gray-200 dark:border-slate-800 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-6">
          <Clock className="text-orange-500" size={32} />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Cadastro em Análise</h1>
        
        <p className="text-gray-600 dark:text-slate-400 text-sm mb-6">
          Seu cadastro foi recebido com sucesso! Nossa equipe está analisando seus dados e logo você terá acesso à plataforma.
        </p>

        <a 
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-3 px-4 rounded-2xl transition-all flex items-center justify-center gap-2 mb-8 shadow-lg shadow-green-500/20 active:scale-[0.98]"
        >
          <MessageCircle size={20} />
          Notificar no WhatsApp
        </a>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-medium"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </div>
  );
}
