// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { X, Users, UserPlus, Trash2, Link } from 'lucide-react';
import { Spinner } from './Spinner';
import { Button } from './Button';
import { getFamilyMembers, getFamilyInvites, createFamilyInvite, revokeFamilyInvite } from '../../services/api';

interface FamilyModalProps {
  familyId: string;
  currentUserId: string;
  onClose: () => void;
}

export function FamilyModal({ familyId, currentUserId, onClose }: FamilyModalProps) {
  const [members, setMembers] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  
  const isAdmin = members.find(m => m.user_id === currentUserId)?.role === 'ADMIN';

  useEffect(() => {
    loadData();
  }, [familyId]);

  async function loadData() {
    try {
      const [m, i] = await Promise.all([
        getFamilyMembers(familyId),
        getFamilyInvites(familyId)
      ]);
      setMembers(m);
      setInvites(i);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados da família.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateInvite() {
    setActionLoading(true);
    setError('');
    try {
      const res = await createFamilyInvite();
      const origin = window.location.origin;
      setInviteLink(`${origin}/invite/${res.token}`);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Não foi possível gerar o convite.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRevoke(inviteId: string) {
    setActionLoading(true);
    try {
      await revokeFamilyInvite(inviteId);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Erro ao revogar convite.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCopy() {
    if (inviteLink) {
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Convite para o DUDE',
            text: 'Você foi convidado para acompanhar um paciente.',
            url: inviteLink
          });
        } catch (err) {
          navigator.clipboard.writeText(inviteLink);
          alert('Convite copiado.');
        }
      } else {
        navigator.clipboard.writeText(inviteLink);
        alert('Convite copiado.');
      }
    }
  }

  return (
    <>
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/40 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6 text-center">
        <div className="relative transform overflow-hidden rounded-3xl bg-gray-50 text-left shadow-2xl transition-all w-full max-w-lg flex flex-col max-h-[85vh] border border-gray-100/50">
        <div className="flex justify-between items-center px-6 py-5 bg-white border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Família e Convites</h3>
            <p className="text-xs text-gray-500">Pessoas com acesso às informações deste paciente.</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 space-y-6">
          {error && !showInviteModal && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-xl">{error}</div>}
          
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner className="w-6 h-6 text-gray-400" />
            </div>
          ) : (
            <>
              {/* MEMBERS SECTION */}
              <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center">
                    <Users className="w-4 h-4 mr-2" /> Membros
                  </h4>
                </div>
                <div className="divide-y divide-gray-100">
                  {members.map(m => (
                    <div key={m.user_id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                          {m.profile?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {m.profile?.name} {m.user_id === currentUserId && '(Você)'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {m.role === 'ADMIN' ? 'Administrador' : 'Membro'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* INVITES SECTION (ADMIN ONLY) */}
              {isAdmin && (
                <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                    <h4 className="text-sm font-semibold text-gray-700 flex items-center">
                      <UserPlus className="w-4 h-4 mr-2" /> Convites
                    </h4>
                    <button 
                      onClick={() => { setShowInviteModal(true); setInviteLink(''); setError(''); }}
                      className="text-xs font-medium text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded-full transition-colors uppercase tracking-wider"
                    >
                      Convidar Familiar
                    </button>
                  </div>
                  
                  <div className="divide-y divide-gray-100">
                    {invites.filter(i => i.status === 'pending').length === 0 ? (
                      <p className="p-4 text-sm text-gray-500 text-center">Nenhum convite pendente.</p>
                    ) : (
                      invites.filter(i => i.status === 'pending').map(i => (
                        <div key={i.id} className="p-4 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Convite pendente</p>
                            <p className="text-xs text-gray-500">
                              Expira em: {new Date(i.expires_at).toLocaleDateString()} {new Date(i.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <button 
                            onClick={() => handleRevoke(i.id)}
                            disabled={actionLoading}
                            className="text-xs font-medium text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Revogar
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
        </div>
      </div>
    </div>

    {/* INVITE GENERATION MODAL */}
    {showInviteModal && (
      <div className="fixed inset-0 z-[110] overflow-y-auto bg-black/40 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6 text-center">
        <div className="relative transform overflow-hidden rounded-3xl bg-white text-center shadow-2xl transition-all w-full max-w-sm flex flex-col max-h-[85vh] p-6 border border-gray-100/50">
          
          {!inviteLink ? (
            <>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Convide um familiar</h3>
              <p className="text-sm text-gray-500 mb-6">
                Envie este convite para alguém que você deseja que tenha acesso às informações deste paciente.
              </p>
              
              {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-xl mb-6">{error}</div>}
              
              <div className="space-y-3">
                <Button 
                  className="w-full" 
                  onClick={handleCreateInvite} 
                  disabled={actionLoading}
                >
                  {actionLoading ? <Spinner className="text-white" /> : 'Gerar Convite'}
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full" 
                  onClick={() => setShowInviteModal(false)}
                >
                  Cancelar
                </Button>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Convite criado</h3>
              <p className="text-sm text-gray-500 mb-6">
                Envie este convite para seu familiar.<br/><br/>
                <span className="font-medium text-indigo-600">Este convite é válido por 24 horas.</span>
              </p>
              
              <input 
                type="text" 
                readOnly 
                value={inviteLink} 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none mb-6 text-center text-gray-600"
              />

              <div className="space-y-3">
                <Button 
                  className="w-full" 
                  onClick={handleCopy}
                >
                  <Link className="w-4 h-4 mr-2" /> Compartilhar Convite
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full" 
                  onClick={() => setShowInviteModal(false)}
                >
                  Fechar
                </Button>
              </div>
            </>
          )}

        </div>
        </div>
      </div>
    )}
    </>
  );
}
