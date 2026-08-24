const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const importInvite = `import { InviteScreen } from './pages/InviteScreen';
import { ContextSelectorScreen } from './pages/ContextSelector';
import { getMyFamilyMemberships } from './services/api';\n`;

code = code.replace(/import \{ Spinner \} from '\.\/components\/ui\/Spinner';/, `import { Spinner } from './components/ui/Spinner';\n${importInvite}`);

const states = `  const [needsSetup, setNeedsSetup] = useState(false);
  const [needsContextSelection, setNeedsContextSelection] = useState(false);
  const [hasCheckedContext, setHasCheckedContext] = useState(false);`;

code = code.replace(/  const \[needsSetup, setNeedsSetup\] = useState\(false\);/, states);

const checkPatientNew = `  async function checkPatient() {
    try {
      const pendingInvite = sessionStorage.getItem('pending_invite');
      if (pendingInvite) {
        sessionStorage.removeItem('pending_invite');
        window.location.href = \`/invite/\${pendingInvite}\`;
        return;
      }

      const prof = await getCurrentProfile();
      if (!prof) {
        setNeedsSetup(true);
        setLoading(false);
        return;
      }

      if (!hasCheckedContext) {
        const memberships = await getMyFamilyMemberships();
        if (memberships.length > 1) {
          setNeedsContextSelection(true);
          setLoading(false);
          return;
        }
      }

      const pat = await getPatient(prof.family_id);
      setNeedsSetup(!pat);
    } catch (err) {
      console.error('Error checking patient:', err);
      setNeedsSetup(true);
    } finally {
      setLoading(false);
    }
  }`;

code = code.replace(/  async function checkPatient\(\) \{[\s\S]*?    \}\n  \}/, checkPatientNew);

const renderLogic = `  const pathname = window.location.pathname;
  if (pathname.startsWith('/invite/')) {
    const token = pathname.split('/')[2];
    if (token) {
      return <InviteScreen token={token} />;
    }
  }

  if (loading) {`;

code = code.replace(/  if \(loading\) \{/, renderLogic);

const contextSelectionRender = `  if (needsContextSelection) {
    return (
      <ContextSelectorScreen 
        onSelect={() => {
          setNeedsContextSelection(false);
          setHasCheckedContext(true);
          setLoading(true);
          checkPatient();
        }} 
      />
    );
  }

  if (needsSetup) {`;

code = code.replace(/  if \(needsSetup\) \{/, contextSelectionRender);

fs.writeFileSync('src/App.tsx', code);
