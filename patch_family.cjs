const fs = require('fs');

let code = fs.readFileSync('src/components/ui/FamilyModal.tsx', 'utf8');

// 1. Add removeFamilyMember import
code = code.replace(
  "import { getFamilyMembers, getFamilyInvites, createFamilyInvite, revokeFamilyInvite } from '../../services/api';",
  "import { getFamilyMembers, getFamilyInvites, createFamilyInvite, revokeFamilyInvite, removeFamilyMember } from '../../services/api';"
);

// 2. Add state for memberToRemove
code = code.replace(
  "  const [inviteLink, setInviteLink] = useState('');",
  "  const [inviteLink, setInviteLink] = useState('');\n  const [memberToRemove, setMemberToRemove] = useState<any>(null);"
);

// 3. Add handleConfirmRemove function
const handleConfirmRemoveFunc = `
  async function handleConfirmRemove() {
    if (!memberToRemove) return;
    setActionLoading(true);
    try {
      await removeFamilyMember(memberToRemove.user_id, familyId);
      setMemberToRemove(null);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Erro ao remover membro.');
    } finally {
      setActionLoading(false);
    }
  }
`;

code = code.replace(
  "  async function handleRevoke(inviteId: string) {",
  handleConfirmRemoveFunc + "\n  async function handleRevoke(inviteId: string) {"
);

// 4. Update the Members list rendering to include the Trash button
const oldMemberRow = `                          <div className="flex items-center">
                            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg border border-indigo-100 shadow-sm">
                              {m.profile?.name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div className="ml-4">
                              <p className="text-base font-bold text-gray-900">
                                {m.profile?.name} {m.user_id === currentUserId && <span className="text-indigo-600 font-medium text-sm ml-1 bg-indigo-50 px-2 py-0.5 rounded-full">(Você)</span>}
                              </p>
                              <p className="text-sm text-gray-500 font-medium mt-0.5">
                                {m.role === 'ADMIN' ? 'Administrador' : 'Membro'}
                              </p>
                            </div>
                          </div>`;

const newMemberRow = `                          <div className="flex items-center">
                            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg border border-indigo-100 shadow-sm">
                              {m.profile?.name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div className="ml-4">
                              <p className="text-base font-bold text-gray-900">
                                {m.profile?.name} {m.user_id === currentUserId && <span className="text-indigo-600 font-medium text-sm ml-1 bg-indigo-50 px-2 py-0.5 rounded-full">(Você)</span>}
                              </p>
                              <p className="text-sm text-gray-500 font-medium mt-0.5">
                                {m.role === 'ADMIN' ? 'Administrador' : 'Membro'}
                              </p>
                            </div>
                          </div>
                          
                          {isAdmin && m.user_id !== currentUserId && (
                            <button
                              onClick={() => setMemberToRemove(m)}
                              disabled={actionLoading}
                              className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors active:scale-95"
                              title="Remover Membro"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}`;

code = code.replace(oldMemberRow, newMemberRow);

// 5. Add Confirmation Modal
const modalJSX = `
      {/* Remove Member Confirmation Modal */}
      {memberToRemove && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Remover Membro?</h3>
            <p className="text-sm text-gray-500 text-center mb-8 font-medium px-2">
              Esta pessoa perderá o acesso à rotina e ao histórico deste paciente imediatamente. Esta ação não pode ser desfeita.
            </p>
            
            <div className="space-y-3">
              <Button 
                onClick={handleConfirmRemove}
                disabled={actionLoading}
                className="w-full py-4 text-base font-bold rounded-2xl bg-red-600 hover:bg-red-700 text-white border-transparent shadow-md active:scale-[0.98] transition-transform"
              >
                {actionLoading ? <Spinner className="text-white w-5 h-5" /> : 'Remover Acesso'}
              </Button>
              <Button 
                onClick={() => setMemberToRemove(null)}
                disabled={actionLoading}
                variant="ghost"
                className="w-full py-4 text-base font-bold rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 active:scale-[0.98] transition-transform"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}`;

code = code.replace("    </div>\n  );\n}", modalJSX);

fs.writeFileSync('src/components/ui/FamilyModal.tsx', code);
