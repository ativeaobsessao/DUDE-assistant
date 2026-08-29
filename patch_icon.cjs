const fs = require('fs');
let code = fs.readFileSync('src/pages/Today.tsx', 'utf8');
code = code.replace("import type { TimelineEvent, MealEventData, MedicationEventData } from '../types/timeline';", "import type { TimelineEvent, MealEventData, MedicationEventData } from '../types/timeline';\nimport { Unlock } from 'lucide-react';");
code = code.replace('<svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">\n                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />\n                  </svg>', '<Unlock className="w-4 h-4 mr-2" />');
fs.writeFileSync('src/pages/Today.tsx', code);
