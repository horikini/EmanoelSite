import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ChevronRight, Zap, Trophy, Dumbbell, Target, HeartPulse, LineChart, Utensils, ShieldCheck, Lock, Users } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-x-hidden relative">
      {/* Global Speed Lines Effect */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-25 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-[300%] w-[1px] bg-gradient-to-b from-transparent via-white to-transparent"
            style={{ 
              left: `${5 + i * 8}%`,
              top: '-100%',
              opacity: 0.1 + Math.random() * 0.3
            }}
            animate={{ y: ['0%', '100%'] }}
            transition={{
              duration: 0.5 + Math.random() * 1.5,
              repeat: Infinity,
              ease: 'linear',
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 p-4 flex flex-col items-center gap-6 bg-gradient-to-b from-slate-950/90 via-slate-950/50 to-transparent pb-12">
        <div className="flex items-center justify-center w-full mt-4">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-5 rounded-[2rem] shadow-[0_0_50px_rgba(249,115,22,0.15)] flex items-center justify-center">
            <img 
              src="/logo.png" 
              alt="ELS POWER Logo" 
              className="h-28 md:h-36 w-auto object-contain drop-shadow-2xl"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            to="/login"
            className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/50 text-orange-400 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-orange-500 hover:text-white transition-all"
          >
            <Lock size={12} />
            ATLETA
          </Link>
          <Link
            to="/login"
            className="flex items-center gap-2 bg-slate-800/50 border border-slate-700 text-slate-300 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-slate-700 transition-all"
          >
            <Lock size={12} />
            EQUIPE
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-56 pb-20 px-4 min-h-[90vh] flex flex-col justify-center overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1518605368461-1e1252220a4c?q=80&w=2000&auto=format&fit=crop"
            alt="Soccer Training"
            className="w-full h-full object-cover opacity-30"
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
            className="text-4xl font-black uppercase italic tracking-tighter leading-[1.1] mb-6"
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
            className="text-slate-300 text-base mb-8 max-w-2xl leading-relaxed"
          >
            Preparação física e técnica especializada em futebol. Transformamos seu potencial em performance real dentro de campo com metodologia comprovada.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col gap-3 w-full"
          >
            <a
              href="#treinamentos"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-base py-3 px-6 rounded-xl shadow-lg active:scale-[0.98] transition-all"
            >
              INICIAR TREINAMENTO
              <ChevronRight size={20} />
            </a>
            <a
              href="#treinamentos"
              className="flex items-center justify-center gap-2 bg-slate-900 border border-slate-800 text-white font-bold text-base py-3 px-6 rounded-xl active:scale-[0.98] transition-all"
            >
              CONHEÇA O MÉTODO
            </a>
          </motion.div>
        </div>
      </section>

      {/* Metodologia / Tipos de Treinamento */}
      <section id="treinamentos" className="py-24 px-4 relative z-10 bg-transparent">
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

      {/* Treinamento Funcional e Força */}
      <section className="py-24 px-4 relative z-10 bg-transparent overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-sm font-bold border border-orange-500/20">
                <Zap size={16} />
                <span>MOVIMENTO E AGILIDADE</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black italic leading-tight uppercase">
                Treinamento <span className="text-orange-500">Funcional</span>
              </h2>
              <p className="text-slate-300 text-lg leading-relaxed">
                Desenvolvemos padrões de movimento específicos do futebol. Nosso funcional não é apenas exercício, é transferência direta para o campo: estabilidade, coordenação e controle motor sob fadiga.
              </p>
              <div className="flex gap-4">
                <div className="flex-1 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                  <p className="text-orange-500 font-bold text-xl">Core</p>
                  <p className="text-slate-400 text-sm">Estabilidade central para proteção e potência.</p>
                </div>
                <div className="flex-1 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                  <p className="text-orange-500 font-bold text-xl">SAQ</p>
                  <p className="text-slate-400 text-sm">Speed, Agility and Quickness (Velocidade e Agilidade).</p>
                </div>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="absolute -inset-4 bg-orange-500/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <img 
                src="https://images.unsplash.com/photo-1511886929837-354d827aae26?q=80&w=1000&auto=format&fit=crop" 
                alt="Treino Funcional" 
                className="relative rounded-3xl border border-slate-800 shadow-2xl w-full h-[450px] object-cover grayscale hover:grayscale-0 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-slate-950/80 to-transparent opacity-60" />
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative group order-2 lg:order-1"
            >
              <div className="absolute -inset-4 bg-blue-500/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <img 
                src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1000&auto=format&fit=crop" 
                alt="Treino de Força" 
                className="relative rounded-3xl border border-slate-800 shadow-2xl w-full h-[450px] object-cover grayscale hover:grayscale-0 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-slate-950/80 to-transparent opacity-60" />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6 order-1 lg:order-2"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm font-bold border border-blue-500/20">
                <Dumbbell size={16} />
                <span>POTÊNCIA E RESILIÊNCIA</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black italic leading-tight uppercase">
                Força e <span className="text-blue-500">Reabilitação</span>
              </h2>
              <p className="text-slate-300 text-lg leading-relaxed">
                A força é a base de todas as capacidades físicas. Nosso programa de força foca em potência explosiva e na reabilitação proativa, garantindo que você volte de lesões mais forte do que antes.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-slate-900/80 p-4 rounded-2xl border-l-4 border-blue-500">
                  <ShieldCheck className="text-blue-500" size={24} />
                  <p className="text-slate-200 font-medium">Protocolos de Retorno ao Jogo (Return to Play)</p>
                </div>
                <div className="flex items-center gap-4 bg-slate-900/80 p-4 rounded-2xl border-l-4 border-blue-500">
                  <Zap className="text-blue-500" size={24} />
                  <p className="text-slate-200 font-medium">Treinamento de Força Reativa e Pliometria</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Planilha e Acompanhamento */}
      <section className="py-24 px-4 relative z-10 bg-slate-900/40 backdrop-blur-md overflow-hidden">
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
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop" 
              alt="Análise de Dados" 
              className="relative rounded-3xl border border-slate-700 shadow-2xl w-full object-cover h-[400px]"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </section>

      {/* Galeria de Treinamento em Ação */}
      <section className="py-24 px-4 relative z-10 bg-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black italic mb-4">TREINAMENTO EM AÇÃO</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">Veja como preparamos nossos atletas para o topo do futebol mundial.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[800px] md:h-[600px]">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="md:col-span-2 md:row-span-2 relative group overflow-hidden rounded-3xl border border-slate-800"
            >
              <img 
                src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop" 
                alt="Performance de Jogo" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-6 left-6">
                <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Alta Intensidade</span>
                <h4 className="text-2xl font-bold mt-2">Simulação de Jogo Real</h4>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative group overflow-hidden rounded-3xl border border-slate-800"
            >
              <img 
                src="https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?q=80&w=800&auto=format&fit=crop" 
                alt="Treino de Agilidade" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-4 left-4">
                <h4 className="text-lg font-bold">Agilidade e Coordenação</h4>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative group overflow-hidden rounded-3xl border border-slate-800"
            >
              <img 
                src="https://images.unsplash.com/photo-1526232761682-d26e03ac148e?q=80&w=800&auto=format&fit=crop" 
                alt="Explosão Muscular" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-4 left-4">
                <h4 className="text-lg font-bold">Potência Explosiva</h4>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Equipe / Time */}
      <section className="py-24 px-4 relative z-10 bg-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-sm font-bold border border-orange-500/20 mb-4">
              <Users size={16} />
              <span>NOSSA EQUIPE</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black italic mb-4">O TIME POR TRÁS DO SEU SUCESSO</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">Especialistas dedicados a transformar seu potencial em performance de elite.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Manuel Lima",
                role: "Treinador de Físico",
                desc: "Passagens pelo Santos, Tatuaté e Rio Claro",
                img: "/Manuel.jpg"
              },
              {
                name: "Thiago José",
                role: "Professor e Coaching",
                desc: "Passagens pelo UNIÃO e FORÇA, Clube Regatas Brasil, Operario Ferroviario, Redbulls Bragantino e Palmeiras",
                img: "/Thiago.jpg"
              },
              {
                name: "Amir Horiquini",
                role: "Nutricionista CRN3 73522",
                desc: "Mestre em Biociências - USP. Doutorando em Biotecnologia da saúde",
                img: "/Amir.jpg"
              }
            ].map((member, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-900/40 backdrop-blur-sm border border-slate-800 p-8 rounded-[2.5rem] text-center group hover:border-orange-500/30 transition-all duration-500"
              >
                <div className="relative w-40 h-40 mx-auto mb-6">
                  {/* Rotating Ring */}
                  <motion.div 
                    className="absolute -inset-2 rounded-full border border-dashed border-orange-500/40"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  />
                  <div className="w-full h-full rounded-full overflow-hidden border-4 border-slate-800 relative z-10 shadow-2xl">
                    <img 
                      src={member.img} 
                      alt={member.name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100"
                      onError={(e) => {
                        e.currentTarget.src = `https://picsum.photos/seed/${member.name}/400/400`;
                      }}
                    />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{member.name}</h3>
                <p className="text-orange-500 font-bold text-sm uppercase tracking-wider mb-4">{member.role}</p>
                <p className="text-slate-400 text-sm leading-relaxed">{member.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Parceria Nutricional */}
      <section className="py-24 px-4 relative z-10 bg-transparent">
        <div className="max-w-3xl mx-auto flex flex-col items-center text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-sm font-bold border border-green-500/20">
            <Utensils size={16} />
            <span>O COMBUSTÍVEL DO CAMPEÃO</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black italic leading-tight">
            Nutricionista <span className="text-green-500">Funcional</span>
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed">
            O treino destrói, a alimentação constrói. Para garantir que você tenha a melhor recuperação e energia em campo, oferecemos acompanhamento nutricional especializado.
          </p>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl mt-6 text-left w-full">
            <h4 className="font-bold text-xl mb-2 flex items-center gap-2">
              <Trophy className="text-yellow-500" size={20} />
              Vantagens da Parceria
            </h4>
            <p className="text-slate-400">Planos alimentares focados em ganho de massa, perda de percentual de gordura e estratégias de suplementação para dias de jogos e treinos intensos.</p>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 px-4 relative z-10 bg-slate-900/40 backdrop-blur-md text-center overflow-hidden border-t border-slate-800">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 mix-blend-overlay"></div>
        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
          <h2 className="text-4xl md:text-6xl font-black italic mb-6 uppercase drop-shadow-lg">
            Pronto para mudar de patamar?
          </h2>
          <p className="text-slate-300 text-xl mb-10">
            Junte-se à ELS POWER e tenha acesso ao treinamento, acompanhamento e estrutura que os atletas profissionais utilizam.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-base py-3 px-6 rounded-xl shadow-lg active:scale-[0.98] transition-all"
          >
            INICIAR TREINAMENTO
            <ChevronRight size={20} />
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="relative z-10 bg-slate-950/80 backdrop-blur-md text-center border-t border-slate-900">
        {/* Fita Branca com Logo */}
        <div className="w-full bg-white py-4 flex justify-center items-center shadow-[0_0_20px_rgba(255,255,255,0.1)]">
          <img 
            src="/logo.png" 
            alt="ELS POWER Logo" 
            className="h-12 w-auto object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
        
        <div className="py-10 px-4">
          <div className="space-y-2 mb-6 text-slate-400 text-sm">
            <p className="font-bold text-slate-200 uppercase tracking-widest">Barretos - SP</p>
            <p>Atendimento Online</p>
            <p>Acompanhamento Virtual</p>
          </div>
          <p className="text-slate-600 text-xs">© {new Date().getFullYear()} ELS POWER Football Club. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

