const fs = require('fs');
let code = fs.readFileSync('src/pages/Routine.tsx', 'utf8');

code = code.replace(
  "        {/* Header */}\n        <div>\n          <h1 className=\"text-2xl font-bold tracking-tight text-gray-900 mb-8\">Rotina</h1>",
  "        {/* Header */}\n        <div className=\"flex items-center justify-between mb-8\">\n          <h1 className=\"text-2xl font-bold tracking-tight text-gray-900\">Rotina</h1>\n          <UserProfile />\n        </div>\n        <div>"
);

if (!code.includes("import { UserProfile }")) {
  code = code.replace(
    "import { Spinner } from '../components/ui/Spinner';",
    "import { Spinner } from '../components/ui/Spinner';\nimport { UserProfile } from '../components/ui/UserProfile';"
  );
}

fs.writeFileSync('src/pages/Routine.tsx', code);
