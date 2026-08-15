const fs = require('fs');
let code = fs.readFileSync('src/components/ui/UserProfile.tsx', 'utf8');

code = code.replace(
  "import { LogOut, User, Camera } from 'lucide-react';",
  "import { LogOut, User, Camera, Lock } from 'lucide-react';"
);

code = code.replace(
  "  const [uploading, setUploading] = useState(false);\n  const dropdownRef = useRef<HTMLDivElement>(null);",
  "  const [uploading, setUploading] = useState(false);\n  const [showPasswordModal, setShowPasswordModal] = useState(false);\n  const [newPassword, setNewPassword] = useState('');\n  const [updatingPassword, setUpdatingPassword] = useState(false);\n  const dropdownRef = useRef<HTMLDivElement>(null);"
);

const handlePasswordStr = `  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    
    try {
      setUpdatingPassword(true);
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      alert('Senha atualizada com sucesso!');
      setShowPasswordModal(false);
      setNewPassword('');
    } catch (error) {
      console.error('Error updating password:', error);
      alert('Erro ao atualizar a senha. Tente novamente mais tarde.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const getInitials = (name: string) => {`;

code = code.replace(
  "  const getInitials = (name: string) => {",
  handlePasswordStr
);

code = code.replace(
  "          <button \n            onClick={() => fileInputRef.current?.click()}",
  `          <button 
            onClick={() => { setIsOpen(false); setShowPasswordModal(true); }}
            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors border-b border-gray-100"
          >
            <Lock className="w-4 h-4 mr-2 text-gray-400" />
            Alterar senha
          </button>
          
          <button 
            onClick={() => fileInputRef.current?.click()}`
);

code = code.replace(
  "  return (\n    <div className=\"relative\" ref={dropdownRef}>",
  "  return (\n    <>\n    <div className=\"relative\" ref={dropdownRef}>"
);

code = code.replace(
  "      )}\n    </div>\n  );",
  `      )}
    </div>

      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Alterar Senha</h3>
            <p className="text-sm text-gray-500 mb-6">
              Defina uma nova senha para o acesso desta família.
            </p>
            <form onSubmit={handleUpdatePassword}>
              <input
                type="password"
                placeholder="Nova senha (mín. 6 caracteres)"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none mb-6"
                required
              />
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => { setShowPasswordModal(false); setNewPassword(''); }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-50"
                >
                  {updatingPassword ? 'Salvando...' : 'Salvar Senha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );`
);

fs.writeFileSync('src/components/ui/UserProfile.tsx', code);
