const fs = require('fs');
let code = fs.readFileSync('src/components/meals/MealModal.tsx', 'utf8');

// The replacement was already inserted, but let's check it.
// Oh wait, `patch_meal_modal.cjs` didn't write to the file because I didn't add `fs.writeFileSync(...)`!
// Excellent, so the file is untouched. Let's do it properly.

const viewModeContent = `
        {mode === 'view' && event.log ? (
          <div className="space-y-6">
            {event.photoSignedUrl && (
              <div className="w-full aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden relative">
                <img src={event.photoSignedUrl} alt={event.title} className="w-full h-full object-cover" />
              </div>
            )}
            
            <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Status</span>
                <p className="font-medium text-gray-900">
                  {event.log.consumption_status === 'normal' ? 'Comeu normalmente' : event.log.consumption_status === 'partial' ? 'Comeu parcialmente' : 'Não comeu'}
                </p>
              </div>
              
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Horário</span>
                <p className="font-medium text-gray-900">
                  {event.log.meal_time ? event.log.meal_time.substring(0, 5) : 'Não informado'}
                </p>
              </div>

              {event.log.description && (
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">O que comeu</span>
                  <p className="font-medium text-gray-900">{event.log.description}</p>
                </div>
              )}

              {event.log.notes && (
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Observações</span>
                  <p className="font-medium text-gray-900">{event.log.notes}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Registro Original</h4>
                <div className="flex items-center text-sm">
                  <span className="mr-2 opacity-70">👤</span>
                  <span className="font-medium text-gray-900">{event.log.creator?.name || 'Familiar'}</span>
                </div>
                <div className="text-xs text-gray-500 pl-6 mt-0.5">
                  Registrado às {new Date(event.log.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {event.log.updated_by !== event.log.created_by && (
                <div className="border-t border-gray-100 pt-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Última Alteração</h4>
                  <div className="flex items-center text-sm">
                    <span className="mr-2 opacity-70">👤</span>
                    <span className="font-medium text-gray-900">{event.log.updater?.name || 'Familiar'}</span>
                  </div>
                  <div className="text-xs text-gray-500 pl-6 mt-0.5">
                    Alterado às {new Date(event.log.updated_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              )}
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

code = code.replace('{error && (', viewModeContent + '\n        {error && (');
code = code.replace(/<\/BottomSheet>/, '          </>\n        )}\n      </div>\n    </BottomSheet>');

fs.writeFileSync('src/components/meals/MealModal.tsx', code);
