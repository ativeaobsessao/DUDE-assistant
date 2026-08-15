const fs = require('fs');
let code = fs.readFileSync('src/services/api.ts', 'utf8');

const newFunctions = `
// --- DAILY CLOSURES ---
export async function getDailyClosure(patientId: string, date: string): Promise<any | null> {
  const { data, error } = await supabase
    .from('daily_closures')
    .select('*, closed_by_profile:profiles!daily_closures_closed_by_fkey(name)')
    .eq('patient_id', patientId)
    .eq('date', date)
    .single();
    
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching daily closure:', error);
    return null;
  }
  return data || null;
}

export async function getHistoricalDailyClosures(patientId: string, beforeDate: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('daily_closures')
    .select('*, closed_by_profile:profiles!daily_closures_closed_by_fkey(name)')
    .eq('patient_id', patientId)
    .lte('date', beforeDate)
    .order('date', { ascending: false });
    
  if (error) {
    console.error('Error fetching historical closures:', error);
    return [];
  }
  return data || [];
}

export async function createDailyClosure(familyId: string, patientId: string, date: string, closedBy: string): Promise<boolean> {
  const { error } = await supabase
    .from('daily_closures')
    .insert([
      {
        family_id: familyId,
        patient_id: patientId,
        date: date,
        status: 'closed',
        closed_by: closedBy
      }
    ]);
    
  if (error) {
    console.error('Error creating daily closure:', error);
    return false;
  }
  return true;
}

`;

code = code.replace(
  "// --- LOGS ---",
  newFunctions + "// --- LOGS ---"
);

fs.writeFileSync('src/services/api.ts', code);
