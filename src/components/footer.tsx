import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
        <span>&copy; {new Date().getFullYear()} Finda</span>
        <Link href="/cgu" className="hover:text-brand-600 transition">Conditions d&apos;utilisation</Link>
        <Link href="/confidentialite" className="hover:text-brand-600 transition">Politique de confidentialite</Link>
        <Link href="/mentions-legales" className="hover:text-brand-600 transition">Mentions legales</Link>
        <Link href="/contact" className="hover:text-brand-600 transition">Contact</Link>
      </div>
    </footer>
  )
}