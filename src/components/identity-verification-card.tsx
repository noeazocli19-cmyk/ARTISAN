'use client';

import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { ShieldCheck, ShieldAlert, Clock, Loader2, Upload } from 'lucide-react';

interface Props {
  identityStatus: string;
  onSubmitted: () => void;
}

export function IdentityVerificationCard({ identityStatus, onSubmitted }: Props) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error("Merci d'envoyer une image (photo de la pièce d'identité).");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'portfolio');
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.url) {
        toast.error(uploadData.error || "Erreur lors de l'envoi du document");
        return;
      }
      const res = await fetch('/api/artisans/identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentUrl: uploadData.url }),
      });
      if (res.ok) {
        toast.success('Document envoyé ! En attente de vérification.');
        onSubmitted();
      } else {
        toast.error("Erreur lors de l'envoi de la demande");
      }
    } catch {
      toast.error('Erreur réseau');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  if (identityStatus === 'approuve') {
    return (
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white shadow-sm flex items-center gap-3">
        <ShieldCheck className="h-6 w-6 shrink-0" />
        <div>
          <p className="font-bold">Identité vérifiée</p>
          <p className="text-sm text-white/90">Votre profil affiche le badge de confiance.</p>
        </div>
      </div>
    );
  }

  if (identityStatus === 'en_attente') {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-3">
        <Clock className="h-6 w-6 text-amber-500 shrink-0" />
        <div>
          <p className="font-bold text-amber-800">Vérification en cours</p>
          <p className="text-sm text-amber-700">Votre document est en cours d'examen par notre équipe.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-2">
        <ShieldAlert className="h-5 w-5 text-gray-400" />
        <p className="font-bold text-gray-900">
          {identityStatus === 'refuse' ? 'Vérification refusée — réessayez' : 'Vérifiez votre identité'}
        </p>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Envoyez une photo de votre pièce d'identité pour obtenir le badge de confiance et rassurer vos futurs clients.
      </p>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white font-semibold rounded-full py-2.5 text-sm hover:bg-gray-800 transition-colors disabled:opacity-60"
      >
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {uploading ? 'Envoi...' : 'Envoyer ma pièce d\'identité'}
      </button>
    </div>
  );
}
