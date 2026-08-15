const fs = require('fs');
let code = fs.readFileSync('src/pages/Today.tsx', 'utf8');

code = code.replace(
  "  getMealPhotoUrl\n} from '../services/api';",
  "  getMealPhotoUrl,\n  getDailyClosure,\n  createDailyClosure\n} from '../services/api';"
);

code = code.replace(
  "  const [loading, setLoading] = useState(true);",
  "  const [loading, setLoading] = useState(true);\n  const [dailyClosure, setDailyClosure] = useState<any>(null);\n  const [showClosureModal, setShowClosureModal] = useState(false);\n  const [closingDay, setClosingDay] = useState(false);"
);

code = code.replace(
  "      const localDate = getLocalDateString();",
  "      const localDate = getLocalDateString();\n      \n      const closure = await getDailyClosure(pat.id, localDate);\n      setDailyClosure(closure);"
);

code = code.replace(
  "const currentTime = getCurrentLocalTime();",
  `const currentTime = getCurrentLocalTime();
      
      const closure = await getDailyClosure(patientId, localDate);
      setDailyClosure(closure);`
);

const renderClosure = `
  const isAllEventsCompleted = events.length > 0 && events.every(e => e.status === 'confirmed' || e.status === 'attention');
  
  const handleCloseDay = async () => {
    if (!patient || !profile) return;
    setClosingDay(true);
    try {
      const success = await createDailyClosure(profile.family_id, patient.id, localDate, profile.id);
      if (success) {
        setShowClosureModal(false);
        refreshTimeline(patient.id, localDate);
      } else {
        alert("Erro ao encerrar o dia.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setClosingDay(false);
    }
  };

  const morning = events.filter(e => e.time < '12:00:00');
`;

code = code.replace(
  "  const morning = events.filter(e => e.time < '12:00:00');",
  renderClosure
);

const closureUI = `
        {/* Closure Area */}
        <div className="px-6 pb-6">
          {dailyClosure ? (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Dia encerrado</h3>
              <p className="text-sm text-gray-500 mt-1">
                Encerrado por {dailyClosure.closed_by_profile?.name || 'Familiar'} às {new Date(dailyClosure.closed_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          ) : isAllEventsCompleted ? (
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 flex flex-col items-center text-center">
              <h3 className="font-semibold text-indigo-900 mb-1">Rotina do dia concluída</h3>
              <p className="text-sm text-indigo-700/80 mb-4">
                Todos os eventos programados para hoje foram registrados.
              </p>
              <button 
                onClick={() => setShowClosureModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors w-full sm:w-auto"
              >
                Encerrar Dia
              </button>
            </div>
          ) : null}
        </div>
`;

code = code.replace(
  "        {/* Timeline */}",
  closureUI + "\n        {/* Timeline */}"
);

const modalUI = `
      {showClosureModal && patient && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Encerrar o dia?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Você está encerrando a rotina de {patient.name} de hoje. Depois disso, o dia aparecerá como concluído no Histórico.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowClosureModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCloseDay}
                disabled={closingDay}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-50 transition-colors"
              >
                {closingDay ? 'Encerrando...' : 'Encerrar dia'}
              </button>
            </div>
          </div>
        </div>
      )}
`;

code = code.replace(
  "      {/* Modals */}",
  modalUI + "\n      {/* Modals */}"
);

fs.writeFileSync('src/pages/Today.tsx', code);
