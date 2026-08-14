import { supabase } from './supabase';
import type { Database } from '../types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Family = Database['public']['Tables']['families']['Row'];
type Patient = Database['public']['Tables']['patients']['Row'];
type MealConfig = Database['public']['Tables']['meal_configs']['Row'];
type MedicationPeriod = Database['public']['Tables']['medication_periods']['Row'];
type Medication = Database['public']['Tables']['medications']['Row'];
type MealLog = Database['public']['Tables']['meal_logs']['Row'];
type MedicationLog = Database['public']['Tables']['medication_logs']['Row'];

// --- AUTH & PROFILES ---

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// --- CONFIGURATION ---

export async function getPatient(familyId: string): Promise<Patient | null> {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('family_id', familyId)
    .maybeSingle();

  // If there are multiple patients, we might want to return a list, but MVP has one.
  if (error) throw error;
  return data;
}

export async function getMealConfigs(patientId: string): Promise<MealConfig[]> {
  const { data, error } = await supabase
    .from('meal_configs')
    .select('*')
    .eq('patient_id', patientId)
    .eq('active', true)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getMedicationPeriods(patientId: string): Promise<MedicationPeriod[]> {
  const { data, error } = await supabase
    .from('medication_periods')
    .select('*')
    .eq('patient_id', patientId)
    .eq('active', true)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getMedications(patientId: string): Promise<Medication[]> {
  const { data, error } = await supabase
    .from('medications')
    .select('*')
    .eq('patient_id', patientId)
    .eq('active', true);

  if (error) throw error;
  return data;
}

// --- LOGS ---

export async function getMealLogs(patientId: string, eventDate: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('meal_logs')
    .select('*, creator:profiles!meal_logs_created_by_fkey(name)')
    .eq('patient_id', patientId)
    .eq('event_date', eventDate);

  if (error) throw error;
  return data;
}

export async function getMedicationLogs(patientId: string, eventDate: string): Promise<MedicationLog[]> {
  const { data, error } = await supabase
    .from('medication_logs')
    .select('*')
    .eq('patient_id', patientId)
    .eq('event_date', eventDate);

  if (error) throw error;
  return data;
}

export async function createMealLog(log: Database['public']['Tables']['meal_logs']['Insert']) {
  const { data, error } = await supabase
    .from('meal_logs')
    .insert(log as any)
    .select('*, creator:profiles!meal_logs_created_by_fkey(name)')
    .single();

  if (error) {
    if (error.code === 'PGRST204') {
      console.error("ERRO CRÍTICO: A coluna 'meal_time' não existe no banco. É necessário rodar a migration 0004_add_meal_time.sql no Supabase.");
    }
    throw error;
  }
  return data;
}

export async function updateMealLog(id: string, log: Database['public']['Tables']['meal_logs']['Update']) {
  const { data, error } = await supabase
    .from('meal_logs')
    // @ts-expect-error Supabase strict types fail here
    .update(log)
    .eq('id', id)
    .select('*, creator:profiles!meal_logs_created_by_fkey(name)')
    .single();

  if (error) {
    if (error.code === 'PGRST204') {
      console.error("ERRO CRÍTICO: A coluna 'meal_time' não existe no banco. É necessário rodar a migration 0004_add_meal_time.sql no Supabase.");
    }
    throw error;
  }
  return data;
}

export async function createMedicationLog(log: Database['public']['Tables']['medication_logs']['Insert']) {
  const { data, error } = await supabase
    .from('medication_logs')
    .insert(log as any)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateMedicationLog(id: string, log: Database['public']['Tables']['medication_logs']['Update']) {
  const { data, error } = await supabase
    .from('medication_logs')
    // @ts-expect-error Supabase strict types fail here
    .update(log)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// --- STORAGE ---

export async function getPatientPhotoUrl(patientId: string, path: string): Promise<string | null> {
  if (!path) return null;
  const { data, error } = await supabase.storage.from('patient-profile').createSignedUrl(path, 60 * 60 * 24); // 24 hours
  if (error) {
    console.error('Error getting patient photo:', error);
    return null;
  }
  return data.signedUrl;
}

export async function getMealPhotoUrl(path: string): Promise<string | null> {
  if (!path) return null;
  const { data, error } = await supabase.storage.from('meal-records').createSignedUrl(path, 60 * 60 * 24); // 24 hours
  if (error) {
    console.error('Error getting meal photo:', error);
    return null;
  }
  return data.signedUrl;
}

export async function uploadMealPhoto(patientId: string, file: File, fileName: string) {
  // We use patientId as the root folder for RLS checks
  const filePath = `${patientId}/${fileName}`;
  const { data, error } = await supabase
    .storage
    .from('meal-records')
    .upload(filePath, file);

  if (error) throw error;
  return data;
}

// --- SETUP & ROUTINE MUTATIONS ---

export async function createPatient(patient: Database['public']['Tables']['patients']['Insert']) {
  const { data, error } = await supabase.from('patients').insert(patient as any).select().single();
  if (error) {
    console.error("=== ERRO AO SALVAR PACIENTE ===");
    console.error("Operação: INSERT");
    console.error("Tabela: patients");
    console.error("Payload:", JSON.stringify(patient, null, 2));
    console.error("Código Supabase:", error.code);
    console.error("Mensagem:", error.message);
    console.error("Detalhes:", error.details);
    console.error("Dica (Hint):", error.hint);
    console.error("===============================");
    throw error;
  }
  return data;
}

export async function updatePatient(id: string, patient: Database['public']['Tables']['patients']['Update']) {
  const { data, error } = await supabase.from('patients').update(patient as any).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function uploadPatientPhoto(patientId: string, file: File, fileName: string) {
  const filePath = `${patientId}/${fileName}`;
  const { data, error } = await supabase.storage.from('patient-profile').upload(filePath, file, { upsert: true });
  if (error) throw error;
  return data;
}

export async function createMealConfig(config: Database['public']['Tables']['meal_configs']['Insert']) {
  const { data, error } = await supabase.from('meal_configs').insert(config as any).select().single();
  if (error) throw error;
  return data;
}

export async function updateMealConfig(id: string, config: Database['public']['Tables']['meal_configs']['Update']) {
  const { data, error } = await supabase.from('meal_configs').update(config as any).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function createMedicationPeriod(period: Database['public']['Tables']['medication_periods']['Insert']) {
  const { data, error } = await supabase.from('medication_periods').insert(period as any).select().single();
  if (error) throw error;
  return data;
}

export async function updateMedicationPeriod(id: string, period: Database['public']['Tables']['medication_periods']['Update']) {
  const { data, error } = await supabase.from('medication_periods').update(period as any).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function createMedication(med: Database['public']['Tables']['medications']['Insert']) {
  const { data, error } = await supabase.from('medications').insert(med as any).select().single();
  if (error) throw error;
  return data;
}

export async function updateMedication(id: string, med: Database['public']['Tables']['medications']['Update']) {
  const { data, error } = await supabase.from('medications').update(med as any).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function seedInitialRoutine(patientId: string) {
  await supabase.from('meal_configs').insert([
    { patient_id: patientId, name: 'Café da manhã', type: 'breakfast', scheduled_time: '08:00', display_order: 1 },
    { patient_id: patientId, name: 'Almoço', type: 'lunch', scheduled_time: '12:30', display_order: 2 },
    { patient_id: patientId, name: 'Lanche da tarde', type: 'snack', scheduled_time: '16:00', display_order: 3 },
    { patient_id: patientId, name: 'Jantar', type: 'dinner', scheduled_time: '19:30', display_order: 4 },
  ] as any);

  await supabase.from('medication_periods').insert([
    { patient_id: patientId, name: 'Antes do café', scheduled_time: '07:30', display_order: 1 },
    { patient_id: patientId, name: 'Depois do café', scheduled_time: '08:30', display_order: 2 },
    { patient_id: patientId, name: 'Depois do almoço', scheduled_time: '13:00', display_order: 3 },
    { patient_id: patientId, name: 'Depois do jantar', scheduled_time: '20:00', display_order: 4 },
  ] as any);
}
