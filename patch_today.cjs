const fs = require('fs');
let code = fs.readFileSync('src/pages/Today.tsx', 'utf8');

// 1. Add import for deleteDailyClosure
code = code.replace('  createDailyClosure\n}', '  createDailyClosure,\n  deleteDailyClosure\n}');

// 2. Add state for reopeningDay
code = code.replace('  const [closingDay, setClosingDay] = useState(false);', '  const [closingDay, setClosingDay] = useState(false);\n  const [reopeningDay, setReopeningDay] = useState(false);');

// 3. Add handleReopenDay function
const fn = `  async function handleReopenDay() {
    if (!patient || reopeningDay) return;
    setReopeningDay(true);
    try {
      const localDate = getLocalDateString();
      const success = await deleteDailyClosure(patient.id, localDate);
      if (success) {
        setDailyClosure(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReopeningDay(false);
    }
  }

  async function handleCloseDay() {`;
code = code.replace('  async function handleCloseDay() {', fn);

// 4. Update UI
const oldUi = `              <h3 className="font-semibold text-gray-900">Dia encerrado</h3>
              <p className="text-sm text-gray-500 mt-1">
                Encerrado por {dailyClosure.closed_by_profile?.name || 'Familiar'} às {formatDateToTime(dailyClosure.closed_at)}
              </p>
            </div>`;

const newUi = `              <h3 className="font-semibold text-gray-900">Dia encerrado</h3>
              <p className="text-sm text-gray-500 mt-1">
                Encerrado por {dailyClosure.closed_by_profile?.name || 'Familiar'} às {formatDateToTime(dailyClosure.closed_at)}
              </p>
              
              <button
                onClick={handleReopenDay}
                disabled={reopeningDay}
                className="mt-6 inline-flex items-center justify-center text-sm font-medium text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 px-5 py-2.5 rounded-2xl transition-all active:scale-95 border border-gray-200 disabled:opacity-50 w-full sm:w-auto"
              >
                {reopeningDay ? (
                  <Spinner className="w-4 h-4 mr-2" />
                ) : (
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                )}
                {reopeningDay ? 'Reabrindo...' : 'Desfazer e reabrir dia'}
              </button>
            </div>`;

code = code.replace(oldUi, newUi);
fs.writeFileSync('src/pages/Today.tsx', code);
