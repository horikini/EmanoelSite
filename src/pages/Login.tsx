import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Load saved email if rememberMe was previously checked
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }

    // Check if user is already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Se o usuário já está logado, mas veio para a página de login,
        // talvez ele queira trocar de conta. 
        // Por enquanto, vamos manter o redirecionamento automático,
        // mas garantir que o role e id no localStorage estejam sincronizados.
        handleUserRedirect(session.user.id);
      }
    };
    
    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        handleUserRedirect(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUserRedirect = async (userId: string) => {
    try {
      setLoading(true);
      
      // Try to fetch the profile
      let { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // If profile doesn't exist (PGRST116 means no rows returned), create it manually
      // This acts as a fallback in case the database trigger fails or is delayed
      if (error && error.code === 'PGRST116') {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const newProfile = {
            id: userId,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'Atleta',
            email: user.email,
            role: 'athlete',
            status: 'pending'
          };
          
          const { data: createdProfile, error: insertError } = await supabase
            .from('profiles')
            .insert([newProfile])
            .select()
            .single();
            
          if (insertError) throw insertError;
          profile = createdProfile;
        }
      } else if (error) {
        throw error;
      }

      if (!profile) {
        throw new Error('Não foi possível carregar ou criar o perfil');
      }

      localStorage.setItem('userRole', profile.role);
      localStorage.setItem('userId', userId);

      // Check if user needs to change password (created by Admin)
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.precisa_mudar_senha) {
        navigate('/criar-senha');
        return;
      }

      if (profile.role === 'admin') {
        navigate('/admin');
      } else {
        // If phone is missing, profile is incomplete
        if (!profile.phone) {
          navigate('/complete-profile');
        } else if (profile.status === 'pending') {
          navigate('/pending-approval');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      // Display the exact error message to help debugging
      setError(`Erro: ${err.message || JSON.stringify(err)}`);
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let loginEmail = email;

    // Se o usuário digitou algo que parece um telefone (apenas números ou formatos comuns) e não tem @
    const isPhone = /^[0-9\s\-\(\)\+]+$/.test(email) && !email.includes('@');
    
    if (isPhone) {
      try {
        const cleanPhone = email.replace(/\D/g, '');
        // Busca o e-mail associado a este telefone na tabela de perfis
        const { data: profile, error: phoneError } = await supabase
          .from('profiles')
          .select('email')
          .or(`phone.eq.${cleanPhone},phone.ilike.%${cleanPhone}%`)
          .limit(1)
          .maybeSingle();
          
        if (profile?.email) {
          loginEmail = profile.email;
        } else {
          // Se não achou o perfil pelo telefone, avisa o usuário
          setError('Não encontramos nenhum atleta com este telefone. Tente usar seu e-mail.');
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error('Erro ao buscar e-mail por telefone:', err);
      }
    }

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });

      if (authError) {
        if (authError.message === 'Invalid login credentials') {
          throw new Error('E-mail ou senha incorretos. Lembre-se: para novos atletas, a senha inicial é o seu telefone (apenas números).');
        }
        if (authError.message === 'Failed to fetch') {
           throw new Error('Sem conexão com o Supabase. Verifique as configurações de ambiente (VITE_SUPABASE_URL) nas configurações da plataforma.');
        }
        throw authError;
      }

      if (data.user) {
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        await handleUserRedirect(data.user.id);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 font-sans overflow-hidden">
      {/* Animated Soccer Field Background */}
      <div 
        className="absolute inset-0 z-0 opacity-90 dark:opacity-40"
        style={{
          backgroundColor: '#2e7d32',
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(0,0,0,0.15) 40px, rgba(0,0,0,0.15) 80px)`,
          backgroundSize: '100% 80px',
          animation: 'pan-field 10s linear infinite'
        }}
      />
      {/* Overlay to make the card pop */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/20 to-black/60 dark:from-black/50 dark:to-black/80" />

      <div className="z-10 bg-white dark:bg-slate-900 w-full max-w-[300px] rounded-3xl p-8 shadow-2xl border border-gray-200 dark:border-slate-800 relative">
        <button 
          onClick={() => navigate('/')}
          className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          title="Voltar"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="flex flex-col items-center mb-8 mt-2">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center p-3 shadow-xl mb-4 group overflow-hidden">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-full h-full object-contain relative z-10"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <h1 className="text-2xl font-normal text-gray-900 dark:text-white mb-2">Fazer login</h1>
          <p className="text-gray-600 dark:text-slate-400 text-sm italic">Bem-vindo(a)</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-md border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 outline-none transition"
              required
            />
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-md border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 outline-none transition pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="rememberMe" className="text-sm text-gray-600 dark:text-slate-400 cursor-pointer select-none">
              Lembrar meu e-mail
            </label>
          </div>
          
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="mt-4 flex justify-between items-center">
            <button type="button" className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/30 px-2 py-1 rounded">
              Esqueceu a senha?
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#0b57d0] hover:bg-[#0842a0] dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition disabled:opacity-50"
            >
              {loading ? 'Entrando...' : 'Avançar'}
            </button>
          </div>
        </form>
      </div>
      
      <div className="z-10 mt-6 flex gap-4 text-xs text-white/70 dark:text-slate-400">
        <button className="hover:bg-white/10 dark:hover:bg-slate-800 px-2 py-1 rounded transition-colors">Português (Brasil)</button>
        <div className="flex gap-4">
          <button className="hover:bg-white/10 dark:hover:bg-slate-800 px-2 py-1 rounded transition-colors">Ajuda</button>
          <button className="hover:bg-white/10 dark:hover:bg-slate-800 px-2 py-1 rounded transition-colors">Privacidade</button>
          <button className="hover:bg-white/10 dark:hover:bg-slate-800 px-2 py-1 rounded transition-colors">Termos</button>
        </div>
      </div>
    </div>
  );
}
