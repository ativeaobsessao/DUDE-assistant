const fs = require('fs');
let code = fs.readFileSync('src/pages/History.tsx', 'utf8');

code = code.replace(
  `        getHistoricalMealLogs(pat.id, localDate),
        getHistoricalMedicationLogs(pat.id, localDate)
      ]);`,
  ``
);

fs.writeFileSync('src/pages/History.tsx', code);
