const fs = require('fs');
let code = fs.readFileSync('src/components/routine/TimeEditModal.tsx', 'utf8');
code = code.replace(
  "await createMealConfig({ patient_id: patientId, name: name.trim(), scheduled_time, active, display_order: 99 });",
  "await createMealConfig({ patient_id: patientId, name: name.trim(), type: 'custom', scheduled_time, active, display_order: 99 });"
);
fs.writeFileSync('src/components/routine/TimeEditModal.tsx', code);
