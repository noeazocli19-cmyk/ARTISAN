'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Loader2, Wallet } from 'lucide-react';

interface DepositButtonProps {
  missionId: string;
  artisanId: string;
  amount: number;
  label: string;
  onPaid: () => void;
}

export function DepositButton({ missionId, artisanId, amount, label, onPaid }: DepositButtonProps) {
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

  const handlePay = useCallback(async () => {
    setProcessing(true);
    try {
      const res = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          method: 'orange_money',
          type: 'payment',
          missionId,
          artisanId,
          description: label,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erreur lors de l'initialisation du paiement");
        setProcessing(false);
        return;
      }

      if (data.status !== 'processing') {
        toast.success('Paiement enregistre (mode demo) !');
        onPaid();
        setProcessing(false);
        return;
      }

      const w = window as any;
      if (loaded && typeof w.openKkiapayWidget === 'function') {
        w.openKkiapayWidget({
          amount: data.kkiapay.amount,
          key: data.kkiapay.publicKey,
          sandbox: data.kkiapay.sandbox,
          data: { reference: data.reference },
        });
        w.addSuccessListener?.(({ transactionId }: { transactionId: string }) => {
          fetch(`/api/payments/verify?reference=${data.reference}&transactionId=${transactionId}&redirect=false`)
            .then(() => {
              toast.success('Paiement reussi !');
              onPaid();
            })
            .finally(() => setProcessing(false));
        });
        w.addFailedListener?.(() => {
          toast.error('Paiement echoue');
          setProcessing(false);
        });
      } else {
        toast.error("Le module de paiement n'a pas pu se charger, reessaie.");
        setProcessing(false);
      }
    } catch {
      toast.error('Erreur reseau');
      setProcessing(false);
    }
  }, [loaded, amount, missionId, artisanId, label, onPaid]);

  return (
    <button
      onClick={handlePay}
      disabled={processing}
      className="w-full bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-semibold rounded-full py-2.5 text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
    >
      {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
      {processing ? 'Traitement...' : `${label} - ${amount.toLocaleString('fr-FR')} FCFA`}
    </button>
  );
}