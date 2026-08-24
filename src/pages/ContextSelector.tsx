// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { getMyFamilyMemberships, getPatient, setActiveFamily, getPatientPhotoUrl } from '../services/api';
import { Spinner } from '../components/ui/Spinner';
import { Users } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function ContextSelectorScreen({ onSelect }: { onSelect: () => void }) {
  const [memberships, setMemberships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Record<string, any>>({});
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [switching, setSwitching] = useState<string | null>(null);

  useEffect(() => {
    loadMemberships();
  }, []);

  async function loadMemberships() {
    try {
      const data = await getMyFamilyMemberships();
      setMemberships(data);
      
      const patMap: Record<string, any> = {};
      const picMap: Record<string, string> = {};
      for (const m of data) {
        const pat = await getPatient(m.family_id);
        if (pat) {
          patMap[m.family_id] = pat;
          if (pat.photo_url) {
            const url = await getPatientPhotoUrl(pat.id, pat.photo_url);
            if (url) picMap[m.family_id] = url;
          }
        }
      }
      setPatients(patMap);
      setPhotoUrls(picMap);
      
      // If only one membership, just auto-select it if it's already active, but let's let App.tsx handle it 
      // or we can just show the single card as requested "na entrada do app, antes da Hero atual, mostrar o card do paciente."
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar famílias');
    } finally {
      setLoading(false);
    }
  }

  async function handleSelect(familyId: string) {
    setSwitching(familyId);
    try {
      await setActiveFamily(familyId);
      onSelect();
    } catch (err: any) {
      setError(err.message || 'Erro ao alterar contexto');
      setSwitching(null);
    }
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
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {memberships.length > 1 ? "Seus pacientes" : "Bem-vindo"}
          </h1>
          <p className="text-gray-500 mt-2">
            Selecione quem você vai acompanhar hoje
          </p>
        </div>

        {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-xl">{error}</div>}

        <div className="grid gap-4">
          {memberships.map((m) => {
            const pat = patients[m.family_id];
            const pic = photoUrls[m.family_id];
            return (
              <button
                key={m.family_id}
                onClick={() => handleSelect(m.family_id)}
                disabled={switching !== null}
                className="flex items-center p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-gray-300 transition-colors text-left"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center border-2 border-gray-100">
                  {pic ? (
                    <img src={pic} alt={pat?.name} className="w-full h-full object-cover" />
                  ) : (
                    <Users className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {pat?.name || m.families?.name || 'Família'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {m.role === 'ADMIN' ? 'Administrador' : 'Membro'}
                  </p>
                </div>
                <div className="ml-4">
                  {switching === m.family_id ? (
                    <Spinner className="w-5 h-5 text-gray-400" />
                  ) : (
                    <span className="text-blue-600 font-medium text-sm">Entrar &rarr;</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
