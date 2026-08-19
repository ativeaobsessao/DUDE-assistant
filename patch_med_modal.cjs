const fs = require('fs');
let code = fs.readFileSync('src/components/medications/MedicationModal.tsx', 'utf8');

// Add mode state
code = code.replace(
  '  const [checkedIds, setCheckedIds] = useState<Set<string>>(() => {',
  `  const [mode, setMode] = useState<'view' | 'edit'>(event.logs.length > 0 ? 'view' : 'edit');\n  const [checkedIds, setCheckedIds] = useState<Set<string>>(() => {`
);

const viewModeContent = `
        {mode === 'view' && event.logs.length > 0 ? (
          <div className="space-y-6">
            <div className="space-y-3">
              {event.medications.map(med => {
                const log = event.logs.find(l => l.medication_id === med.id);
                if (!log) return null;
                const isNotAdministered = log.status === 'not_administered';
                return (
                  <div key={med.id} className="bg-gray-50 rounded-2xl p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className={cn("font-medium", isNotAdministered ? "text-gray-500 line-through" : "text-gray-900")}>{med.name}</h4>
                        <p className="text-sm text-gray-500">{med.dosage}</p>
                      </div>
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full",
                        isNotAdministered ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                      )}>
                        {isNotAdministered ? 'Não Admin' : 'Confirmado'}
                      </span>
                    </div>
                    {isNotAdministered && log.reason && (
                      <div className="text-sm text-red-700">
                        <span className="font-semibold">Motivo:</span> {log.reason}
                        {log.notes && <span className="block text-xs mt-0.5">{log.notes}</span>}
                      </div>
                    )}
                    
                    <div className="border-t border-gray-200/50 pt-3 mt-1 flex flex-col gap-2">
                      <div className="flex flex-col text-xs text-gray-500">
                        <span className="font-medium text-gray-700 flex items-center gap-1"><span className="opacity-70">👤</span> Registrado por {log.creator?.name || 'Familiar'}</span>
                        <span className="pl-5 text-[11px] text-gray-400">Registrado às {new Date(log.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      
                      {log.updated_by !== log.created_by && (
                        <div className="flex flex-col text-xs text-gray-500">
                          <span className="font-medium text-gray-700 flex items-center gap-1"><span className="opacity-70">👤</span> Alterado por {log.updater?.name || 'Familiar'}</span>
                          <span className="pl-5 text-[11px] text-gray-400">Alterado às {new Date(log.updated_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="pt-2">
              <Button onClick={() => setMode('edit')} className="w-full font-medium" variant="outline">
                EDITAR REGISTRO
              </Button>
            </div>
          </div>
        ) : (
          <>
`;

// Insert the view mode branch in the main modal
code = code.replace(
  '      <div className="space-y-6">\n        {error && <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm">{error}</div>}',
  '      <div className="space-y-6">\n' + viewModeContent + '\n        {error && <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm">{error}</div>}'
);

code = code.replace(
  /          <\/Button>\n        <\/div>\n      <\/div>\n    <\/BottomSheet>/,
  `          </Button>\n        </div>\n          </>\n        )}\n      </div>\n    </BottomSheet>`
);

fs.writeFileSync('src/components/medications/MedicationModal.tsx', code);
