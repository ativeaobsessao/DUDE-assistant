import React, { useEffect, useState } from 'react';
import { supabase } from './services/supabase';
import { getPatient, getCurrentProfile } from './services/api';
import { LoginScreen } from './pages/Login';
import { TodayScreen } from './pages/Today';
import { RoutineScreen } from './pages/Routine';
import { SetupScreen } from './pages/Setup';
import { HistoryScreen } from './pages/History';
import { Spinner } from './components/ui/Spinner';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [currentTab, setCurrentTab] = useState<'today' | 'history' | 'routine'>('today');

  // MOCK LOGIN FOR TESTING THE CRASH
  useEffect(() => {
    // Fake session to force rendering authenticated area
    const fakeSession = { user: { id: 'test-user-id' } };
    setSession(fakeSession);
    
    // Fake profile and patient
    const mockCheckPatient = async () => {
      setNeedsSetup(false);
      setLoading(false);
    };
    
    mockCheckPatient();
  }, []);

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
  
  if (currentTab === 'history') {
    return <HistoryScreen onTabChange={setCurrentTab} />;
  }

  return <TodayScreen onTabChange={setCurrentTab} />;
}
