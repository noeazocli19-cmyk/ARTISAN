"use client";

import { motion } from "framer-motion";
import {
  Check,
  Star,
  Zap,
  Crown,
  Sparkles,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface PlanFeature {
  text: string;
  highlighted?: boolean;
}

interface PricingPlan {
  name: string;
  icon: React.ReactNode;
  price: string;
  priceSuffix: string;
  description: string;
  features: PlanFeature[];
  cta: string;
  popular?: boolean;
  elite?: boolean;
}

const plans: PricingPlan[] = [
  {
    name: "Gratuit",
    icon: <Zap className="size-5" />,
    price: "0",
    priceSuffix: "FCFA/mois",
    description: "Pour les artisans qui débutent",
    features: [
      { text: "Profil basique" },
      { text: "5 demandes/mois" },
      { text: "Messagerie limitée" },
      { text: "Badge \"Nouveau\"" },
    ],
    cta: "Commencer gratuitement",
  },
  {
    name: "Pro",
    icon: <Star className="size-5" />,
    price: "5 000",
    priceSuffix: "FCFA/mois",
    description: "Pour les artisans actifs",
    features: [
      { text: "Profil complet" },
      { text: "Demandes illimitées" },
      { text: "Messagerie illimitée" },
      { text: "Badge \"Vérifié\"", highlighted: true },
      { text: "Mise en avant" },
      { text: "Statistiques avancées" },
      { text: "Support prioritaire" },
    ],
    cta: "Choisir Pro",
    popular: true,
  },
  {
    name: "Élite",
    icon: <Crown className="size-5" />,
    price: "15 000",
    priceSuffix: "FCFA/mois",
    description: "Pour les artisans d'excellence",
    features: [
      { text: "Tout du plan Pro" },
      { text: "Badge \"Élite\"", highlighted: true },
      { text: "Priorité dans les recherches" },
      { text: "Page portfolio personnalisée" },
      { text: "Conseiller dédié" },
      { text: "Rapports hebdomadaires" },
      { text: "Accès exclusif aux missions premium", highlighted: true },
    ],
    cta: "Choisir Élite",
    elite: true,
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.5,
      ease: "easeOut",
    },
  }),
};

const headerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export function PricingSection() {
  return (
    <section
      id="tarifs"
      className="relative w-full bg-gradient-to-b from-amber-50/50 to-white dark:from-amber-950/20 dark:to-background py-20 md:py-28"
    >
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 size-[600px] rounded-full bg-amber-200/20 blur-3xl dark:bg-amber-500/5" />
        <div className="absolute -bottom-20 right-0 size-[400px] rounded-full bg-orange-200/20 blur-3xl dark:bg-orange-500/5" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={headerVariants}
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-100/80 px-4 py-1.5 text-sm font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
            <Sparkles className="size-4" />
            Tarifs simples & transparents
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Choisissez le plan qui
            <span className="bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
              {" "}convient à votre activité
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Démarrez gratuitement et évoluez à votre rythme. Tous les plans incluent
            l&apos;accès à la plateforme Artisan Connect.
          </p>
        </motion.div>

        {/* Pricing cards */}
        <div className="mt-14 grid grid-cols-1 items-start gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              custom={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeInUp}
              className={cn(
                plan.popular && "md:-mt-4 md:mb-0"
              )}
            >
              <Card
                className={cn(
                  "relative flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-lg",
                  // Pro card: amber gradient border + glow
                  plan.popular && [
                    "border-0 ring-2 ring-amber-400/60 dark:ring-amber-500/50",
                    "shadow-xl shadow-amber-200/40 dark:shadow-amber-900/30",
                    "lg:scale-105",
                    "before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-b before:from-amber-400/5 before:to-orange-400/5 dark:before:from-amber-400/10 dark:before:to-orange-400/10",
                  ],
                  // Élite card: subtle warm border
                  plan.elite && [
                    "border-amber-200/60 dark:border-amber-800/40",
                  ],
                  // Gratuit card: default
                  !plan.popular && !plan.elite && [
                    "border-border",
                  ]
                )}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute inset-x-0 top-0 flex justify-center">
                    <div className="relative -top-0 translate-y-[-50%]">
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 px-4 py-1 text-xs font-semibold shadow-md shadow-amber-300/30">
                        <Star className="mr-1 size-3 fill-current" />
                        Le plus populaire
                      </Badge>
                    </div>
                  </div>
                )}

                <CardHeader className={cn("pb-0", plan.popular && "pt-8")}>
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex size-10 items-center justify-center rounded-lg",
                        plan.popular
                          ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md shadow-amber-300/30"
                          : plan.elite
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
                            : "bg-muted text-muted-foreground"
                      )}
                    >
                      {plan.icon}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {plan.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col gap-6 pt-4">
                  {/* Price */}
                  <div className="flex items-baseline gap-1">
                    <span
                      className={cn(
                        "text-4xl font-bold tracking-tight",
                        plan.popular
                          ? "bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent"
                          : "text-foreground"
                      )}
                    >
                      {plan.price}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {plan.priceSuffix}
                    </span>
                  </div>

                  <Separator
                    className={cn(
                      plan.popular
                        ? "bg-amber-200/60 dark:bg-amber-700/30"
                        : undefined
                    )}
                  />

                  {/* Features */}
                  <ul className="flex flex-col gap-3 text-sm">
                    {plan.features.map((feature) => (
                      <li key={feature.text} className="flex items-start gap-3">
                        <div
                          className={cn(
                            "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
                            plan.popular
                              ? "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400"
                              : plan.elite
                                ? "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                                : "bg-muted text-muted-foreground"
                          )}
                        >
                          <Check className="size-3" strokeWidth={3} />
                        </div>
                        <span
                          className={cn(
                            feature.highlighted && "font-medium text-amber-700 dark:text-amber-300"
                          )}
                        >
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="mt-auto pt-2">
                    <Button
                      className={cn(
                        "w-full",
                        plan.popular
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-300/30 hover:from-amber-600 hover:to-orange-600 border-0"
                          : plan.elite
                            ? "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50"
                            : ""
                      )}
                      variant={plan.popular ? "default" : plan.elite ? "outline" : "outline"}
                      size="lg"
                    >
                      {plan.cta}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          className="mt-12 text-center text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          Tous les prix sont en FCFA. Annulez à tout moment, sans engagement.
          <br />
          Besoin d&apos;un plan sur mesure ?{" "}
          <a
            href="#"
            className="font-medium text-amber-600 underline underline-offset-4 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
          >
            Contactez-nous
          </a>
        </motion.p>
      </div>
    </section>
  );
}
