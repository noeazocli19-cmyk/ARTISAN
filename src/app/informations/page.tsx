'use client'

import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { PricingSection } from '@/components/pricing-section'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Card, CardContent } from '@/components/ui/card'
import { Shield, CreditCard, Navigation, MessageSquare, Headphones, ThumbsUp, Globe, ArrowLeft } from 'lucide-react'

const trustFeatures = [
  { icon: Shield, title: 'Identité vérifiée', description: 'Chaque artisan passe par un processus rigoureux de vérification avant de rejoindre FINDA.' },
  { icon: ThumbsUp, title: 'Avis authentiques', description: 'Seuls les clients ayant réellement utilisé un service peuvent laisser un avis.' },
  { icon: CreditCard, title: 'Paiement sécurisé', description: 'Vos transactions sont protégées jusqu’à la validation du travail réalisé.' },
  { icon: Headphones, title: 'Support disponible', description: 'Notre équipe vous accompagne en cas de question ou de problème.' },
  { icon: Navigation, title: 'Géolocalisation précise', description: 'La position GPS permet de trouver rapidement les artisans disponibles à proximité.' },
  { icon: MessageSquare, title: 'Messagerie directe', description: 'Discutez en temps réel avec les artisans avant de réserver.' },
]

const questions = [
  ['Comment fonctionne FINDA ?', 'Décrivez votre besoin, comparez les artisans disponibles près de vous, puis choisissez et réservez celui qui convient à votre projet.'],
  ['Comment les artisans sont-ils vérifiés ?', 'Chaque artisan doit fournir une pièce d’identité, des certifications pertinentes, des références professionnelles et obtenir une validation.'],
  ['Quels moyens de paiement sont acceptés ?', 'FINDA accepte les cartes bancaires, Mobile Money, les virements bancaires et certains paiements en espèces via nos points de service.'],
  ['Que faire en cas d’insatisfaction ?', 'Vous pouvez ouvrir un litige dans les délais indiqués. Notre équipe étudiera le dossier afin de proposer une solution adaptée.'],
  ['FINDA est-il disponible partout en Afrique ?', 'La plateforme couvre actuellement plusieurs pays africains et étend régulièrement sa zone de disponibilité.'],
]

export default function InformationsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar onOpenAuth={() => window.location.href = '/login'} onSearch={() => undefined} />
      <main className="pt-24 pb-20">
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700"><ArrowLeft className="h-4 w-4" /> Retour à l’accueil</Link>
          <div className="mt-6 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">En savoir plus</p>
            <h1 className="mt-3 text-4xl font-bold sm:text-5xl">Informations sur FINDA</h1>
            <p className="mt-4 text-lg text-muted-foreground">Sécurité, fonctionnalités, tarifs et questions fréquentes réunis sur une seule page.</p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-14">
          <h2 className="text-2xl font-bold mb-7">Pourquoi faire confiance à FINDA</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {trustFeatures.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="h-full"><CardContent className="p-6"><div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/30"><Icon className="h-5 w-5" /></div><h3 className="font-semibold">{title}</h3><p className="mt-2 text-sm text-muted-foreground leading-relaxed">{description}</p></CardContent></Card>
            ))}
          </div>
        </section>

        <section className="mt-20 bg-muted/30 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-7">Une plateforme disponible et performante</h2>
            <div className="grid gap-5 md:grid-cols-3">
              {[['GPS', 'Recherche autour de votre position', Navigation], ['Sécurisé', 'Accès aux données protégé', Shield], ['Afrique', 'Réseau de services en expansion', Globe]].map(([stat, label, Icon]) => {
                const StatusIcon = Icon as typeof Navigation
                return <Card key={String(stat)}><CardContent className="p-6"><StatusIcon className="h-6 w-6 text-brand-600 mb-4" /><p className="text-3xl font-bold">{String(stat)}</p><p className="mt-1 text-sm text-muted-foreground">{String(label)}</p></CardContent></Card>
              })}
            </div>
          </div>
        </section>

        <PricingSection />

        <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 mt-20">
          <h2 className="text-center text-3xl font-bold mb-8">Questions fréquentes</h2>
          <Accordion type="single" collapsible>
            {questions.map(([question, answer], index) => (
              <AccordionItem key={question} value={`faq-${index}`}><AccordionTrigger className="text-left">{question}</AccordionTrigger><AccordionContent className="text-muted-foreground">{answer}</AccordionContent></AccordionItem>
            ))}
          </Accordion>
        </section>
      </main>
    </div>
  )
}
