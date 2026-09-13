Générer les clés VAPID pour Web Push

1) Installer l'outil `web-push` si nécessaire (global ou via npx):

```bash
npx web-push generate-vapid-keys --json
```

2) La commande retourne un JSON avec `publicKey` et `privateKey`.
Copiez ces valeurs dans votre fichier `.env.local` à la racine du projet :

```
VAPID_PUBLIC_KEY=BN... (valeur publique)
VAPID_PRIVATE_KEY=0x... (valeur privée)
SUPPORT_EMAIL=contact@votre-domaine.tld
```

3) Redémarrez le serveur de développement (`pnpm dev`) pour que les variables soient prises en compte.

Notes :
- Le champ `SUPPORT_EMAIL` est utilisé dans l'entête VAPID (mailto:).
- En production, gardez la clef privée secrète et placez-la dans votre gestionnaire de secrets.
- Si vous préférez, générez les clés localement et demandez-moi de les ajouter, mais ne committez jamais la clef privée dans le dépôt public.
