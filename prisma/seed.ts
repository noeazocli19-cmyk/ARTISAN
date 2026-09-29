import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const SEED_DOMAIN = 'seed.artisan-connect.test'
const TARGET = Math.max(40, Number(process.env.SEED_COUNT ?? 160))
const RESET = process.env.SEED_RESET === '1'

function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rand = mulberry32(20260929)
const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)]
const int = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min
const chance = (p: number) => rand() < p
const slugify = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

type City = { name: string; lat: number; lng: number; weight: number; quartiers: string[] }

const CITIES: City[] = [
  {
    name: 'Cotonou', lat: 6.3703, lng: 2.3912, weight: 38,
    quartiers: ['Cadjehoun', 'Fidjrosse', 'Akpakpa', 'Gbegamey', 'Zogbo', 'Sainte-Rita', 'Jericho', 'Ganhi', 'Vossa', 'Missebo', 'Dantokpa', 'Agla', 'Godomey', 'Wologuede', 'Menontin', 'Saint Michel', 'Houeyiho', 'Aidjedo'],
  },
  { name: 'Abomey-Calavi', lat: 6.4485, lng: 2.3556, weight: 16, quartiers: ['Togba', 'Godomey', 'Akassato', 'Zogbadje', 'Ouedo', 'Hevie'] },
  { name: 'Porto-Novo', lat: 6.4969, lng: 2.6289, weight: 12, quartiers: ['Ouando', 'Djassin', 'Tokpota', 'Agbokou', 'Atchoukpa'] },
  { name: 'Parakou', lat: 9.337, lng: 2.6303, weight: 10, quartiers: ['Banikanni', 'Titirou', 'Zongo', 'Albarika', 'Madina'] },
  { name: 'Bohicon', lat: 7.1783, lng: 2.0667, weight: 6, quartiers: ['Agongointo', 'Passagon', 'Gnidjazoun'] },
  { name: 'Abomey', lat: 7.1829, lng: 1.9912, weight: 5, quartiers: ['Hounli', 'Vidolé', 'Djègbé'] },
  { name: 'Ouidah', lat: 6.3629, lng: 2.0852, weight: 6, quartiers: ['Docomè', 'Savi', 'Pahou'] },
  { name: 'Natitingou', lat: 10.3042, lng: 1.3796, weight: 5, quartiers: ['Kotopounga', 'Yarikou', 'Bassilè'] },
]

type Cat = {
  name: string; slug: string; icon: string; description: string
  profession: string; professionF?: string
  skills: string[]; rate: [number, number]; portfolio: string[]
}

const CATS: Cat[] = [
  { name: 'Plomberie', slug: 'plomberie', icon: '🔧', description: 'Réparation et installation de tuyauterie, robinets, chauffe-eau', profession: 'Plombier', skills: ['Réparation de fuites', 'Installation sanitaire', 'Chauffe-eau', 'Débouchage', 'Pose de robinetterie'], rate: [2500, 6000], portfolio: ['Rénovation de salle de bain', 'Installation de chauffe-eau', 'Réseau d\'eau d\'un immeuble'] },
  { name: 'Électricité', slug: 'electricite', icon: '💡', description: 'Installation et dépannage électrique, câblage', profession: 'Électricien', skills: ['Installation électrique', 'Dépannage urgent', 'Mise aux normes', 'Tableaux électriques', 'Éclairage'], rate: [3000, 7000], portfolio: ['Câblage complet d\'une villa', 'Installation de panneaux solaires', 'Remise aux normes d\'un commerce'] },
  { name: 'Menuiserie', slug: 'menuiserie', icon: '🪚', description: 'Fabrication et réparation de meubles, portes, fenêtres', profession: 'Menuisier', skills: ['Meubles sur mesure', 'Portes et fenêtres', 'Placards', 'Restauration', 'Escaliers en bois'], rate: [2500, 7000], portfolio: ['Salon en bois massif', 'Cuisine équipée sur mesure', 'Porte d\'entrée en teck'] },
  { name: 'Peinture', slug: 'peinture', icon: '🎨', description: 'Peinture intérieure et extérieure, décoration', profession: 'Peintre', skills: ['Peinture intérieure', 'Peinture extérieure', 'Enduits décoratifs', 'Ravalement de façade', 'Décoration'], rate: [2000, 5000], portfolio: ['Peinture d\'un appartement de 4 pièces', 'Ravalement de façade', 'Décoration murale d\'un salon'] },
  { name: 'Serrurerie', slug: 'serrurerie', icon: '🔑', description: 'Installation et réparation de serrures, portes blindées', profession: 'Serrurier', skills: ['Ouverture de porte', 'Serrures multipoints', 'Portes blindées', 'Cylindres', 'Dépannage urgent'], rate: [3000, 6500], portfolio: ['Pose d\'une porte blindée', 'Remplacement de serrures d\'un immeuble', 'Sécurisation d\'un magasin'] },
  { name: 'Maçonnerie', slug: 'maconnerie', icon: '🧱', description: 'Construction, rénovation, dallage, enduits', profession: 'Maçon', skills: ['Construction', 'Rénovation', 'Dallage', 'Enduits', 'Fondations'], rate: [2500, 6000], portfolio: ['Extension d\'une maison de 50 m²', 'Clôture en parpaings', 'Dallage d\'une cour'] },
  { name: 'Climatisation', slug: 'climatisation', icon: '❄️', description: 'Installation, entretien et réparation de climatisation', profession: 'Frigoriste', skills: ['Installation de split', 'Maintenance', 'Recharge de gaz', 'Dépannage', 'Chambres froides'], rate: [3500, 7500], portfolio: ['Installation de 3 splits dans un bureau', 'Maintenance annuelle d\'un hôtel', 'Réparation de chambre froide'] },
  { name: 'Nettoyage', slug: 'nettoyage', icon: '🧽', description: 'Nettoyage professionnel de locaux et maisons', profession: 'Agent de nettoyage', skills: ['Nettoyage de bureaux', 'Fin de chantier', 'Vitres', 'Désinfection', 'Entretien de maisons'], rate: [1500, 4000], portfolio: ['Nettoyage de 500 m² de bureaux', 'Remise en état après travaux', 'Entretien hebdomadaire d\'une villa'] },
  { name: 'Soudure', slug: 'soudure', icon: '🔥', description: 'Soudure, portails, grilles et structures métalliques', profession: 'Soudeur', skills: ['Soudure à l\'arc', 'Portails', 'Grilles de sécurité', 'Charpente métallique', 'Réparation'], rate: [2500, 6000], portfolio: ['Portail coulissant', 'Grilles de fenêtres', 'Hangar métallique'] },
  { name: 'Carrelage', slug: 'carrelage', icon: '🔲', description: 'Pose de carrelage, faïence et revêtements de sol', profession: 'Carreleur', skills: ['Pose de carrelage', 'Faïence', 'Sols et murs', 'Rénovation', 'Joints'], rate: [2000, 5000], portfolio: ['Carrelage d\'un salon de 40 m²', 'Faïence de salle de bain', 'Terrasse en carreaux'] },
  { name: 'Couture', slug: 'couture', icon: '👗', description: 'Confection et retouches de vêtements', profession: 'Couturier', professionF: 'Couturière', skills: ['Tenues sur mesure', 'Retouches', 'Pagne et wax', 'Tenues de cérémonie', 'Uniformes'], rate: [1500, 5000], portfolio: ['Tenue de mariage traditionnelle', 'Ensemble en wax', 'Uniformes scolaires'] },
  { name: 'Couvreur', slug: 'couvreur', icon: '🏠', description: 'Toiture, charpente et étanchéité', profession: 'Couvreur', skills: ['Pose de tôles', 'Charpente', 'Étanchéité', 'Réparation de fuites de toit', 'Gouttières'], rate: [2500, 6000], portfolio: ['Toiture en tôle d\'une villa', 'Réfection d\'étanchéité', 'Charpente d\'un entrepôt'] },
  { name: 'Plâtrerie', slug: 'platrerie', icon: '🧰', description: 'Faux plafonds, cloisons et moulures', profession: 'Plâtrier', skills: ['Faux plafonds', 'Cloisons', 'Moulures', 'Enduits', 'Staff'], rate: [2500, 5500], portfolio: ['Faux plafond avec éclairage', 'Cloisons d\'un bureau', 'Moulures d\'un salon'] },
  { name: 'Pâtisserie', slug: 'patisserie', icon: '🍰', description: 'Pâtisserie sur commande pour événements', profession: 'Pâtissier', skills: ['Gâteaux d\'anniversaire', 'Pièces montées', 'Pâtisserie fine', 'Buffets', 'Gâteaux de mariage'], rate: [3000, 9000], portfolio: ['Pièce montée pour 200 invités', 'Gâteau d\'anniversaire thématique', 'Buffet de baptême'] },
  { name: 'Mécanique', slug: 'mecanique', icon: '🔩', description: 'Réparation et entretien de véhicules', profession: 'Mécanicien', skills: ['Diagnostic', 'Vidange', 'Freinage', 'Réparation moteur', 'Motos et voitures'], rate: [2500, 6500], portfolio: ['Révision complète d\'un 4x4', 'Réparation de boîte de vitesses', 'Entretien d\'une flotte de taxis'] },
  { name: 'Coiffure', slug: 'coiffure', icon: '💇', description: 'Coiffure à domicile pour hommes et femmes', profession: 'Coiffeur', professionF: 'Coiffeuse', skills: ['Tresses', 'Tissage', 'Coupe homme', 'Soins capillaires', 'Coiffure de mariage'], rate: [1500, 5000], portfolio: ['Coiffure de mariée', 'Tresses collées', 'Coupe et dégradé'] },
  { name: 'Paysagisme', slug: 'paysagisme', icon: '🌿', description: 'Création et entretien de jardins et espaces verts', profession: 'Paysagiste', skills: ['Création de jardin', 'Tonte et taille', 'Arrosage automatique', 'Plantation', 'Entretien'], rate: [2000, 5500], portfolio: ['Jardin d\'une villa', 'Entretien d\'espaces verts d\'une école', 'Aménagement de terrasse'] },
  { name: 'Vitrerie', slug: 'vitrerie', icon: '🪟', description: 'Pose et remplacement de vitres, miroirs et baies', profession: 'Vitrier', skills: ['Remplacement de vitres', 'Miroirs', 'Baies vitrées', 'Cloisons vitrées', 'Aluminium'], rate: [2500, 6000], portfolio: ['Baie vitrée d\'un salon', 'Vitrine de boutique', 'Cloisons vitrées de bureau'] },
  { name: 'Forgeron', slug: 'forgeron', icon: '⚒️', description: 'Ferronnerie d\'art, outils et mobilier en fer forgé', profession: 'Forgeron', skills: ['Fer forgé', 'Rampes d\'escalier', 'Outils agricoles', 'Mobilier en fer', 'Ferronnerie d\'art'], rate: [2000, 5500], portfolio: ['Rampe d\'escalier en fer forgé', 'Table de jardin', 'Lot d\'outils agricoles'] },
  { name: 'Photographie', slug: 'photographie', icon: '📷', description: 'Photo et vidéo pour événements et professionnels', profession: 'Photographe', skills: ['Mariage', 'Portrait', 'Photo produit', 'Événements', 'Retouche'], rate: [4000, 12000], portfolio: ['Reportage de mariage', 'Shooting produits pour boutique', 'Portraits en studio'] },
]

const FEMALE_BIAS = new Set(['Couture', 'Coiffure', 'Pâtisserie', 'Nettoyage'])

const FIRST_M = ['Codjo', 'Sourou', 'Comlan', 'Rodrigue', 'Flavien', 'Ulrich', 'Serge', 'Eric', 'Gildas', 'Hermann', 'Armand', 'Aubin', 'Thierry', 'Fabrice', 'Romuald', 'Yves', 'Bertin', 'Ibrahim', 'Moussa', 'Rachidi', 'Fousséni', 'Wilfried', 'Landry', 'Constant']
const FIRST_F = ['Adjovi', 'Afiavi', 'Christelle', 'Nadège', 'Fabienne', 'Carine', 'Judith', 'Rosine', 'Sylvie', 'Hortense', 'Prudence', 'Reine', 'Aïcha', 'Rahimatou', 'Mariam', 'Estelle', 'Gisèle', 'Bénédicte', 'Sandrine', 'Odile', 'Pélagie', 'Rosemonde']
const LAST = ['Dossou', 'Houngbo', 'Agossou', 'Tossou', 'Zinsou', 'Kpadonou', 'Hounkpatin', 'Akpovi', 'Ahouansou', 'Sossa', 'Gnancadja', 'Adéchian', 'Aïnadou', 'Yacoubou', 'Séidou', 'Chabi', 'Idrissou', 'Soumanou', 'Gbaguidi', 'Avocè', 'Adjibi', 'Sagbo', 'Amoussou', 'Hounsou', 'Fassinou', 'Ogoumon', 'Biaou', 'Tchibozo']

const COMMENTS = [
  'Travail soigné et très ponctuel, je recommande.',
  'Très professionnel, le devis a été respecté.',
  'Intervention rapide, problème réglé dès le premier passage.',
  'Bon rapport qualité-prix, à l\'écoute et sympathique.',
  'Résultat conforme à ce que je voulais. Je referai appel à lui.',
  'Un peu de retard mais le travail est de qualité.',
  'Excellent artisan, propre et organisé sur le chantier.',
  'Bonne communication tout au long de la mission.',
]

const PHONE = (n: number) => `+229 01 00 00 ${String(Math.floor(n / 100) % 100).padStart(2, '0')} ${String(n % 100).padStart(2, '0')}`

function jitter(base: number, spread = 0.02) {
  return Number((base + (rand() - 0.5) * 2 * spread).toFixed(6))
}

function pickWeightedCity(): City {
  const total = CITIES.reduce((s, c) => s + c.weight, 0)
  let r = rand() * total
  for (const c of CITIES) {
    r -= c.weight
    if (r <= 0) return c
  }
  return CITIES[0]
}

type Plan = { cat: Cat; city: City }

function buildPlan(): Plan[] {
  const plan: Plan[] = []
  const cotonou = CITIES[0]
  for (const cat of CATS) {
    plan.push({ cat, city: cotonou }, { cat, city: cotonou })
  }
  for (const city of CITIES.slice(1)) {
    for (let k = 0; k < 4; k++) plan.push({ cat: CATS[(CITIES.indexOf(city) * 3 + k * 5) % CATS.length], city })
  }
  while (plan.length < TARGET) plan.push({ cat: pick(CATS), city: pickWeightedCity() })
  return plan
}

async function main() {
  console.log('Debut du seed...')

  if (RESET) {
    const res = await prisma.user.deleteMany({ where: { email: { endsWith: `@${SEED_DOMAIN}` } } })
    console.log(`${res.count} utilisateurs de seed supprimes`)
  }

  for (const c of CATS) {
    await prisma.category.upsert({
      where: { name: c.name },
      update: { slug: c.slug, icon: c.icon, description: c.description },
      create: { name: c.name, slug: c.slug, icon: c.icon, description: c.description },
    })
  }
  console.log(`${CATS.length} categories`)

  const clients: { id: string }[] = []
  for (let i = 0; i < 20; i++) {
    const female = chance(0.5)
    const first = pick(female ? FIRST_F : FIRST_M)
    const last = pick(LAST)
    const city = pickWeightedCity()
    const quartier = pick(city.quartiers)
    const email = `client.${slugify(first)}.${slugify(last)}.${i}@${SEED_DOMAIN}`
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email, name: `${first} ${last}`, role: 'client', phone: PHONE(9000 + i),
        location: `${quartier}, ${city.name}`, country: 'Benin', isVerified: true, emailVerified: true,
      },
    })
    clients.push(user)
  }
  console.log(`${clients.length} clients fictifs`)

  const plan = buildPlan()
  const artisanIds: string[] = []
  const perCategory: Record<string, number> = {}

  for (let i = 0; i < plan.length; i++) {
    const { cat, city } = plan[i]
    const female = chance(FEMALE_BIAS.has(cat.name) ? 0.75 : 0.15)
    const first = pick(female ? FIRST_F : FIRST_M)
    const last = pick(LAST)
    const quartier = pick(city.quartiers)
    const location = `${quartier}, ${city.name}`
    const profession = female && cat.professionF ? cat.professionF : cat.profession
    const experience = int(1, 25)
    const skills = [...cat.skills].sort(() => rand() - 0.5).slice(0, int(3, 5))
    const rating = Number((3.6 + rand() * 1.4).toFixed(1))
    const missionCount = int(0, 140)
    const reviewCount = Math.min(missionCount, int(0, 80))
    const identityApproved = chance(0.6)
    const isPremium = chance(0.2)
    const latitude = jitter(city.lat)
    const longitude = jitter(city.lng)
    const phone = PHONE(i + 1)

    const badge =
      rating >= 4.8 && missionCount >= 60 ? 'Élite'
        : rating >= 4.6 && missionCount >= 30 ? 'Top'
        : identityApproved ? 'Vérifié'
        : 'Nouveau'

    const bio = `${profession} à ${quartier} (${city.name}), ${experience} an${experience > 1 ? 's' : ''} d'expérience. ` +
      `Spécialités : ${skills.slice(0, 3).join(', ').toLowerCase()}. Devis gratuit, déplacement possible dans toute la ville.`

    const email = `${slugify(first)}.${slugify(last)}.${i + 1}@${SEED_DOMAIN}`
    const user = await prisma.user.upsert({
      where: { email },
      update: { name: `${first} ${last}`, location, country: 'Benin', phone, bio },
      create: {
        email, name: `${first} ${last}`, role: 'artisan', phone, bio, location, country: 'Benin',
        isVerified: identityApproved, emailVerified: true,
      },
    })

    const data = {
      profession,
      specialties: JSON.stringify([cat.name]),
      skills: JSON.stringify(skills),
      hourlyRate: Math.round(int(cat.rate[0], cat.rate[1]) / 500) * 500,
      experience,
      badge,
      isPremium,
      premiumUntil: isPremium ? new Date(Date.now() + int(5, 30) * 86_400_000) : null,
      identityStatus: identityApproved ? 'approuve' : pick(['non_soumis', 'non_soumis', 'en_attente']),
      rating: reviewCount > 0 ? rating : 0,
      reviewCount,
      missionCount,
      isAvailable: chance(0.85),
      latitude,
      longitude,
      address: `${quartier}, ${city.name}, Bénin`,
      country: 'Benin',
      location,
      phone,
      bio,
      certifications: JSON.stringify(chance(0.4) ? [`Attestation de qualification — ${cat.name}`] : []),
      portfolio: JSON.stringify(
        cat.portfolio.slice(0, int(1, 3)).map((title) => ({ title, description: `${title} à ${city.name}`, imageUrl: '', category: cat.name })),
      ),
    }

    const artisan = await prisma.artisan.upsert({
      where: { userId: user.id },
      update: data,
      create: { userId: user.id, ...data },
    })
    artisanIds.push(artisan.id)
    perCategory[cat.name] = (perCategory[cat.name] ?? 0) + 1
  }
  console.log(`${plan.length} artisans`)

  let reviews = 0
  for (const artisanId of artisanIds) {
    if (!chance(0.65)) continue
    const authors = [...clients].sort(() => rand() - 0.5).slice(0, int(1, 3))
    for (const client of authors) {
      const exists = await prisma.review.findFirst({ where: { clientId: client.id, artisanId } })
      if (exists) continue
      await prisma.review.create({
        data: { clientId: client.id, artisanId, rating: int(3, 5), comment: pick(COMMENTS) },
      })
      reviews++
    }
  }
  console.log(`${reviews} avis`)

  let bookings = 0
  for (let i = 0; i < 40; i++) {
    const client = pick(clients)
    const artisanId = pick(artisanIds)
    const artisan = await prisma.artisan.findUnique({ where: { id: artisanId }, select: { profession: true, specialties: true } })
    const status = pick(['en_attente', 'confirmee', 'terminee', 'annulee'])
    const offsetDays = status === 'terminee' || status === 'annulee' ? -int(1, 60) : int(1, 30)
    await prisma.booking.create({
      data: {
        clientId: client.id,
        artisanId,
        service: artisan?.profession ?? 'Prestation',
        category: (JSON.parse(artisan?.specialties ?? '[]') as string[])[0] ?? null,
        date: new Date(Date.now() + offsetDays * 86_400_000),
        status,
        notes: 'Réservation générée par le seed (données fictives).',
      },
    })
    bookings++
  }
  console.log(`${bookings} reservations`)

  for (const c of CATS) {
    await prisma.category.update({ where: { name: c.name }, data: { artisanCount: perCategory[c.name] ?? 0 } })
  }

  const byCity: Record<string, number> = {}
  for (const p of plan) byCity[p.city.name] = (byCity[p.city.name] ?? 0) + 1
  console.log('Repartition par ville :', byCity)
  console.log('Seed termine avec succes !')
}

main()
  .catch((e) => {
    console.error('Erreur lors du seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })