import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, phone, name } = req.body;

    if (!email || !phone) {
      return res.status(400).json({ error: 'Email e telefone são obrigatórios' });
    }

    // Inicializar o cliente do Supabase com a chave de serviço (Service Role Key)
    // ATENÇÃO: Esta chave NUNCA deve ser exposta no frontend
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({ error: 'Configuração do servidor incompleta' });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // A senha provisória será o telefone (com DDD)
    const provisionalPassword = phone.replace(/\D/g, ''); // Remove caracteres não numéricos

    if (provisionalPassword.length < 6) {
      return res.status(400).json({ error: 'O telefone deve ter pelo menos 6 dígitos para ser usado como senha' });
    }

    // Criar o usuário usando a API de Admin do Supabase
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: provisionalPassword,
      email_confirm: true, // Auto-confirmar o email
      user_metadata: {
        full_name: name || '',
        precisa_mudar_senha: true // Flag importante para o fluxo de login
      }
    });

    if (error) {
      console.error('Erro ao criar usuário no Supabase:', error);
      return res.status(400).json({ error: error.message });
    }

    // Opcional: Criar o perfil na tabela profiles (se o trigger não fizer isso automaticamente)
    // Como o trigger já faz, não precisamos fazer aqui, mas podemos atualizar o telefone
    if (data.user) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ 
          phone: phone,
          status: 'active' // Já ativa o atleta pois foi criado pelo admin
        })
        .eq('id', data.user.id);
        
      if (profileError) {
        console.error('Erro ao atualizar perfil:', profileError);
        // Não falhamos a requisição pois o usuário foi criado, mas logamos o erro
      }
    }

    return res.status(200).json({ 
      success: true, 
      user: data.user,
      message: 'Atleta criado com sucesso' 
    });

  } catch (error: any) {
    console.error('Erro interno:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
