import React, { useEffect, useState } from 'react';
import { supabase } from './services/supabase';
import { getPatient, getCurrentProfile } from './services/api';
import { LoginScreen } from './pages/Login';
import { TodayScreen } from './pages/Today';
import { RoutineScreen } from './pages/Routine';
import { SetupScreen } from './pages/Setup';
import { Spinner } from './components/ui/Spinner';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [currentTab, setCurrentTab] = useState<'today' | 'history' | 'routine'>('today');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        checkPatient(session);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        checkPatient(session);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkPatient(session: any) {
    try {
      const profile = await getCurrentProfile();
      if (profile && profile.family_id) {
        const patient = await getPatient(profile.family_id);
        if (!patient) {
          setNeedsSetup(true);
        } else {
          setNeedsSetup(false);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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

  if (needsSetup) {
    return <SetupScreen onComplete={() => {
      setNeedsSetup(false);
      setCurrentTab('routine');
    }} />;
  }

  if (currentTab === 'routine') {
    return <RoutineScreen onTabChange={setCurrentTab} />;
  }

  return <TodayScreen onTabChange={setCurrentTab} />;
}
