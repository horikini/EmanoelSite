import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ChevronRight, Zap, Trophy, Dumbbell, Target, HeartPulse, LineChart, Utensils, ShieldCheck } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-x-hidden">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 p-4 md:px-8 flex justify-between items-center bg-gradient-to-b from-slate-950/80 to-transparent">
        <div className="flex items-center gap-2">
          <img 
            src="/logo.png" 
            alt="ELS POWER Logo" 
            className="h-16 w-auto object-contain drop-shadow-lg"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              document.getElementById('fallback-logo')!.style.display = 'flex';
            }}
          />
          <div id="fallback-logo" className="hidden items-center gap-2">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl flex items-center justify-center font-black text-2xl italic shadow-lg shadow-orange-500/20">
              EP
            </div>
            <span className="font-black text-2xl tracking-tighter italic text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300">ELS POWER</span>
          </div>
        </div>
        <Link
          to="/login"
          className="bg-orange-500/10 border border-orange-500/50 text-orange-400 px-6 py-2 rounded-full text-sm font-bold hover:bg-orange-500 hover:text-white transition-all shadow-[0_0_15px_-5px_rgba(249,115,22,0.4)]"
        >
          Área do Atleta
        </Link>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 min-h-[90vh] flex flex-col justify-center overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/bg1.jpg"
            alt="Soccer Training"
            className="w-full h-full object-cover opacity-30"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1518605368461-1e1252220a4c?q=80&w=2000&auto=format&fit=crop";
            }}
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-transparent to-transparent opacity-80" />
        </div>

        {/* Speed Lines Animation */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-full w-[2px] bg-gradient-to-b from-transparent via-orange-500 to-transparent"
              style={{ left: `${10 + i * 12}%` }}
              animate={{ y: ['-100%', '200%'] }}
              transition={{
                duration: 1 + Math.random() * 2,
                repeat: Infinity,
                ease: 'linear',
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-5xl mx-auto w-full flex flex-col items-start text-left">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 text-orange-400 text-sm font-bold mb-6 border border-orange-500/20 backdrop-blur-sm"
          >
            <Zap size={16} className="fill-orange-400" />
            <span>TREINAMENTO DE ALTO RENDIMENTO</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-[1.1] mb-6"
          >
            Domine o Jogo. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-yellow-500">
              Supere seus Limites.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-300 text-lg md:text-xl mb-10 max-w-2xl leading-relaxed"
          >
            Preparação física e técnica especializada em futebol. Transformamos seu potencial em performance real dentro de campo com metodologia comprovada.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <a
              href="#treinamentos"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-lg py-4 px-8 rounded-2xl shadow-[0_0_30px_-5px_rgba(249,115,22,0.4)] hover:scale-[1.02] hover:shadow-[0_0_40px_-5px_rgba(249,115,22,0.6)] active:scale-[0.98] transition-all"
            >
              CONHEÇA O MÉTODO
              <ChevronRight size={24} />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Metodologia / Tipos de Treinamento */}
      <section id="treinamentos" className="py-24 px-4 relative z-10 bg-slate-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black italic mb-4">NOSSOS TREINAMENTOS</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">Uma abordagem completa para construir atletas mais fortes, rápidos e inteligentes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Dumbbell size={32} />,
                title: "Preparação Física",
                desc: "Foco em força explosiva, resistência de jogo e potência. Treinos periodizados para você sobrar em campo nos 90 minutos."
              },
              {
                icon: <Target size={32} />,
                title: "Desenvolvimento Técnico",
                desc: "Aprimoramento de fundamentos: passe, domínio, finalização e drible. Repetição com correção biomecânica."
              },
              {
                icon: <HeartPulse size={32} />,
                title: "Prevenção de Lesões",
                desc: "Trabalho de mobilidade, estabilidade e fortalecimento do core para blindar seu corpo contra lesões comuns no futebol."
              },
              {
                icon: <Zap size={32} />,
                title: "Inteligência Aguda",
                desc: "Treinos cognitivos e de tomada de decisão rápida sob pressão, simulando situações reais de jogo."
              }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl hover:border-orange-500/50 hover:bg-slate-800/50 transition-colors group"
              >
                <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 mb-6 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-slate-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Planilha e Acompanhamento */}
      <section className="py-24 px-4 relative z-10 bg-slate-900 overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm font-bold border border-blue-500/20">
              <LineChart size={16} />
              <span>EVOLUÇÃO BASEADA EM DADOS</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black italic leading-tight">
              Planilha de Acompanhamento <span className="text-blue-500">Exclusiva</span>
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed">
              Não acreditamos em achismos. Cada atleta ELS POWER recebe uma planilha individualizada e acesso ao nosso aplicativo de monitoramento diário.
            </p>
            <ul className="space-y-4 mt-6">
              {[
                "Controle de Carga de Treinamento",
                "Monitoramento de Fadiga e Dor (Wellness)",
                "Avaliações Físicas Periódicas",
                "Ajuste de treinos em tempo real"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300">
                  <ShieldCheck className="text-blue-500 shrink-0" size={24} />
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 w-full relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 blur-[100px] opacity-20 rounded-full" />
            <img 
              src="/bg2.jpg" 
              alt="Análise de Dados" 
              className="relative rounded-3xl border border-slate-700 shadow-2xl w-full object-cover h-[400px]"
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop";
              }}
            />
          </div>
        </div>
      </section>

      {/* Parceria Nutricional */}
      <section className="py-24 px-4 relative z-10 bg-slate-950">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row-reverse items-center gap-12">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-sm font-bold border border-green-500/20">
              <Utensils size={16} />
              <span>O COMBUSTÍVEL DO CAMPEÃO</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black italic leading-tight">
              Parceria com <span className="text-green-500">Nutricionista Esportivo</span>
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed">
              O treino destrói, a alimentação constrói. Para garantir que você tenha a melhor recuperação e energia em campo, oferecemos acompanhamento nutricional especializado.
            </p>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl mt-6">
              <h4 className="font-bold text-xl mb-2 flex items-center gap-2">
                <Trophy className="text-yellow-500" size={20} />
                Vantagens da Parceria
              </h4>
              <p className="text-slate-400">Planos alimentares focados em ganho de massa, perda de percentual de gordura e estratégias de suplementação para dias de jogos e treinos intensos.</p>
            </div>
          </div>
          <div className="flex-1 w-full relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 blur-[100px] opacity-20 rounded-full" />
            <img 
              src="/bg3.jpg" 
              alt="Nutrição Esportiva" 
              className="relative rounded-3xl border border-slate-700 shadow-2xl w-full object-cover h-[400px]"
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1000&auto=format&fit=crop";
              }}
            />
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 px-4 relative z-10 bg-gradient-to-br from-orange-600 to-orange-900 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-black italic mb-6 uppercase drop-shadow-lg">
            Pronto para mudar de patamar?
          </h2>
          <p className="text-orange-100 text-xl mb-10">
            Junte-se à ELS POWER e tenha acesso ao treinamento, acompanhamento e estrutura que os atletas profissionais utilizam.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 bg-white text-orange-700 font-black text-xl py-5 px-10 rounded-full hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] active:scale-95 transition-all"
          >
            QUERO SER ELS POWER
            <ChevronRight size={28} />
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-slate-950 py-8 text-center border-t border-slate-900">
        <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center font-black text-sm italic text-white">EP</div>
          <span className="font-black text-lg tracking-tighter italic text-white">ELS POWER</span>
        </div>
        <p className="text-slate-600 text-sm">© {new Date().getFullYear()} ELS POWER Football Club. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

