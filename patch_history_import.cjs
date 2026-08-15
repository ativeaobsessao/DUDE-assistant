const fs = require('fs');
let historyCode = fs.readFileSync('src/pages/History.tsx', 'utf8');
historyCode = historyCode.replace(
  "import { getLocalDateString } from '../utils/date';",
  "import { getLocalDateString, formatDateToTime } from '../utils/date';"
);
fs.writeFileSync('src/pages/History.tsx', historyCode);
