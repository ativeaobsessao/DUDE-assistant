const fs = require('fs');
let code = fs.readFileSync('src/components/timeline/TimelineItem.tsx', 'utf8');

code = code.replace(
  "          {event.type === 'meal' && event.log && (\n            <div className=\"mt-4 pt-3 border-t border-gray-900/5 flex flex-col space-y-0.5\">\n              <div className=\"flex items-center text-xs text-gray-500\">\n                <span className=\"mr-1.5 opacity-70\">👤</span>\n                <span className=\"font-medium text-gray-700\">Registrado por {event.log.creator?.name || 'Familiar'}</span>\n              </div>\n              <div className=\"text-[11px] text-gray-400 pl-5\">\n                Registrado às {new Date(event.log.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}\n              </div>\n            </div>\n          )}",
  `          {(event.status === 'confirmed' || event.status === 'attention') && (
            <div className="mt-4 pt-3 border-t border-gray-900/5 flex flex-col space-y-0.5">
              <div className="flex items-center text-xs text-gray-500">
                <span className="mr-1.5 opacity-70">👤</span>
                <span className="font-medium text-gray-700">Registrado por {
                  event.type === 'meal' 
                    ? (event.log?.creator?.name || 'Familiar')
                    : (event.logs?.[0]?.creator?.name || 'Familiar')
                }</span>
              </div>
              <div className="text-[11px] text-gray-400 pl-5">
                Registrado às {new Date(
                  event.type === 'meal' 
                    ? event.log?.created_at 
                    : event.logs?.[0]?.created_at
                ).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          )}`
);

fs.writeFileSync('src/components/timeline/TimelineItem.tsx', code);
