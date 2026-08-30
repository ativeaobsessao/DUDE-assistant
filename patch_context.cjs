const fs = require('fs');
let code = fs.readFileSync('src/pages/ContextSelector.tsx', 'utf8');

code = code.replace(
  "            familyId: m.family_id",
  "            familyId: m.family_id,\n            gender: pat.gender"
);

code = code.replace(
  "setPatients<Array<{ id: string, name: string, photo: string | null, familyId: string }>>([])",
  "setPatients<Array<{ id: string, name: string, photo: string | null, familyId: string, gender?: string | null }>>([])"
);
// Fix the state type, it was:
// const [patients, setPatients] = useState<Array<{ id: string, name: string, photo: string | null, familyId: string }>>([]);
code = code.replace(
  "<{ id: string, name: string, photo: string | null, familyId: string }>",
  "<{ id: string, name: string, photo: string | null, familyId: string, gender: string | null }>"
);

const newGreeting = `        <div className="text-center">
          {patients.length > 1 ? (
            <>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Como está a sua família hoje?
              </h1>
              <p className="text-gray-500 mt-3 font-medium">
                Escolha quem você vai acompanhar agora.
              </p>
            </>
          ) : patients.length === 1 ? (
            <>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                {patients[0].gender === 'F' ? 'Como está a ' : patients[0].gender === 'M' ? 'Como está o ' : 'Como está a rotina de '}{patients[0].name}?
              </h1>
              <p className="text-gray-500 mt-3 font-medium">
                Veja como está a rotina {patients[0].gender === 'F' ? 'dela' : patients[0].gender === 'M' ? 'dele' : 'hoje'}.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Bem-vindo
              </h1>
              <p className="text-gray-500 mt-3 font-medium">
                Nenhum paciente disponível.
              </p>
            </>
          )}
        </div>`;

const oldGreeting = `        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Quem você vai acompanhar hoje?
          </h1>
          <p className="text-gray-500 mt-3 font-medium">
            Selecione um paciente para continuar
          </p>
        </div>`;

code = code.replace(oldGreeting, newGreeting);

fs.writeFileSync('src/pages/ContextSelector.tsx', code);
