import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username === 'Admin' && password === 'Admin') {
      localStorage.setItem('userRole', 'admin');
      navigate('/admin');
    } else if (username === 'usuario' && password === 'usuario') {
      localStorage.setItem('userRole', 'user');
      navigate('/dashboard');
    } else {
      setError('Usuário ou senha inválidos.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4f9] dark:bg-slate-950 flex flex-col items-center justify-center p-4 font-sans transition-colors">
      <div className="bg-white dark:bg-slate-900 w-full max-w-[400px] rounded-3xl p-8 shadow-sm border border-gray-200 dark:border-slate-800">
        <div className="flex flex-col items-center mb-8">
          <img 
            src="/logo.png" 
            alt="ELS POWER Logo" 
            className="h-24 w-auto object-contain mb-4"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <h1 className="text-2xl font-normal text-gray-900 dark:text-white mb-2">Fazer login</h1>
          <p className="text-gray-600 dark:text-slate-400 text-sm">Use sua Conta ELS POWER</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <input
              type="text"
              placeholder="Usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-md border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 outline-none transition"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-md border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 outline-none transition"
              required
            />
          </div>
          
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="mt-8 flex justify-between items-center">
            <button type="button" className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/30 px-2 py-1 rounded">
              Esqueceu a senha?
            </button>
            <button
              type="submit"
              className="bg-[#0b57d0] hover:bg-[#0842a0] dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition"
            >
              Avançar
            </button>
          </div>
        </form>
      </div>
      
      <div className="mt-6 flex gap-4 text-xs text-gray-500 dark:text-slate-400">
        <button className="hover:bg-gray-200 dark:hover:bg-slate-800 px-2 py-1 rounded">Português (Brasil)</button>
        <div className="flex gap-4">
          <button className="hover:bg-gray-200 dark:hover:bg-slate-800 px-2 py-1 rounded">Ajuda</button>
          <button className="hover:bg-gray-200 dark:hover:bg-slate-800 px-2 py-1 rounded">Privacidade</button>
          <button className="hover:bg-gray-200 dark:hover:bg-slate-800 px-2 py-1 rounded">Termos</button>
        </div>
      </div>
    </div>
  );
}
