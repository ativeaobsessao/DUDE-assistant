const fs = require('fs');

// Patch App.tsx for Code Splitting
let appCode = fs.readFileSync('src/App.tsx', 'utf8');

// Replace imports with lazy
appCode = appCode.replace("import { TodayScreen } from './pages/Today';", "const TodayScreen = React.lazy(() => import('./pages/Today').then(m => ({ default: m.TodayScreen })));");
appCode = appCode.replace("import { RoutineScreen } from './pages/Routine';", "const RoutineScreen = React.lazy(() => import('./pages/Routine').then(m => ({ default: m.RoutineScreen })));");
appCode = appCode.replace("import { SetupScreen } from './pages/Setup';", "const SetupScreen = React.lazy(() => import('./pages/Setup').then(m => ({ default: m.SetupScreen })));");
appCode = appCode.replace("import { HistoryScreen } from './pages/History';", "const HistoryScreen = React.lazy(() => import('./pages/History').then(m => ({ default: m.HistoryScreen })));");

// Add Suspense wrap helper
const suspenseWrap = (element) => `
    <React.Suspense fallback={
      <div className="flex h-[100dvh] items-center justify-center bg-gray-50">
        <Spinner className="w-8 h-8 text-gray-900" />
      </div>
    }>
      ${element}
    </React.Suspense>
`.trim();

// Replace returns with Suspense
appCode = appCode.replace(
  "    return <SetupScreen onComplete={() => {\n      setNeedsSetup(false);\n      setCurrentTab('routine');\n    }} />;",
  `    return ${suspenseWrap(`<SetupScreen onComplete={() => { setNeedsSetup(false); setCurrentTab('routine'); }} />`)};`
);

appCode = appCode.replace(
  "    return <RoutineScreen onTabChange={setCurrentTab} />;",
  `    return ${suspenseWrap(`<RoutineScreen onTabChange={setCurrentTab} />`)};`
);

appCode = appCode.replace(
  "    return <HistoryScreen onTabChange={setCurrentTab} />;",
  `    return ${suspenseWrap(`<HistoryScreen onTabChange={setCurrentTab} />`)};`
);

appCode = appCode.replace(
  "  return <TodayScreen onTabChange={setCurrentTab} />;",
  `  return ${suspenseWrap(`<TodayScreen onTabChange={setCurrentTab} />`)};`
);

fs.writeFileSync('src/App.tsx', appCode);

// Patch ContextSelector.tsx for Parallelism
let contextCode = fs.readFileSync('src/pages/ContextSelector.tsx', 'utf8');

const oldWaterfall = `      const memberships = await getMyFamilyMemberships();
      const loadedPatients = [];
      
      for (const m of memberships) {
        const pat = await getPatient(m.family_id);
        if (pat) {
          let picUrl = null;
          if (pat.photo_url) {
            picUrl = await getPatientPhotoUrl(pat.id, pat.photo_url);
          }
          loadedPatients.push({
            id: pat.id,
            name: pat.name,
            photo: picUrl,
            familyId: m.family_id
          });
        }
      }`;

const newParallel = `      const memberships = await getMyFamilyMemberships();
      
      // PARALLEL FETCHING
      const loadedPatientsUnfiltered = await Promise.all(
        memberships.map(async (m) => {
          const pat = await getPatient(m.family_id);
          if (!pat) return null;
          
          let picUrl = null;
          if (pat.photo_url) {
            picUrl = await getPatientPhotoUrl(pat.id, pat.photo_url);
          }
          
          return {
            id: pat.id,
            name: pat.name,
            photo: picUrl,
            familyId: m.family_id
          };
        })
      );
      
      const loadedPatients = loadedPatientsUnfiltered.filter((p) => p !== null) as any;`;

contextCode = contextCode.replace(oldWaterfall, newParallel);

fs.writeFileSync('src/pages/ContextSelector.tsx', contextCode);
