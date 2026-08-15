const fs = require('fs');
let code = fs.readFileSync('src/pages/History.tsx', 'utf8');
code = code.replace(
  "function HistoryDayGroup({ \n  dateStr, \n  events \n}: { \n  dateStr: string, \n  events: TimelineEvent[] \n}) {",
  "function HistoryDayGroup({ \n  dateStr, \n  events \n}: { \n  key?: React.Key, \n  dateStr: string, \n  events: TimelineEvent[] \n}) {"
);
fs.writeFileSync('src/pages/History.tsx', code);
