import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mentions Légales - FINDA',
  description: 'Mentions légales de la plateforme FINDA',
}

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <h1 className="text-3xl font-bold text-brand-600 mb-8">
            Mentions Légales
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            Dernière mise à jour : Septembre 2026
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">1. Éditeur de la Plateforme</h2>
          <p className="mb-4">
            <strong>FINDA</strong><br />
            Plateforme de mise en relation avec des artisans au Bénin<br />
            Fondée en 2025<br />
            Statut : Projet réalisé dans le cadre d'une formation<br />
            Fondateur et directeur de la publication : NOE AZOCLI EZECKIAS<br />
            Email : noeazocli19@gmail.com<br />
            Téléphone : +229 01 56 16 16 19
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">2. Hébergement</h2>
          <p className="mb-4">
            <strong>Hébergement web</strong><br />
            Vercel Inc.<br />
            340 S Lemon Ave #4133<br />
            Walnut, CA 91789<br />
            États-Unis<br />
            Site : https://vercel.com
          </p>
          <p className="mb-4">
            <strong>Base de données</strong><br />
            Neon<br />
            Site : https://neon.tech
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">3. Paiements</h2>
          <p className="mb-4">
            <strong>Prestataire de paiement</strong><br />
            Kkiapay<br />
            Agrégateur de paiement africain<br />
            Site : https://kkiapay.me<br />
            Email : contact@kkiapay.me
          </p>
          <p className="mb-4">
            Kkiapay est le prestataire de service de paiement de la Plateforme. Les paiements sont sécurisés et traités par Kkiapay. FINDA ne stocke aucune donnée bancaire.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">4. Propriété intellectuelle</h2>
          <p className="mb-4">
            L'ensemble des éléments de la Plateforme (textes, images, logos, design, code) est protégé par le droit de la propriété intellectuelle. Toute reproduction, représentation, modification ou exploitation, par quelque procédé que ce soit, sans autorisation préalable, est interdite.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">5. Responsabilité</h2>
          <p className="mb-4">
            FINDA met tout en œuvre pour assurer la disponibilité et la sécurité de la Plateforme. Cependant, la Plateforme ne peut garantir un fonctionnement sans interruption ni erreur. La responsabilité d'FINDA ne saurait être engagée en cas de :
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Indisponibilité temporaire de la Plateforme</li>
            <li>Perte de données (malgré nos sauvegardes)</li>
            <li>Attentes non satisfaites par les artisans</li>
            <li>Liens vers des sites tiers</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">6. Liens hypertextes</h2>
          <p className="mb-4">
            La Plateforme peut contenir des liens vers des sites tiers. FINDA n'a aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">7. Droit applicable</h2>
          <p className="mb-4">
            Les présentes mentions légales sont régies par le droit béninois. En cas de litige, les tribunaux béninois seront seuls compétents.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">8. Contact</h2>
          <p className="mb-4">
            Pour toute question relative aux mentions légales, vous pouvez nous contacter :
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Email : noeazocli19@gmail.com</li>
            <li>Téléphone : +229 01 56 16 16 19</li>
            <li>Adresse : Cotonou, Bénin</li>
          </ul>

          <div className="mt-12 p-6 bg-brand-50 dark:bg-brand-950/30 rounded-xl">
            <p className="text-sm text-muted-foreground">
              © 2025 FINDA - Plateforme de mise en relation avec des artisans au Bénin. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}