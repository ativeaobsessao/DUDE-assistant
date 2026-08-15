const fs = require('fs');
let code = fs.readFileSync('src/services/api.ts', 'utf8');

code = code.replace(
  "    .insert([",
  "    .insert(["
);
code = code.replace(
  "        family_id: familyId,",
  "        family_id: familyId,"
);

code = code.replace(
  `    .insert([
      {
        family_id: familyId,
        patient_id: patientId,
        date: date,
        status: 'closed',
        closed_by: closedBy
      }
    ]);`,
  `    .insert([
      {
        family_id: familyId,
        patient_id: patientId,
        date: date,
        status: 'closed',
        closed_by: closedBy
      } as any
    ]);`
);
fs.writeFileSync('src/services/api.ts', code);
