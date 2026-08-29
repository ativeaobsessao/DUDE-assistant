const fs = require('fs');
let code = fs.readFileSync('src/services/api.ts', 'utf8');
const toInsert = `
export async function deleteDailyClosure(patientId: string, date: string): Promise<boolean> {
  const { error } = await supabase
    .from('daily_closures')
    .delete()
    .eq('patient_id', patientId)
    .eq('date', date);

  if (error) {
    console.error('Error deleting daily closure:', error);
    return false;
  }
  return true;
}
`;
code = code.replace('// --- LOGS ---', toInsert + '\n// --- LOGS ---');
fs.writeFileSync('src/services/api.ts', code);
