const fs = require('fs');
let code = fs.readFileSync('src/pages/Today.tsx', 'utf8');

// Replace the Sair button with UserProfile
code = code.replace(
  "            <button \n              onClick={() => supabase.auth.signOut()} \n              className=\"text-sm font-medium text-gray-500 hover:text-gray-900\"\n            >\n              Sair\n            </button>",
  "            <UserProfile />"
);

// Add import if not present
if (!code.includes("import { UserProfile }")) {
  code = code.replace(
    "import { MealModal } from '../components/meals/MealModal';",
    "import { MealModal } from '../components/meals/MealModal';\nimport { UserProfile } from '../components/ui/UserProfile';"
  );
}

fs.writeFileSync('src/pages/Today.tsx', code);
