const fs = require('fs');
let code = fs.readFileSync('src/components/timeline/TimelineItem.tsx', 'utf8');

code = code.replace(
  "import { formatTime } from '../../utils/date';",
  "import { formatTime, formatDateToTime } from '../../utils/date';"
);

code = code.replace(
  "                ).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}",
  "                ))}"
);

code = code.replace(
  "Registrado às {new Date(",
  "Registrado às {formatDateToTime(new Date("
);

fs.writeFileSync('src/components/timeline/TimelineItem.tsx', code);
