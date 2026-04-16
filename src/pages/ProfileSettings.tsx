import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { User, Lock, Camera, Save, ArrowLeft } from 'lucide-react';

export default function ProfileSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(data);
      setFullName(data?.full_name || '');
      setPhone(data?.phone || '');
      setCity(data?.city || '');
      setEmail(user.email || '');
    }
    loadProfile();
  }, [navigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Update profile table
      await supabase.from('profiles').update({ 
        full_name: fullName,
        phone: phone,
        city: city
      }).eq('id', user.id);
      
      // Update email in auth
      const { error } = await supabase.auth.updateUser({ email: email });
      
      if (error) setMessage('Erro ao atualizar perfil: ' + error.message);
      else setMessage('Perfil atualizado com sucesso!');
    }
    setLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) setMessage('Erro ao atualizar senha: ' + error.message);
    else setMessage('Senha atualizada com sucesso!');
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 mb-6">
        <ArrowLeft size={20} /> Voltar
      </button>
      <h1 className="text-2xl font-black text-slate-900 mb-6">Configurações de Perfil</h1>
      
      {message && <div className="p-4 mb-4 bg-orange-100 text-orange-800 rounded-lg">{message}</div>}

      <form onSubmit={handleUpdateProfile} className="bg-white p-6 rounded-2xl border border-slate-100 mb-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><User size={20} /> Informações Pessoais</h2>
        <input 
          type="text" 
          value={fullName} 
          onChange={(e) => setFullName(e.target.value)}
          className="w-full p-3 rounded-lg border border-slate-200 mb-4"
          placeholder="Nome Completo"
        />
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded-lg border border-slate-200 mb-4"
          placeholder="E-mail"
        />
        <input 
          type="tel" 
          value={phone} 
          onChange={(e) => setPhone(e.target.value)}
          className="w-full p-3 rounded-lg border border-slate-200 mb-4"
          placeholder="Telefone"
        />
        <input 
          type="text" 
          value={city} 
          onChange={(e) => setCity(e.target.value)}
          className="w-full p-3 rounded-lg border border-slate-200 mb-4"
          placeholder="Cidade"
        />
        <button type="submit" disabled={loading} className="bg-orange-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
          <Save size={16} /> Salvar Informações
        </button>
      </form>

      <form onSubmit={handleUpdatePassword} className="bg-white p-6 rounded-2xl border border-slate-100">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Lock size={20} /> Alterar Senha</h2>
        <input 
          type="password" 
          value={newPassword} 
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full p-3 rounded-lg border border-slate-200 mb-4"
          placeholder="Nova Senha"
        />
        <button type="submit" disabled={loading} className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold">
          Atualizar Senha
        </button>
      </form>
    </div>
  );
}
