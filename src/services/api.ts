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
    .single();

  if (error) throw error;
  return data;
}

// --- CONFIGURATION ---

export async function getPatient(familyId: string): Promise<Patient | null> {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('family_id', familyId)
    .single();

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

export async function getMealLogs(patientId: string, eventDate: string): Promise<MealLog[]> {
  const { data, error } = await supabase
    .from('meal_logs')
    .select('*')
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
    .insert(log)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateMealLog(id: string, log: Database['public']['Tables']['meal_logs']['Update']) {
  const { data, error } = await supabase
    .from('meal_logs')
    .update(log)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createMedicationLog(log: Database['public']['Tables']['medication_logs']['Insert']) {
  const { data, error } = await supabase
    .from('medication_logs')
    .insert(log)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateMedicationLog(id: string, log: Database['public']['Tables']['medication_logs']['Update']) {
  const { data, error } = await supabase
    .from('medication_logs')
    .update(log)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// --- STORAGE ---

export async function uploadMealPhoto(patientId: string, file: File, fileName: string) {
  // Format: families/family_id/patients/patient_id/...
  // For simplicity, we just use patient_id since RLS protects it anyway, but we should adhere to structure
  // We can just use /patient_id/YYYY/MM/DD/filename
  const filePath = `${patientId}/${fileName}`;
  const { data, error } = await supabase
    .storage
    .from('meal-records')
    .upload(filePath, file);

  if (error) throw error;
  return data;
}
