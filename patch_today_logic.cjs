const fs = require('fs');
let code = fs.readFileSync('src/pages/Today.tsx', 'utf8');

const oldMedLogic = `        const hasNotAdministered = periodLogs.some(l => l.status === 'not_administered');
        const allAdministered = periodMeds.every(m => periodLogs.some(l => l.medication_id === m.id && l.status === 'administered'));
        const hasAnyLog = periodLogs.length > 0;

        if (hasNotAdministered) {
          status = 'attention';
        } else if (allAdministered) {
          status = 'confirmed';
        } else if (period.scheduled_time <= currentTime) {
          status = 'pending';
        }`;

const newMedLogic = `        const allResolved = periodMeds.every(m => periodLogs.some(l => l.medication_id === m.id));
        const hasNotAdministered = periodLogs.some(l => l.status === 'not_administered');
        
        if (allResolved) {
          status = hasNotAdministered ? 'attention' : 'confirmed';
        } else if (period.scheduled_time <= currentTime) {
          status = 'pending';
        }`;

code = code.replace(oldMedLogic, newMedLogic);

const oldCompletedLogic = `  const isAllEventsCompleted = events.length > 0 && events.every(e => e.status === 'confirmed' || e.status === 'attention');`;

const newCompletedLogic = `  const resolvedEventsCount = events.filter(e => e.status === 'confirmed' || e.status === 'attention').length;
  const isAllEventsCompleted = events.length > 0 && resolvedEventsCount === events.length;
  
  useEffect(() => {
    if (events.length > 0) {
      const resolved = events.filter(e => e.status === 'confirmed' || e.status === 'attention').length;
      const pending = events.length - resolved;
      const lastEvent = events[events.length - 1];
      console.log(\`[DAILY CLOSURE] date=\${localDate}\`);
      console.log(\`events=\${events.length}\`);
      console.log(\`resolved=\${resolved}\`);
      console.log(\`pending=\${pending}\`);
      console.log(\`lastEvent=\${lastEvent.time}\`);
      console.log(\`lastEventStatus=\${lastEvent.status}\`);
      console.log(\`closureExists=\${!!dailyClosure}\`);
      console.log(\`canClose=\${events.length > 0 && resolved === events.length && !dailyClosure}\`);
    }
  }, [events, dailyClosure, localDate]);
`;

code = code.replace(oldCompletedLogic, newCompletedLogic);

fs.writeFileSync('src/pages/Today.tsx', code);
