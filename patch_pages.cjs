const fs = require('fs');
let todayCode = fs.readFileSync('src/pages/Today.tsx', 'utf8');
todayCode = todayCode.replace(
  "import { getLocalDateString, getCurrentLocalTime, formatFriendlyDate, getWeekdayName, formatTime } from '../utils/date';",
  "import { getLocalDateString, getCurrentLocalTime, formatFriendlyDate, getWeekdayName, formatTime, formatDateToTime } from '../utils/date';"
);
todayCode = todayCode.replace(
  "new Date(dailyClosure.closed_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })",
  "formatDateToTime(dailyClosure.closed_at)"
);
fs.writeFileSync('src/pages/Today.tsx', todayCode);

let historyCode = fs.readFileSync('src/pages/History.tsx', 'utf8');
if (historyCode.includes("from '../utils/date'")) {
  historyCode = historyCode.replace(
    "import { formatFriendlyDate } from '../utils/date';",
    "import { formatFriendlyDate, formatDateToTime } from '../utils/date';"
  );
} else {
  // Check what is imported
}
historyCode = historyCode.replace(
  "new Date(closure.closed_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })",
  "formatDateToTime(closure.closed_at)"
);
fs.writeFileSync('src/pages/History.tsx', historyCode);
