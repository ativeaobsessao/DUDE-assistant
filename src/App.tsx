import React, { useEffect, useState } from 'react';
import { supabase } from './services/supabase';
import { getPatient, getCurrentProfile } from './services/api';
import { LoginScreen } from './pages/Login';
import { TodayScreen } from './pages/Today';
import { RoutineScreen } from './pages/Routine';
import { SetupScreen } from './pages/Setup';
import { HistoryScreen } from './pages/History';
import { Spinner } from './components/ui/Spinner';
import { InviteScreen } from './pages/InviteScreen';
import { ContextSelectorScreen } from './pages/ContextSelector';
import { getMyFamilyMemberships } from './services/api';


export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [needsContextSelection, setNeedsContextSelection] = useState(false);
  const [hasCheckedContext, setHasCheckedContext] = useState(false);
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
      const pendingInvite = sessionStorage.getItem('pending_invite');
      if (pendingInvite) {
        sessionStorage.removeItem('pending_invite');
        window.location.href = `/invite/${pendingInvite}`;
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
        if (memberships.length > 0) {
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
          setHasCheckedContext(true);
          setLoading(true);
          checkPatient();
        }} 
      />
    );
  }

  if (needsSetup) {
    return <SetupScreen onComplete={() => {
      setNeedsSetup(false);
      setCurrentTab('routine');
    }} />;
  }

  if (currentTab === 'routine') {
    return <RoutineScreen onTabChange={setCurrentTab} />;
  }
  
  if (currentTab === 'history') {
    return <HistoryScreen onTabChange={setCurrentTab} />;
  }

  return <TodayScreen onTabChange={setCurrentTab} />;
}
