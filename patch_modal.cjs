const fs = require('fs');
let code = fs.readFileSync('src/components/routine/PatientEditModal.tsx', 'utf8');

// 1. Add gender state
code = code.replace(
  "  const [name, setName] = useState('');",
  "  const [name, setName] = useState('');\n  const [gender, setGender] = useState<'M' | 'F' | null>(null);"
);

// 2. Hydrate gender
code = code.replace(
  "      setName(patient.name);",
  "      setName(patient.name);\n      setGender(patient.gender || null);"
);

// 3. Save gender
code = code.replace(
  "        name: name.trim(),",
  "        name: name.trim(),\n        gender: gender,"
);

// 4. UI for gender
const genderUI = `
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-900 block text-left">Como devemos nos referir?</label>
          <div className="flex gap-3">
            <button
              onClick={() => setGender('M')}
              className={\`flex-1 py-3 px-4 rounded-xl border font-medium transition-all \${gender === 'M' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300'}\`}
            >
              Ele (O)
            </button>
            <button
              onClick={() => setGender('F')}
              className={\`flex-1 py-3 px-4 rounded-xl border font-medium transition-all \${gender === 'F' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300'}\`}
            >
              Ela (A)
            </button>
          </div>
        </div>`;

code = code.replace(
  "        <div className=\"space-y-3\">\n          <label className=\"text-sm font-semibold text-gray-900 block text-left\">Foto <span className=\"text-gray-400 font-normal\">(Opcional)</span></label>",
  genderUI + "\n        <div className=\"space-y-3\">\n          <label className=\"text-sm font-semibold text-gray-900 block text-left\">Foto <span className=\"text-gray-400 font-normal\">(Opcional)</span></label>"
);

fs.writeFileSync('src/components/routine/PatientEditModal.tsx', code);
