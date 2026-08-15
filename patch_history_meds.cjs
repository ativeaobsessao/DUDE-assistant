const fs = require('fs');
let code = fs.readFileSync('src/pages/History.tsx', 'utf8');

code = code.replace(
  "        const periodId = log.medication?.medication_period_id;\n        \n        if (!periodId) continue;",
  "        const periodId = log.medication?.medication_period_id || 'unknown_period';"
);

code = code.replace(
  "          const period = logs[0].medication?.period || { id: periodId, time: '00:00:00' };\n          const medications = logs.map(l => l.medication).filter(Boolean);\n          \n          groups[dateStr].push({\n            id: periodId,\n            type: 'medication_period',\n            time: period.time,",
  "          const period = logs[0].medication?.period || { id: periodId, time: '00:00:00' };\n          const medications = logs.map(l => l.medication).filter(Boolean);\n          const fallbackTime = logs[0].created_at ? logs[0].created_at.substring(11, 16) + ':00' : '00:00:00';\n          \n          groups[dateStr].push({\n            id: periodId,\n            type: 'medication_period',\n            time: period.time || fallbackTime,"
);

fs.writeFileSync('src/pages/History.tsx', code);
