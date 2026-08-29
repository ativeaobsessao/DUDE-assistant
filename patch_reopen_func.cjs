const fs = require('fs');
let code = fs.readFileSync('src/pages/Today.tsx', 'utf8');

const fn = `
  const handleReopenDay = async () => {
    if (!patient || reopeningDay) return;
    setReopeningDay(true);
    try {
      const success = await deleteDailyClosure(patient.id, localDate);
      if (success) {
        setDailyClosure(null);
        refreshTimeline(patient.id, localDate);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReopeningDay(false);
    }
  };

  const handleCloseDay = async () => {`;
code = code.replace('  const handleCloseDay = async () => {', fn);
fs.writeFileSync('src/pages/Today.tsx', code);
