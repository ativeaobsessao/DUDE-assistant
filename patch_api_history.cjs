const fs = require('fs');
let code = fs.readFileSync('src/services/api.ts', 'utf8');

// Replace .lt with .lte for historical queries
code = code.replace(
  ".lt('event_date', beforeDate)",
  ".lte('event_date', beforeDate)"
);
code = code.replace(
  ".lt('event_date', beforeDate)",
  ".lte('event_date', beforeDate)"
);

fs.writeFileSync('src/services/api.ts', code);
