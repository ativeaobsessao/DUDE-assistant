const fs = require('fs');
let code = fs.readFileSync('src/pages/Setup.tsx', 'utf8');

// 1. Add gender state
code = code.replace(
  "  const [name, setName] = useState('');",
  "  const [name, setName] = useState('');\n  const [gender, setGender] = useState<'M' | 'F' | null>(null);"
);

// 2. Add to payload
code = code.replace(
  "        family_id: profile.family_id,\n        name: name.trim(),\n      };",
  "        family_id: profile.family_id,\n        name: name.trim(),\n        gender: gender,\n      };"
);

// 3. UI
const genderUI = `          <div className="space-y-2 text-left">
            <label className="text-sm font-semibold text-gray-900 block">Como devemos nos referir?</label>
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
  "           />\n          <div className=\"space-y-2\">",
  "           />\n" + genderUI + "\n          <div className=\"space-y-2\">"
);

fs.writeFileSync('src/pages/Setup.tsx', code);
