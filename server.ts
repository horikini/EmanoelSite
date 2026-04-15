import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from '@supabase/supabase-js';
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/criar-atleta", async (req, res) => {
    try {
      const { email, phone, name } = req.body;

      if (!email || !phone) {
        return res.status(400).json({ error: 'Email e telefone são obrigatórios' });
      }

      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing Supabase configuration in environment variables');
        return res.status(500).json({ error: 'Configuração do servidor incompleta (chaves ausentes)' });
      }

      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });

      const provisionalPassword = phone.replace(/\D/g, '');

      if (provisionalPassword.length < 6) {
        return res.status(400).json({ error: 'O telefone deve ter pelo menos 6 dígitos para ser usado como senha' });
      }

      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: provisionalPassword,
        email_confirm: true,
        user_metadata: {
          full_name: name || '',
          precisa_mudar_senha: true
        }
      });

      if (error) {
        console.error('Erro ao criar usuário no Supabase:', error);
        return res.status(400).json({ error: error.message });
      }

      if (data.user) {
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .update({ 
            phone: phone,
            status: 'active'
          })
          .eq('id', data.user.id);
          
        if (profileError) {
          console.error('Erro ao atualizar perfil:', profileError);
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
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
