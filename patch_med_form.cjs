const fs = require('fs');
let code = fs.readFileSync('src/components/routine/MedicationFormModal.tsx', 'utf8');

code = code.replace(
  "import { Button } from '../ui/Button';",
  "import { Button } from '../ui/Button';\nimport { formatTime } from '../../utils/date';"
);

code = code.replace(
  "p.scheduled_time.slice(0, 5)",
  "formatTime(p.scheduled_time)"
);

fs.writeFileSync('src/components/routine/MedicationFormModal.tsx', code);
