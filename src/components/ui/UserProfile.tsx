import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { LogOut, User, Camera } from 'lucide-react';
import { getCurrentProfile } from '../../services/api';

export function UserProfile() {
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProfile();
    
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function loadProfile() {
    const p = await getCurrentProfile();
    if (p) {
      if (p.avatar_url) {
        // Just in case it's a full URL or a storage path. If it's a path, we'd need to sign it.
        // For avatars, a public bucket is best. Let's assume we use 'family-assets' bucket or just read it.
        // Let's get signed URL if it's a path.
        const { data } = await supabase.storage.from('patient-profile').createSignedUrl(p.avatar_url, 60 * 60 * 24);
        p.avatarUrlSigned = data?.signedUrl || p.avatar_url;
      }
      setProfile(p);
    }
  }

  const handleSignOut = () => {
    supabase.auth.signOut();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !profile) return;
    const file = event.target.files[0];
    
    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `avatars/${profile.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('patient-profile')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: filePath } as any)
        .eq('id', profile.id);

      if (updateError) throw updateError;
      
      await loadProfile();
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Erro ao fazer upload da foto.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getInitials = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden active:scale-95 transition-transform relative group"
      >
        {profile?.avatarUrlSigned ? (
          <img src={profile.avatarUrlSigned} alt={profile.name} className="w-full h-full object-cover" />
        ) : (
          <span className="font-semibold text-gray-600">{getInitials(profile?.name || '')}</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900 truncate">{profile?.name || 'Carregando...'}</p>
            <p className="text-xs text-gray-500 truncate">{profile?.email}</p>
          </div>
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
          >
            <Camera className="w-4 h-4 mr-2 text-gray-400" />
            {uploading ? 'Enviando...' : 'Trocar foto'}
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
          
          <button 
            onClick={handleSignOut}
            className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </button>
        </div>
      )}
    </div>
  );
}
