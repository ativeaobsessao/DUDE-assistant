const fs = require('fs');
let code = fs.readFileSync('src/pages/History.tsx', 'utf8');

code = code.replace(
  "            <h1 className=\"text-2xl font-bold tracking-tight text-gray-900\">Histórico</h1>\n          </div>",
  "            <h1 className=\"text-2xl font-bold tracking-tight text-gray-900\">Histórico</h1>\n            <UserProfile />\n          </div>"
);

if (!code.includes("import { UserProfile }")) {
  code = code.replace(
    "import { Spinner } from '../components/ui/Spinner';",
    "import { Spinner } from '../components/ui/Spinner';\nimport { UserProfile } from '../components/ui/UserProfile';"
  );
}

fs.writeFileSync('src/pages/History.tsx', code);
