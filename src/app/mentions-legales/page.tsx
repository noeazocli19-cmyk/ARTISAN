import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mentions Légales - Artisan Connect',
  description: 'Mentions légales de la plateforme Artisan Connect',
}

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <h1 className="text-3xl font-bold text-amber-600 mb-8">
            Mentions Légales
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            Dernière mise à jour : Juin 2025
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">1. Éditeur de la Plateforme</h2>
          <p className="mb-4">
            <strong>Artisan Connect</strong><br />
            La 1ère plateforme d'artisans en Afrique<br />
            Fondée en 2025<br />
            Fondateur : NOE AZOCLI EZECKIAS<br />
            Email : support@artisan-connect.com<br />
            Téléphone : +221 77 123 456
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
            Kkiapay est le prestataire de service de paiement de la Plateforme. Les paiements sont sécurisés et traités par Kkiapay. Artisan Connect ne stocke aucune donnée bancaire.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">4. Propriété intellectuelle</h2>
          <p className="mb-4">
            L'ensemble des éléments de la Plateforme (textes, images, logos, design, code) est protégé par le droit de la propriété intellectuelle. Toute reproduction, représentation, modification ou exploitation, par quelque procédé que ce soit, sans autorisation préalable, est interdite.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">5. Responsabilité</h2>
          <p className="mb-4">
            Artisan Connect met tout en œuvre pour assurer la disponibilité et la sécurité de la Plateforme. Cependant, la Plateforme ne peut garantir un fonctionnement sans interruption ni erreur. La responsabilité d'Artisan Connect ne saurait être engagée en cas de :
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Indisponibilité temporaire de la Plateforme</li>
            <li>Perte de données (malgré nos sauvegardes)</li>
            <li>Attentes non satisfaites par les artisans</li>
            <li>Liens vers des sites tiers</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">6. Liens hypertextes</h2>
          <p className="mb-4">
            La Plateforme peut contenir des liens vers des sites tiers. Artisan Connect n'a aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">7. Droit applicable</h2>
          <p className="mb-4">
            Les présentes mentions légales sont régies par le droit sénégalais. En cas de litige, les tribunaux sénégalais seront seuls compétents.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">8. Contact</h2>
          <p className="mb-4">
            Pour toute question relative aux mentions légales, vous pouvez nous contacter :
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Email : support@artisan-connect.com</li>
            <li>Téléphone : +221 77 123 456</li>
            <li>Adresse : Dakar, Sénégal</li>
          </ul>

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