import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError('Não foi possível entrar. Verifique seu e-mail e senha.');
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 py-12">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">DUDE</h1>
          <div className="mt-8 mx-auto h-32 w-32 overflow-hidden rounded-full border-4 border-white shadow-sm bg-gray-200 flex items-center justify-center">
            {/* Generic placeholder since we don't know the family yet */}
            <span className="text-4xl text-gray-400">👵</span>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Entrar na Família</h2>
          <p className="mt-2 text-sm text-gray-500">Como está a vó hoje?</p>
        </div>

        <form className="space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="Seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? <Spinner className="text-white" /> : 'Entrar'}
          </Button>
        </form>
      </div>
    </div>
  );
}
