const fs = require('fs');
let code = fs.readFileSync('src/components/ui/UserProfile.tsx', 'utf8');

code = code.replace(
  "import { LogOut, User, Camera, Lock } from 'lucide-react';",
  "import { LogOut, User, Camera, Lock, UserPen } from 'lucide-react';"
);

code = code.replace(
  "  const [updatingPassword, setUpdatingPassword] = useState(false);",
  "  const [updatingPassword, setUpdatingPassword] = useState(false);\n  const [showNameModal, setShowNameModal] = useState(false);\n  const [newName, setNewName] = useState('');\n  const [updatingName, setUpdatingName] = useState(false);"
);

const handleNameFunc = `
  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || newName.trim().length < 2) {
      alert('O nome deve ter pelo menos 2 caracteres.');
      return;
    }
    
    try {
      setUpdatingName(true);
      const { error } = await supabase
        .from('profiles')
        .update({ name: newName.trim() } as any)
        .eq('id', profile.id);
      
      if (error) throw error;
      
      await supabase.auth.updateUser({
        data: { full_name: newName.trim() }
      });
      
      alert('Nome atualizado com sucesso!');
      setShowNameModal(false);
      setNewName('');
      await loadProfile();
    } catch (error) {
      console.error('Error updating name:', error);
      alert('Erro ao atualizar o nome. Tente novamente mais tarde.');
    } finally {
      setUpdatingName(false);
    }
  };

  const getInitials`;

code = code.replace(
  "  const getInitials",
  handleNameFunc
);

const nameButton = `          <button 
            onClick={() => { setIsOpen(false); setNewName(profile?.name || ''); setShowNameModal(true); }}
            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors border-b border-gray-100"
          >
            <UserPen className="w-4 h-4 mr-2 text-gray-400" />
            Alterar nome
          </button>
          
          <button 
            onClick={() => { setIsOpen(false); setShowPasswordModal(true); }}`;

code = code.replace(
  "          <button \n            onClick={() => { setIsOpen(false); setShowPasswordModal(true); }}",
  nameButton
);

const nameModal = `
      {showNameModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Alterar Nome</h3>
            <p className="text-sm text-gray-500 mb-6">
              Este é o nome que aparecerá nos registros de refeições e medicamentos.
            </p>
            <form onSubmit={handleUpdateName}>
              <input
                type="text"
                placeholder="Seu nome"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none mb-6"
                required
              />
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => { setShowNameModal(false); setNewName(''); }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={updatingName}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-50"
                >
                  {updatingName ? 'Salvando...' : 'Salvar Nome'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}`;

code = code.replace(
  "      {showPasswordModal && (",
  nameModal + "\n      {showPasswordModal && ("
);

fs.writeFileSync('src/components/ui/UserProfile.tsx', code);
