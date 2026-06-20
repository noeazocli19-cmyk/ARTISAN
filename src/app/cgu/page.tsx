import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CGU - Artisan Connect',
  description: 'Conditions Générales d\'Utilisation d\'Artisan Connect',
}

export default function CGUPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <h1 className="text-3xl font-bold text-amber-600 mb-8">
            Conditions Générales d'Utilisation
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            Dernière mise à jour : Juin 2025
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">Article 1 : Objet</h2>
          <p className="mb-4">
            Les présentes Conditions Générales d'Utilisation (ci-après "CGU") régissent l'utilisation de la plateforme Artisan Connect (ci-après "la Plateforme"), accessible à l'adresse https://artisan-nine-sigma.vercel.app. La Plateforme a pour objet la mise en relation entre des clients recherchant des services d'artisans et des artisans proposant leurs services en Afrique.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">Article 2 : Définitions</h2>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Plateforme</strong> : Désigne le site web Artisan Connect</li>
            <li><strong>Client</strong> : Utilisateur recherchant des services d'artisans</li>
            <li><strong>Artisan</strong> : Utilisateur proposant des services</li>
            <li><strong>Utilisateur</strong> : Désigne indistinctement le Client ou l'Artisan</li>
            <li><strong>Mission</strong> : Demande de service créée par un Client</li>
            <li><strong>Wallet</strong> : Portefeuille virtuel de l'Utilisateur</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">Article 3 : Inscription et compte</h2>
          <p className="mb-4">
            L'inscription sur la Plateforme est gratuite. L'Utilisateur doit fournir des informations exactes et complètes lors de son inscription. L'Utilisateur est responsable de la confidentialité de son mot de passe et de toutes les activités effectuées depuis son compte.
          </p>
          <p className="mb-4">
            La vérification de l'adresse email est obligatoire pour activer le compte. L'Utilisateur doit être âgé d'au moins 18 ans pour s'inscrire.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">Article 4 : Services proposés</h2>
          <p className="mb-4">
            La Plateforme facilite la mise en relation entre Clients et Artisans. Artisan Connect n'est pas partie au contrat de prestation de services conclu entre le Client et l'Artisan. La Plateforme n'intervient que comme intermédiaire technique.
          </p>
          <p className="mb-4">
            Les catégories de services disponibles incluent : plomberie, électricité, menuiserie, peinture, serrurerie, maçonnerie, climatisation, nettoyage, couture, pâtisserie, mécanique, coiffure, parmi d'autres.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">Article 5 : Paiements et commissions</h2>
          <p className="mb-4">
            Les paiements sur la Plateforme sont sécurisés via l'agrégateur Kkiapay. Les méthodes de paiement acceptées sont : Orange Money, MTN Money, Wave, Moov Money, carte bancaire et espèces.
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Dépôt</strong> : Commission de 2% (minimum 100 FCFA, maximum 5 000 FCFA)</li>
            <li><strong>Paiement de mission</strong> : Commission de 5% prélevée sur le paiement de l'artisan</li>
            <li><strong>Retrait</strong> : Gratuit</li>
            <li><strong>Transfert</strong> : Gratuit</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">Article 6 : Responsabilités</h2>
          <p className="mb-4">
            Artisan Connect ne saurait être tenu responsable de la qualité des services fournis par les Artisans. La Plateforme ne garantit pas que les services répondront aux attentes du Client. L'Utilisateur reconnaît utiliser la Plateforme à ses propres risques.
          </p>
          <p className="mb-4">
            Artisan Connect décline toute responsabilité en cas de litige entre un Client et un Artisan concernant l'exécution d'une mission. Les Utilisateurs sont invités à régler leurs litiges à l'amiable.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">Article 7 : Obligations des Utilisateurs</h2>
          <p className="mb-4">L'Utilisateur s'engage à :</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Fournir des informations exactes et sincères</li>
            <li>Ne pas usurper l'identité d'autrui</li>
            <li>Respecter les lois et règlements en vigueur</li>
            <li>Ne pas porter atteinte aux droits des autres Utilisateurs</li>
            <li>Ne pas utiliser la Plateforme à des fins frauduleuses</li>
            <li>Respecter les délais convenus pour les missions</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">Article 8 : Avis et évaluations</h2>
          <p className="mb-4">
            Les Utilisateurs peuvent laisser des avis et évaluations à l'issue d'une mission. Les avis doivent être sincères et objectifs. Artisan Connect se réserve le droit de modérer les avis injurieux ou diffamatoires.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">Article 9 : Données personnelles</h2>
          <p className="mb-4">
            Le traitement des données personnelles est régi par notre Politique de Confidentialité, accessible séparément. Artisan Connect s'engage à protéger les données personnelles des Utilisateurs conformément aux lois applicables.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">Article 10 : Propriété intellectuelle</h2>
          <p className="mb-4">
            La Plateforme et son contenu (textes, images, logos, design) sont protégés par le droit de la propriété intellectuelle. Toute reproduction sans autorisation est interdite.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">Article 11 : Suspension et résiliation</h2>
          <p className="mb-4">
            Artisan Connect se réserve le droit de suspendre ou résilier le compte d'un Utilisateur en cas de manquement aux présentes CGU. L'Utilisateur peut supprimer son compte à tout moment.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">Article 12 : Modification des CGU</h2>
          <p className="mb-4">
            Artisan Connect se réserve le droit de modifier les présentes CGU à tout moment. Les modifications entrent en vigueur dès leur publication sur la Plateforme.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">Article 13 : Droit applicable</h2>
          <p className="mb-4">
            Les présentes CGU sont régies par le droit sénégalais. Tout litige relatif à l'interprétation ou l'exécution des CGU sera soumis aux tribunaux compétents de Dakar.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">Article 14 : Contact</h2>
          <p className="mb-4">
            Pour toute question relative aux CGU, vous pouvez contacter Artisan Connect à l'adresse : support@artisan-connect.com
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