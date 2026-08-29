const fs = require('fs');

// 1. Fix InviteScreen
let inviteCode = fs.readFileSync('src/pages/InviteScreen.tsx', 'utf8');
inviteCode = inviteCode.replace(/sessionStorage\.getItem/g, 'localStorage.getItem');
inviteCode = inviteCode.replace(/sessionStorage\.setItem/g, 'localStorage.setItem');
inviteCode = inviteCode.replace(/sessionStorage\.removeItem/g, 'localStorage.removeItem');
fs.writeFileSync('src/pages/InviteScreen.tsx', inviteCode);

// 2. Fix App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace(/sessionStorage\.getItem/g, 'localStorage.getItem');
appCode = appCode.replace(/sessionStorage\.setItem/g, 'localStorage.setItem');
appCode = appCode.replace(/sessionStorage\.removeItem/g, 'localStorage.removeItem');

const appOldLogic = `      if (!hasCheckedContext) {
        setNeedsContextSelection(true);
        setLoading(false);
        return;
      }`;

const appNewLogic = `      if (!hasCheckedContext) {
        try {
          const memberships = await getMyFamilyMemberships();
          if (memberships.length === 0) {
            setNeedsSetup(true);
            setHasCheckedContext(true);
          } else {
            setNeedsContextSelection(true);
          }
        } catch (err) {
          console.error(err);
          setNeedsContextSelection(true);
        }
        setLoading(false);
        return;
      }`;

appCode = appCode.replace(appOldLogic, appNewLogic);
fs.writeFileSync('src/App.tsx', appCode);

// 3. Fix ContextSelectorScreen (Deduplication)
let selectorCode = fs.readFileSync('src/pages/ContextSelector.tsx', 'utf8');
const selectorOldLogic = `      setPatients(loadedPatients);
    } catch (err: any) {`;

const selectorNewLogic = `      const uniquePatients = Array.from(new Map(loadedPatients.map(p => [p.id, p])).values());
      setPatients(uniquePatients);
    } catch (err: any) {`;

selectorCode = selectorCode.replace(selectorOldLogic, selectorNewLogic);
fs.writeFileSync('src/pages/ContextSelector.tsx', selectorCode);
