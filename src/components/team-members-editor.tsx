'use client';

import { useEffect, useState } from 'react';
import { Users, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

const MAX_MEMBERS = 20;
const MAX_LENGTH = 60;

function parseNames(value: unknown): string[] {
  let list: unknown = value;
  if (typeof value === 'string') {
    try {
      list = JSON.parse(value);
    } catch {
      return [];
    }
  }
  return Array.isArray(list)
    ? list.filter((n): n is string => typeof n === 'string' && n.trim().length > 0)
    : [];
}

export function TeamMembersEditor() {
  const [members, setMembers] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/artisans/profile')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.artisan) setMembers(parseNames(data.artisan.teamMembers));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const persist = async (next: string[], successMessage: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/artisans/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamMembers: next }),
      });
      if (res.ok) {
        setMembers(next);
        toast.success(successMessage);
        return true;
      }
      toast.error("Impossible d'enregistrer l'équipe");
    } catch {
      toast.error('Erreur réseau');
    } finally {
      setSaving(false);
    }
    return false;
  };

  const handleAdd = async () => {
    const clean = name.trim().replace(/\s+/g, ' ');
    if (!clean) return;
    if (clean.length > MAX_LENGTH) {
      toast.error(`Nom trop long (${MAX_LENGTH} caractères maximum)`);
      return;
    }
    if (members.length >= MAX_MEMBERS) {
      toast.error(`Maximum ${MAX_MEMBERS} membres`);
      return;
    }
    if (members.some((m) => m.toLowerCase() === clean.toLowerCase())) {
      toast.error('Ce nom existe déjà dans votre équipe');
      return;
    }
    const ok = await persist([...members, clean], 'Membre ajouté');
    if (ok) setName('');
  };

  const handleRemove = async (index: number) => {
    await persist(members.filter((_, i) => i !== index), 'Membre retiré');
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        <Users className="inline h-4 w-4 mr-1 text-brand-500" />
        Notre équipe
      </label>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
        Ajoutez les noms de vos employés. Ils apparaîtront sur votre fiche publique.
      </p>

      <div className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder="Nom de l'employé"
          maxLength={MAX_LENGTH}
          disabled={loading || saving}
          className="flex-1 border rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-brand-400 focus:border-brand-400 outline-none"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={loading || saving || !name.trim()}
          className="inline-flex items-center gap-1 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 transition"
        >
          <Plus className="h-4 w-4" />
          Ajouter
        </button>
      </div>

      {!loading && members.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">Aucun membre pour le moment.</p>
      )}

      {members.length > 0 && (
        <ul className="flex flex-wrap gap-2 mt-3">
          {members.map((member, index) => (
            <li
              key={`${member}-${index}`}
              className="inline-flex items-center gap-1 rounded-full bg-brand-50 dark:bg-gray-800 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-gray-700 pl-3 pr-1 py-1 text-sm"
            >
              {member}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                disabled={saving}
                aria-label={`Retirer ${member}`}
                className="rounded-full p-1 hover:bg-brand-100 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}