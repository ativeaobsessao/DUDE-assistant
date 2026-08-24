const fs = require('fs');
let code = fs.readFileSync('src/components/ui/UserProfile.tsx', 'utf8');

code = code.replace(
  "import { LogOut, UserPen, Camera, Lock } from 'lucide-react';",
  "import { LogOut, UserPen, Camera, Lock, Users } from 'lucide-react';\nimport { FamilyModal } from './FamilyModal';"
);

code = code.replace(
  "const [showPasswordModal, setShowPasswordModal] = useState(false);",
  "const [showPasswordModal, setShowPasswordModal] = useState(false);\n  const [showFamilyModal, setShowFamilyModal] = useState(false);"
);

const familyButton = `          <button 
            onClick={() => { setIsOpen(false); setShowFamilyModal(true); }}
            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors border-b border-gray-100"
          >
            <Users className="w-4 h-4 mr-2 text-gray-400" />
            Família e Convites
          </button>
          
          <button`;

code = code.replace(/          <button \n            onClick=\{\(\) => \{ setIsOpen\(false\); setShowNameModal\(true\); \}\}/, familyButton + ` \n            onClick={() => { setIsOpen(false); setShowNameModal(true); }}`);


const familyModalCode = `      {showFamilyModal && profile?.family_id && (
        <FamilyModal 
          familyId={profile.family_id} 
          currentUserId={profile.id}
          onClose={() => setShowFamilyModal(false)} 
        />
      )}
      
      {showNameModal &&`;

code = code.replace(/      \{showNameModal &&/, familyModalCode);

fs.writeFileSync('src/components/ui/UserProfile.tsx', code);
