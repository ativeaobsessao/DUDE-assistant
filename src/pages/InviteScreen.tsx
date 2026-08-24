import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { acceptFamilyInvite } from '../services/api';
import { Spinner } from '../components/ui/Spinner';
import { Button } from '../components/ui/Button';

export function InviteScreen({ token }: { token: string }) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleAccept() {
    setAccepting(true);
    setError('');
    try {
      await acceptFamilyInvite(token);
      setSuccess(true);
    } catch (err: any) {
      let msg = err.message || 'Não foi possível concluir esta ação. Tente novamente.';
      const lower = msg.toLowerCase();
      if (lower.includes('expirado')) msg = 'Este convite expirou. Peça ao administrador da família para gerar um novo.';
      else if (lower.includes('revogado') || lower.includes('utilizado')) msg = 'Este convite não está mais disponível ou já foi utilizado.';
      else if (lower.includes('inválido') || lower.includes('encontrado')) msg = 'Este convite não está mais disponível ou é inválido.';
      else if (lower.includes('já pertence')) msg = 'Você já faz parte desta família.';
      
      setError(msg);
    } finally {
      setAccepting(false);
    }
  }

  function goHome(isSuccess = false) { 
    if (!isSuccess) {
      sessionStorage.setItem('pending_invite', token);
    }
    window.location.href = '/';
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Spinner className="w-8 h-8 text-gray-900" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
        {!session ? (
          <>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">Você foi convidado</h1>
              <p className="text-gray-500 mt-2">
                Para aceitar e acompanhar este paciente, crie sua conta ou faça login.
              </p>
            </div>
            <div className="space-y-3">
              <Button className="w-full" size="lg" onClick={() => goHome(false)}>
                CRIAR MINHA CONTA
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => goHome(false)}>
                JÁ TENHO UMA CONTA
              </Button>
            </div>
          </>
        ) : success ? (
          <>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">Convite aceito!</h1>
              <p className="text-gray-500 mt-2">
                Agora você tem acesso a esta família.
              </p>
            </div>
            <Button className="w-full" size="lg" onClick={() => goHome(true)}>
              Entrar
            </Button>
          </>
        ) : (
          <>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">Aceitar convite</h1>
              <p className="text-gray-500 mt-2">
                Você foi convidado para acompanhar um paciente.
              </p>
            </div>
            {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-xl">{error}</div>}
            <Button className="w-full" size="lg" onClick={handleAccept} disabled={accepting}>
              {accepting ? <Spinner className="text-white" /> : 'Aceitar convite'}
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => goHome(false)}>
              Cancelar
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
