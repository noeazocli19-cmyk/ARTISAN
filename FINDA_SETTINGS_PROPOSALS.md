# FINDA — Propositions du centre de configuration

## Séparer les espaces
### Administration plateforme
- Informations générales et identité FINDA.
- Métiers, catégories, zones géographiques et devises.
- Activation des paiements et paramètres de sécurité publique.
- Règles de publication, modération et visibilité.
- Notifications transactionnelles.
- Fonctionnalités activées ou désactivées.

### Paramètres personnels
- Profil, sécurité du compte, notifications et préférences.
- Disponibilité, localisation, méthode de paiement et confidentialité.

## Sécurité
- Les clés FeexPay, jetons, webhooks et secrets restent côté serveur.
- Afficher uniquement un état de configuration masqué (configuré/non configuré).
- Accès réservé aux rôles administrateur et journaliser chaque modification sensible.
- Prévoir validation, test de connexion et vue d’audit.

## Priorité
Commencer par les catégories, zones, règles de publication, modération et identité de la plateforme. Ajouter ensuite les paramètres de paiement lorsque FeexPay est entièrement configuré.
