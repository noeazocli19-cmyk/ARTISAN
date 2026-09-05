'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Sparkles, CheckCircle2, Loader2 } from 'lucide-react';

interface PremiumCardProps {
  isPremium: boolean;
  premiumUntil: string | null;
  onActivated: () => void;
}

export function PremiumCard({ isPremium, premiumUntil, onActivated }: PremiumCardProps) {
  const [loaded, setLoaded] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if ((window as any).openKkiapayWidget) {
      setLoaded(true);
      return;
    }
    const existing = document.querySelector('script[src="https://cdn.kkiapay.me/kkiapay.js"]');
    if (existing) {
      setLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.kkiapay.me/kkiapay.js';
    script.onload = () => setLoaded(true);
    document.body.appendChild(script);
  }, []);

  const handleSubscribe = useCallback(async () => {
    setProcessing(true);
    try {
      const res = await fetch('/api/payments/premium/initiate', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Erreur lors de l\'initialisation du paiement');
        setProcessing(false);
        return;
      }

      if (data.demoMode) {
        // Pas de Kkiapay configuré : on simule le succès pour la démo
        const verifyRes = await fetch(`/api/payments/verify?reference=${data.reference}&redirect=false`);
        await verifyRes.json();
        toast.success('Abonnement Premium activé (mode démo) !');
        onActivated();
        setProcessing(false);
        return;
      }

      const w = window as any;
      if (loaded && typeof w.openKkiapayWidget === 'function') {
        w.openKkiapayWidget({
          amount: data.amount,
          key: data.kkiapayPublicKey,
          sandbox: data.sandbox,
          data: { reference: data.reference },
        });
        w.addSuccessListener?.(({ transactionId }: { transactionId: string }) => {
          fetch(`/api/payments/verify?reference=${data.reference}&transactionId=${transactionId}&redirect=false`)
            .then(() => {
              toast.success('Abonnement Premium activé !');
              onActivated();
            })
            .finally(() => setProcessing(false));
        });
        w.addFailedListener?.(() => {
          toast.error('Paiement échoué');
          setProcessing(false);
        });
      } else {
        toast.error('Le module de paiement n\'a pas pu se charger, réessaie.');
        setProcessing(false);
      }
    } catch {
      toast.error('Erreur réseau');
      setProcessing(false);
    }
  }, [loaded, onActivated]);

  if (isPremium) {
    const until = premiumUntil ? new Date(premiumUntil).toLocaleDateString('fr-FR') : null;
    return (
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle2 className="h-5 w-5" />
          <p className="font-bold">Vous êtes Artisan Vérifié</p>
        </div>
        {until && <p className="text-sm text-white/90">Actif jusqu&apos;au {until}</p>}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-2xl p-5 text-white shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-5 w-5" />
        <p className="font-bold">Devenez Artisan Vérifié</p>
      </div>
      <p className="text-sm text-white/90 mb-4">
        Badge de confiance + position prioritaire dans les résultats de recherche pendant 30 jours.
      </p>
      <button
        onClick={handleSubscribe}
        disabled={processing}
        className="w-full bg-white text-fuchsia-700 font-semibold rounded-full py-2.5 text-sm hover:bg-white/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {processing ? 'Traitement...' : 'Activer pour 5 000 FCFA'}
      </button>
    </div>
  );
}
