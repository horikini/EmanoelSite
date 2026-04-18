import { supabase } from './supabase';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  dob?: string;
  city?: string;
  registration_date?: string;
  target_training?: string;
  position1?: string;
  position2?: string;
  photo?: string;
  role: 'admin' | 'athlete' | 'user';
  status?: 'pending' | 'active' | 'blocked';
}

export interface MonitoringRecord {
  id?: string;
  athlete_id: string;
  date: string;
  pain: number;
  fatigue: number;
  hydration: string;
  status: string;
  pain_location?: string;
}

export interface Appointment {
  id?: string;
  athlete_id: string;
  date: string;
  time: string;
  type: string;
  status: 'pending' | 'confirmed' | 'canceled';
}

export interface Evaluation {
  id?: string;
  athlete_id: string;
  date: string;
  type: 'physical' | 'specific';
  data: any;
}

export const supabaseService = {
  // Profiles
  async getProfiles() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name');
    if (error) throw error;
    return data as Profile[];
  },

  async getProfile(id: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as Profile;
  },

  async updateProfile(id: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
    return data;
  },

  // Monitoring
  async getMonitoringRecords(athleteId?: string) {
    let query = supabase.from('monitoring').select('*, profiles(full_name, phone)');
    if (athleteId) {
      query = query.eq('athlete_id', athleteId);
    }
    const { data, error } = await query.order('date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async addMonitoringRecord(record: MonitoringRecord) {
    const { data, error } = await supabase
      .from('monitoring')
      .insert([record]);
    if (error) throw error;
    return data;
  },

  // Appointments
  async getAppointments(athleteId?: string) {
    let query = supabase.from('appointments').select('*, profiles(full_name)');
    if (athleteId) {
      query = query.eq('athlete_id', athleteId);
    }
    const { data, error } = await query.order('date').order('time');
    if (error) throw error;
    return data;
  },

  async addAppointment(appointment: Appointment) {
    const { data, error } = await supabase
      .from('appointments')
      .insert([appointment]);
    if (error) throw error;
    return data;
  },

  async updateAppointmentStatus(id: string, status: string) {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id);
    if (error) throw error;
    return data;
  },

  // Evaluations
  async getEvaluations(athleteId: string) {
    const { data, error } = await supabase
      .from('evaluations')
      .select('*')
      .eq('athlete_id', athleteId)
      .order('date', { ascending: true });
    if (error) throw error;
    return data;
  },

  async getAllEvaluations() {
    const { data, error } = await supabase
      .from('evaluations')
      .select('*, profiles!evaluations_athlete_id_fkey(full_name)');
    if (error) {
      // Fallback if relation is not set
      const fallback = await supabase.from('evaluations').select('*');
      return fallback.data || [];
    }
    return data || [];
  },

  async addEvaluation(athleteId: string, evaluationData: any) {
    const { data, error } = await supabase
      .from('evaluations')
      .insert([{
        athlete_id: athleteId,
        date: evaluationData.date,
        is_liberated: evaluationData.isLiberated || false,
        data: evaluationData
      }]);
    if (error) throw error;
    return data;
  },

  async updateEvaluation(id: string, updates: any) {
    const { data, error } = await supabase
      .from('evaluations')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
    return data;
  },

  // Messages
  async getMessages(athleteId: string) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*, profiles!messages_author_id_fkey(full_name)')
        .eq('athlete_id', athleteId)
        .order('created_at', { ascending: true });
      if (error) {
        if (error.code === 'PGRST205') {
          console.warn('Tabela "messages" não encontrada. Por favor, execute o script SQL no Supabase.');
          return [];
        }
        throw error;
      }
      return data;
    } catch (err) {
      console.error('Error loading messages:', err);
      return [];
    }
  },

  async getAllMessages() {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*, profiles!messages_author_id_fkey(full_name)')
        .order('created_at', { ascending: false });
      if (error) {
        if (error.code === 'PGRST205') {
          console.warn('Tabela "messages" não encontrada. Por favor, execute o script SQL no Supabase.');
          return [];
        }
        throw error;
      }
      return data;
    } catch (err) {
      console.error('Error loading all messages:', err);
      return [];
    }
  },

  async addMessage(athleteId: string, authorId: string, text: string) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          athlete_id: athleteId,
          author_id: authorId,
          text: text
        }]);
      if (error) {
        if (error.code === 'PGRST205') {
          console.error('Tabela "messages" não encontrada. Não foi possível enviar a mensagem.');
          return null;
        }
        throw error;
      }
      return data;
    } catch (err) {
      console.error('Error adding message:', err);
      return null;
    }
  },

  cleanMessageText(text: string) {
    if (!text) return '';
    return text.replace(/^\[Mural - \w+\] /, '');
  },

  // Access Logs
  async logAccess(userId: string) {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Check if already logged today
      const { data: existing, error: checkError } = await supabase
        .from('access_logs')
        .select('id')
        .eq('user_id', userId)
        .eq('date', today)
        .limit(1);

      if (checkError) {
        if (checkError.code === 'PGRST205') {
          // Table missing, silent ignore for logging
          return;
        }
        throw checkError;
      }

      if (existing && existing.length > 0) return;

      const { error: insertError } = await supabase
        .from('access_logs')
        .insert([{ user_id: userId, date: today }]);
      
      if (insertError) {
        if (insertError.code !== 'PGRST205') {
          console.error('Error logging access:', insertError);
        }
      }
    } catch (err) {
      // Slient fail for access logs to not disrupt user experience
    }
  },

  async getAllAccessLogs() {
    try {
      const { data, error } = await supabase
        .from('access_logs')
        .select('user_id, date');
      if (error) {
        if (error.code === 'PGRST205') return [];
        throw error;
      }
      return data;
    } catch (err) {
      return [];
    }
  },

  async getAccessLogs(userId: string) {
    try {
      const { data, error } = await supabase
        .from('access_logs')
        .select('date')
        .eq('user_id', userId);
      if (error) {
        if (error.code === 'PGRST205') return [];
        throw error;
      }
      return data;
    } catch (err) {
      return [];
    }
  },

  async deleteProfile(userId: string) {
    // Delete related data first (just in case cascade isn't set)
    await supabase.from('monitoring').delete().eq('athlete_id', userId);
    await supabase.from('evaluations').delete().eq('athlete_id', userId);
    await supabase.from('appointments').delete().eq('athlete_id', userId);
    await supabase.from('messages').delete().eq('athlete_id', userId);
    await supabase.from('access_logs').delete().eq('user_id', userId);
    
    // Finally delete the profile
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (error) throw error;
    return true;
  }
};
