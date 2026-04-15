import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Clock, LogOut } from 'lucide-react';

export default function PendingApproval() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 font-sans transition-colors">
      <div className="bg-white dark:bg-slate-900 w-full max-w-[400px] rounded-3xl p-8 shadow-sm border border-gray-200 dark:border-slate-800 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-6">
          <Clock className="text-orange-500" size={32} />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Cadastro em Análise</h1>
        
        <p className="text-gray-600 dark:text-slate-400 text-sm mb-8">
          Seu cadastro foi recebido com sucesso! Nossa equipe está analisando seus dados e logo você terá acesso à plataforma.
        </p>

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
