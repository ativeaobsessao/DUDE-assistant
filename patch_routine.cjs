const fs = require('fs');
let code = fs.readFileSync('src/pages/Routine.tsx', 'utf8');
code = code.replace(
  "import { getPatientMedications, getPatientMeals, getPatientMedicationPeriods, deleteMeal, deleteMedication } from '../services/api';",
  "import { getPatientMedications, getPatientMeals, getPatientMedicationPeriods, deleteMeal, deleteMedication } from '../services/api';\nimport { formatTime } from '../utils/date';"
);
code = code.replace(
  "meal.scheduled_time.slice(0, 5)",
  "formatTime(meal.scheduled_time)"
);
code = code.replace(
  "period.scheduled_time.slice(0, 5)",
  "formatTime(period.scheduled_time)"
);
fs.writeFileSync('src/pages/Routine.tsx', code);
