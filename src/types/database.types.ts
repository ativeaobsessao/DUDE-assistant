export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      families: {
        Row: {
          id: string
          name: string
          timezone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          timezone?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          timezone?: string
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          family_id: string
          name: string
          email: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          family_id: string
          name: string
          email: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          name?: string
          email?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      patients: {
        Row: {
          id: string
          family_id: string
          name: string
          photo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          family_id: string
          name: string
          photo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          name?: string
          photo_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      meal_configs: {
        Row: {
          id: string
          patient_id: string
          name: string
          type: string
          scheduled_time: string
          display_order: number
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          name: string
          type: string
          scheduled_time: string
          display_order?: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          name?: string
          type?: string
          scheduled_time?: string
          display_order?: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      medication_periods: {
        Row: {
          id: string
          patient_id: string
          name: string
          scheduled_time: string
          display_order: number
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          name: string
          scheduled_time: string
          display_order?: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          name?: string
          scheduled_time?: string
          display_order?: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      medications: {
        Row: {
          id: string
          patient_id: string
          medication_period_id: string
          name: string
          dosage: string
          frequency: 'daily' | 'weekly'
          weekday: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          medication_period_id: string
          name: string
          dosage: string
          frequency: 'daily' | 'weekly'
          weekday?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          medication_period_id?: string
          name?: string
          dosage?: string
          frequency?: 'daily' | 'weekly'
          weekday?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      meal_logs: {
        Row: {
          id: string
          meal_config_id: string
          patient_id: string
          event_date: string
          consumption_status: 'normal' | 'partial' | 'none'
          description: string | null
          notes: string | null
          photo_url: string | null
          meal_time: string | null
          created_by: string
          created_at: string
          updated_by: string
          updated_at: string
        }
        Insert: {
          id?: string
          meal_config_id: string
          patient_id: string
          event_date: string
          consumption_status: 'normal' | 'partial' | 'none'
          description?: string | null
          notes?: string | null
          photo_url?: string | null
          meal_time?: string | null
          created_by: string
          created_at?: string
          updated_by: string
          updated_at?: string
        }
        Update: {
          id?: string
          meal_config_id?: string
          patient_id?: string
          event_date?: string
          consumption_status?: 'normal' | 'partial' | 'none'
          description?: string | null
          notes?: string | null
          photo_url?: string | null
          meal_time?: string | null
          created_by?: string
          created_at?: string
          updated_by?: string
          updated_at?: string
        }
      }
      medication_logs: {
        Row: {
          id: string
          medication_id: string
          patient_id: string
          event_date: string
          status: 'administered' | 'not_administered'
          reason: string | null
          notes: string | null
          administered_at: string | null
          created_by: string
          created_at: string
          updated_by: string
          updated_at: string
        }
        Insert: {
          id?: string
          medication_id: string
          patient_id: string
          event_date: string
          status: 'administered' | 'not_administered'
          reason?: string | null
          notes?: string | null
          administered_at?: string | null
          created_by: string
          created_at?: string
          updated_by: string
          updated_at?: string
        }
        Update: {
          id?: string
          medication_id?: string
          patient_id?: string
          event_date?: string
          status?: 'administered' | 'not_administered'
          reason?: string | null
          notes?: string | null
          administered_at?: string | null
          created_by?: string
          created_at?: string
          updated_by?: string
          updated_at?: string
        }
      }
    }
  }
}
