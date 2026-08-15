const fs = require('fs');
let code = fs.readFileSync('src/services/api.ts', 'utf8');

code = code.replace(
  ".select('*, medication:medications(*, period:medication_periods(*))')",
  ".select('*, medication:medications(*, period:medication_periods(*)), creator:profiles!medication_logs_created_by_fkey(name)')"
);

code = code.replace(
  "export async function getMedicationLogs(patientId: string, eventDate: string): Promise<MedicationLog[]> {\n  const { data, error } = await supabase\n    .from('medication_logs')\n    .select('*')\n    .eq('patient_id', patientId)",
  "export async function getMedicationLogs(patientId: string, eventDate: string): Promise<any[]> {\n  const { data, error } = await supabase\n    .from('medication_logs')\n    .select('*, creator:profiles!medication_logs_created_by_fkey(name)')\n    .eq('patient_id', patientId)"
);

code = code.replace(
  "export async function logMedication(log: Database['public']['Tables']['medication_logs']['Insert']) {\n  const { error } = await supabase\n    .from('medication_logs')\n    .insert(log as any);",
  "export async function logMedication(log: Database['public']['Tables']['medication_logs']['Insert']) {\n  const { error } = await supabase\n    .from('medication_logs')\n    .insert(log as any);"
);

fs.writeFileSync('src/services/api.ts', code);
