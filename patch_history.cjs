const fs = require('fs');
let code = fs.readFileSync('src/pages/History.tsx', 'utf8');

code = code.replace(
  "  getHistoricalMedicationLogs,\n  getMealPhotoUrl\n} from '../services/api';",
  "  getHistoricalMedicationLogs,\n  getMealPhotoUrl,\n  getHistoricalDailyClosures\n} from '../services/api';"
);

code = code.replace(
  "function HistoryDayGroup({ \n  dateStr, \n  events \n}: { \n  key?: React.Key, \n  dateStr: string, \n  events: TimelineEvent[] \n}) {",
  "function HistoryDayGroup({ \n  dateStr, \n  events, \n  closure \n}: { \n  key?: React.Key, \n  dateStr: string, \n  events: TimelineEvent[],\n  closure?: any \n}) {"
);

const accordionUI = `
  return (
    <div className="mb-4">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full flex flex-col p-4 bg-white rounded-xl border border-gray-100 shadow-sm"
      >
        <div className="w-full flex items-center justify-between mb-1">
          <span className="font-semibold text-gray-900 uppercase text-xs tracking-wider">
            {friendly}
            {closure && <span className="ml-2 text-green-600">✓</span>}
            {!closure && <span className="ml-2 text-gray-400">○</span>}
          </span>
          {expanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </div>
        
        {closure ? (
          <div className="text-left">
            <span className="text-[11px] text-gray-500">
              Encerrado por {closure.closed_by_profile?.name || 'Familiar'} às {new Date(closure.closed_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ) : (
          <div className="text-left">
            <span className="text-[11px] text-gray-500">Dia em aberto</span>
          </div>
        )}
      </button>
      
      {expanded && (
        <div className="mt-4 space-y-4 px-2">
          {closure ? (
            <div className="flex items-center space-x-2 text-xs font-medium text-green-700 bg-green-50 px-3 py-2 rounded-lg mb-4">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>DIA ENCERRADO</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-xs font-medium text-gray-600 bg-gray-50 px-3 py-2 rounded-lg mb-4">
              <span className="text-lg leading-none">○</span>
              <span>DIA EM ABERTO</span>
            </div>
          )}
          
          <div className="h-px w-full bg-gray-100 my-2"></div>

          {events.map((event, idx) => (
`;

code = code.replace(
  `  return (
    <div className="mb-4">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm"
      >
        <span className="font-semibold text-gray-900 uppercase text-xs tracking-wider">{friendly}</span>
        {expanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>
      
      {expanded && (
        <div className="mt-4 space-y-4 px-2">
          {events.map((event, idx) => (`,
  accordionUI
);

code = code.replace(
  "  const [groupedEvents, setGroupedEvents] = useState<Record<string, TimelineEvent[]>>({});",
  "  const [groupedEvents, setGroupedEvents] = useState<Record<string, TimelineEvent[]>>({});\n  const [closures, setClosures] = useState<Record<string, any>>({});"
);

code = code.replace(
  "      const [mealLogs, medLogs] = await Promise.all([",
  "      const [mealLogs, medLogs, closuresData] = await Promise.all([\n        getHistoricalMealLogs(pat.id, localDate),\n        getHistoricalMedicationLogs(pat.id, localDate),\n        getHistoricalDailyClosures(pat.id, localDate)\n      ]);\n      \n      const closuresMap: Record<string, any> = {};\n      for (const c of closuresData) {\n        closuresMap[c.date] = c;\n      }\n      setClosures(closuresMap);\n"
);

code = code.replace(
  "      const [mealLogs, medLogs, closuresData] = await Promise.all([",
  "      const [mealLogs, medLogs, closuresData] = await Promise.all(["
);

// fix previously replaced
code = code.replace(
  "      const [mealLogs, medLogs] = await Promise.all([\n        getHistoricalMealLogs(pat.id, localDate),\n        getHistoricalMedicationLogs(pat.id, localDate),\n        getHistoricalDailyClosures(pat.id, localDate)\n      ]);",
  "// replaced"
);

code = code.replace(
  "                events={groupedEvents[dateStr]}\n              />",
  "                events={groupedEvents[dateStr]}\n                closure={closures[dateStr]}\n              />"
);

fs.writeFileSync('src/pages/History.tsx', code);
