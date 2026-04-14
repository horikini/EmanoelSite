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
  role: 'admin' | 'athlete';
}

export interface MonitoringRecord {
  id?: string;
  athlete_id: string;
  date: string;
  pain: number;
  fatigue: number;
  hydration: string;
  status: string;
}

export interface Appointment {
  id?: string;
  athlete_id: string;
  date: string;
  time: string;
  type: string;
  status: 'pending' | 'confirmed' | 'canceled';
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
  }
};
