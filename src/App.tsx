import React, { useEffect, useState, useRef } from 'react';
import { supabase } from './services/supabase';
import { getPatient, getCurrentProfile } from './services/api';
import { LoginScreen } from './pages/Login';
const TodayScreen = React.lazy(() => import('./pages/Today').then(m => ({ default: m.TodayScreen })));
const RoutineScreen = React.lazy(() => import('./pages/Routine').then(m => ({ default: m.RoutineScreen })));
const SetupScreen = React.lazy(() => import('./pages/Setup').then(m => ({ default: m.SetupScreen })));
const HistoryScreen = React.lazy(() => import('./pages/History').then(m => ({ default: m.HistoryScreen })));
import { Spinner } from './components/ui/Spinner';
import { InviteScreen } from './pages/InviteScreen';
import { ContextSelectorScreen } from './pages/ContextSelector';
import { getMyFamilyMemberships } from './services/api';


export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [needsContextSelection, setNeedsContextSelection] = useState(false);
  const hasCheckedContextRef = useRef(false);
  const [currentTab, setCurrentTab] = useState<'today' | 'history' | 'routine'>('today');

  useEffect(() => {
    // Check existing session on mount
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      setSession(s);
      if (s) {
        await checkPatient();
      } else {
        setLoading(false);
      }
    });

    // Listen for auth state changes (login / logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, s) => {
      setSession(s);
      if (s) {
        await checkPatient();
      } else {
        setNeedsSetup(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkPatient() {
    try {
      const pendingInvite = localStorage.getItem('pending_invite');
      if (pendingInvite) {
        localStorage.removeItem('pending_invite');
        window.location.href = `/invite/${pendingInvite}`;
        return;
      }

      const prof = await getCurrentProfile();
      if (!prof) {
        setNeedsSetup(true);
        setLoading(false);
        return;
      }

      if (!hasCheckedContextRef.current) {
        try {
          const memberships = await getMyFamilyMemberships();
          if (memberships.length === 0) {
            setNeedsSetup(true);
            hasCheckedContextRef.current = true;
          } else {
            setNeedsContextSelection(true);
          }
        } catch (err) {
          console.error(err);
          setNeedsContextSelection(true);
        }
        setLoading(false);
        return;
      }

      const pat = await getPatient(prof.family_id);
      setNeedsSetup(!pat);
    } catch (err) {
      console.error('Error checking patient:', err);
      setNeedsSetup(true);
    } finally {
      setLoading(false);
    }
  }

  const pathname = window.location.pathname;
  if (pathname.startsWith('/invite/')) {
    const token = pathname.split('/')[2];
    if (token) {
      return <InviteScreen token={token} />;
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Spinner className="w-8 h-8 text-gray-900" />
      </div>
    );
  }

  if (!session) {
    return <LoginScreen />;
  }

  if (needsContextSelection) {
    return (
      <ContextSelectorScreen 
        onSelect={() => {
          setNeedsContextSelection(false);
          hasCheckedContextRef.current = true;
          setLoading(true);
          checkPatient();
        }} 
      />
    );
  }

  if (needsSetup) {
    return <React.Suspense fallback={
      <div className="flex h-[100dvh] items-center justify-center bg-gray-50">
        <Spinner className="w-8 h-8 text-gray-900" />
      </div>
    }>
      <SetupScreen onComplete={() => { setNeedsSetup(false); setCurrentTab('routine'); }} />
    </React.Suspense>;
  }

  if (currentTab === 'routine') {
    return <React.Suspense fallback={
      <div className="flex h-[100dvh] items-center justify-center bg-gray-50">
        <Spinner className="w-8 h-8 text-gray-900" />
      </div>
    }>
      <RoutineScreen onTabChange={setCurrentTab} />
    </React.Suspense>;
  }
  
  if (currentTab === 'history') {
    return <React.Suspense fallback={
      <div className="flex h-[100dvh] items-center justify-center bg-gray-50">
        <Spinner className="w-8 h-8 text-gray-900" />
      </div>
    }>
      <HistoryScreen onTabChange={setCurrentTab} />
    </React.Suspense>;
  }

  return <React.Suspense fallback={
      <div className="flex h-[100dvh] items-center justify-center bg-gray-50">
        <Spinner className="w-8 h-8 text-gray-900" />
      </div>
    }>
      <TodayScreen onTabChange={setCurrentTab} />
    </React.Suspense>;
}
