import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politique de Confidentialité - Artisan Connect',
  description: 'Politique de protection des données personnelles',
}

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <h1 className="text-3xl font-bold text-amber-600 mb-8">
            Politique de Confidentialité
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            Dernière mise à jour : Juin 2025
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">1. Responsable du traitement</h2>
          <p className="mb-4">
            Le responsable du traitement des données personnelles est Artisan Connect, représenté par son fondateur. Pour toute question relative à vos données personnelles, vous pouvez contacter : support@artisan-connect.com
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">2. Données collectées</h2>
          <p className="mb-4">Nous collectons les données suivantes :</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Données d'identification</strong> : nom, prénom, email, téléphone</li>
            <li><strong>Données de localisation</strong> : pays, ville, adresse</li>
            <li><strong>Données professionnelles</strong> : spécialités, tarif, expérience (pour les artisans)</li>
            <li><strong>Données financières</strong> : historique des transactions, solde du wallet</li>
            <li><strong>Données techniques</strong> : adresse IP, type de navigateur, cookies</li>
            <li><strong>Données de profil</strong> : photo de profil, biographie</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">3. Finalités du traitement</h2>
          <p className="mb-4">Vos données sont utilisées pour :</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Créer et gérer votre compte</li>
            <li>Faciliter la mise en relation entre clients et artisans</li>
            <li>Traiter les paiements et gérer le wallet</li>
            <li>Communiquer avec vous (notifications, emails)</li>
            <li>Vérifier votre identité (sécurité)</li>
            <li>Améliorer nos services</li>
            <li>Respecter les obligations légales</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">4. Base légale</h2>
          <p className="mb-4">Le traitement de vos données repose sur :</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Votre consentement</strong> (inscription, cookies)</li>
            <li><strong>L'exécution d'un contrat</strong> (paiements, missions)</li>
            <li><strong>L'intérêt légitime</strong> (sécurité, lutte contre la fraude)</li>
            <li><strong>L'obligation légale</strong> (facturation, lutte anti-blanchiment)</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">5. Durée de conservation</h2>
          <p className="mb-4">
            Vos données sont conservées pendant toute la durée de votre compte, puis archivées pendant 5 ans pour les données financières (obligations légales). Au-delà, elles sont supprimées définitivement.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">6. Destinataires des données</h2>
          <p className="mb-4">Vos données peuvent être partagées avec :</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Kkiapay</strong> : pour le traitement des paiements</li>
            <li><strong>Fournisseurs d'email</strong> : pour l'envoi d'emails</li>
            <li><strong>Hébergeurs</strong> : Neon (base de données), Vercel (hébergement)</li>
            <li><strong>Autorités</strong> : en cas de requête légale</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">7. Vos droits</h2>
          <p className="mb-4">Conformément au RGPD et à la loi sénégalaise, vous disposez de :</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Droit d'accès</strong> : consulter vos données</li>
            <li><strong>Droit de rectification</strong> : corriger vos données</li>
            <li><strong>Droit d'effacement</strong> : supprimer votre compte</li>
            <li><strong>Droit à la portabilité</strong> : récupérer vos données</li>
            <li><strong>Droit d'opposition</strong> : refuser certains traitements</li>
            <li><strong>Droit de limitation</strong> : limiter certains traitements</li>
          </ul>
          <p className="mb-4">
            Pour exercer ces droits, contactez-nous : support@artisan-connect.com
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">8. Sécurité</h2>
          <p className="mb-4">
            Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données : chiffrement, authentification, sauvegardes, pare-feu. Vos mots de passe sont hashés avec bcrypt.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">9. Cookies</h2>
          <p className="mb-4">
            Nous utilisons des cookies pour le fonctionnement de la plateforme (session, préférences). Vous pouvez les désactiver dans votre navigateur.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">10. Transferts hors UE</h2>
          <p className="mb-4">
            Certaines données peuvent être traitées hors de l'Union Européenne (États-Unis, Afrique). Nous nous assurons que ces transferts respectent les garanties appropriées.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">11. Réclamations</h2>
          <p className="mb-4">
            Si vous estimez que vos droits ne sont pas respectés, vous pouvez déposer une réclamation auprès de l'autorité de protection des données de votre pays.
          </p>

          <div className="mt-12 p-6 bg-amber-50 dark:bg-amber-950/30 rounded-xl">
            <p className="text-sm text-muted-foreground">
              © 2025 Artisan Connect - La 1ère plateforme d'artisans en Afrique. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}