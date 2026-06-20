import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Début du seed...')

  // ============================================
  // 1. CRÉER LES CATÉGORIES
  // ============================================
  console.log('📁 Création des catégories...')

  const categories = [
    { name: 'Plomberie', slug: 'plomberie', icon: '🔧', description: 'Réparation et installation de tuyauterie, robinets, chauffe-eau' },
    { name: 'Électricité', slug: 'electricite', icon: '💡', description: 'Installation et dépannage électrique, câblage' },
    { name: 'Menuiserie', slug: 'menuiserie', icon: '🪚', description: 'Fabrication et réparation de meubles, portes, fenêtres' },
    { name: 'Peinture', slug: 'peinture', icon: '🎨', description: 'Peinture intérieure et extérieure, décoration' },
    { name: 'Serrurerie', slug: 'serrurerie', icon: '🔑', description: 'Installation et réparation de serrures, portes blindées' },
    { name: 'Maçonnerie', slug: 'maconnerie', icon: '🧱', description: 'Construction, rénovation, dallage, enduits' },
    { name: 'Climatisation', slug: 'climatisation', icon: '❄️', description: 'Installation, entretien et réparation de climatisation' },
    { name: 'Nettoyage', slug: 'nettoyage', icon: '🧽', description: 'Nettoyage professionnel de locaux et maisons' },
    { name: 'Couture', slug: 'couture', icon: '👗', description: 'Confection et retouches de vêtements' },
    { name: 'Pâtisserie', slug: 'patisserie', icon: '🍰', description: 'Pâtisserie sur commande pour événements' },
    { name: 'Mécanique', slug: 'mecanique', icon: '🔩', description: 'Réparation et entretien de véhicules' },
    { name: 'Coiffure', slug: 'coiffure', icon: '💇', description: 'Coiffure à domicile pour hommes et femmes' },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
  }
  console.log(`✅ ${categories.length} catégories créées`)

  // ============================================
  // 2. CRÉER LES ARTISANS
  // ============================================
  console.log('👷 Création des artisans...')

  const artisans = [
    {
      name: 'Amadou Diallo',
      email: 'amadou.diallo@artisan-connect.com',
      password: 'artisan123',
      phone: '+221 77 123 45 67',
      location: 'Dakar',
      country: 'Sénégal',
      bio: 'Plombier expérimenté avec 15 ans d\'expérience. Spécialiste en rénovation de salles de bain et installation de chauffe-eau.',
      specialties: ['Plomberie'],
      skills: ['Réparation de fuites', 'Installation de chauffe-eau', 'Rénovation salle de bain', 'Détection de fuites'],
      hourlyRate: 5000,
      experience: 15,
      rating: 4.8,
      reviewCount: 47,
      missionCount: 89,
      badge: 'Top',
      latitude: 14.7167,
      longitude: -17.4677,
      certifications: ['Certificat professionnel de plomberie', 'Habilitation électrique'],
      portfolio: [
        { title: 'Rénovation salle de bain', description: 'Rénovation complète d\'une salle de bain à Dakar', imageUrl: '', category: 'Plomberie' },
        { title: 'Installation chauffe-eau', description: 'Installation d\'un chauffe-eau solaire', imageUrl: '', category: 'Plomberie' },
      ],
    },
    {
      name: 'Fatou Ndiaye',
      email: 'fatou.ndiaye@artisan-connect.com',
      password: 'artisan123',
      phone: '+221 78 234 56 78',
      location: 'Dakar',
      country: 'Sénégal',
      bio: 'Électricienne certifiée, spécialisée en installation domestique et dépannage urgent. Intervention rapide 24h/24.',
      specialties: ['Électricité'],
      skills: ['Installation électrique', 'Dépannage urgent', 'Mise aux normes', 'Domotique'],
      hourlyRate: 6000,
      experience: 12,
      rating: 4.9,
      reviewCount: 63,
      missionCount: 124,
      badge: 'Élite',
      latitude: 14.6928,
      longitude: -17.4467,
      certifications: ['Habilitation électrique B1V', 'Certificat domotique'],
      portfolio: [
        { title: 'Installation complète villa', description: 'Installation électrique d\'une villa de 200m²', imageUrl: '', category: 'Électricité' },
      ],
    },
    {
      name: 'Kofi Mensah',
      email: 'kofi.mensah@artisan-connect.com',
      password: 'artisan123',
      phone: '+233 24 567 8901',
      location: 'Accra',
      country: 'Ghana',
      bio: 'Menuisier ébéniste passionné, création de meubles sur mesure et restauration de meubles anciens.',
      specialties: ['Menuiserie'],
      skills: ['Meubles sur mesure', 'Restauration', 'Portes et fenêtres', 'Escaliers'],
      hourlyRate: 7000,
      experience: 20,
      rating: 4.7,
      reviewCount: 38,
      missionCount: 76,
      badge: 'Top',
      latitude: 5.6037,
      longitude: -0.1870,
      certifications: ['CAP Menuiserie ébénisterie'],
      portfolio: [
        { title: 'Buffet en bois massif', description: 'Buffet sur mesure en acajou', imageUrl: '', category: 'Menuiserie' },
      ],
    },
    {
      name: 'Aïcha Bello',
      email: 'aicha.bello@artisan-connect.com',
      password: 'artisan123',
      phone: '+227 90 123 456',
      location: 'Niamey',
      country: 'Niger',
      bio: 'Peintre en bâtiment décorative. Spécialiste des effets décoratifs et peinture écologique.',
      specialties: ['Peinture'],
      skills: ['Peinture décorative', 'Effets spéciaux', 'Peinture écologique', 'Enduits décoratifs'],
      hourlyRate: 4000,
      experience: 8,
      rating: 4.6,
      reviewCount: 29,
      missionCount: 51,
      badge: 'Vérifié',
      latitude: 13.5117,
      longitude: 2.1098,
      certifications: ['Certificat peinture décorative'],
      portfolio: [
        { title: 'Décoration salon moderne', description: 'Peinture décorative avec effets métalliques', imageUrl: '', category: 'Peinture' },
      ],
    },
    {
      name: 'Moussa Traoré',
      email: 'moussa.traore@artisan-connect.com',
      password: 'artisan123',
      phone: '+223 70 987 654',
      location: 'Bamako',
      country: 'Mali',
      bio: 'Maçon expérimenté en construction et rénovation. Travail soigné et respect des délais.',
      specialties: ['Maçonnerie'],
      skills: ['Construction', 'Rénovation', 'Dallage', 'Enduits'],
      hourlyRate: 4500,
      experience: 18,
      rating: 4.5,
      reviewCount: 42,
      missionCount: 67,
      badge: 'Vérifié',
      latitude: 12.6392,
      longitude: -8.0029,
      certifications: ['CAP Maçonnerie'],
      portfolio: [
        { title: 'Construction extension', description: 'Extension d\'une maison de 50m²', imageUrl: '', category: 'Maçonnerie' },
      ],
    },
    {
      name: 'Mariama Sow',
      email: 'mariama.sow@artisan-connect.com',
      password: 'artisan123',
      phone: '+221 76 555 666',
      location: 'Thiès',
      country: 'Sénégal',
      bio: 'Couturière professionnelle spécialisée en vêtements traditionnels et modernes sur mesure.',
      specialties: ['Couture'],
      skills: ['Vêtements traditionnels', 'Sur mesure', 'Retouches', 'Mariage'],
      hourlyRate: 3000,
      experience: 10,
      rating: 4.9,
      reviewCount: 55,
      missionCount: 98,
      badge: 'Élite',
      latitude: 14.7886,
      longitude: -16.9260,
      certifications: ['CAP Couture'],
      portfolio: [
        { title: 'Robe de mariée traditionnelle', description: 'Robe sur mesure pour mariage', imageUrl: '', category: 'Couture' },
      ],
    },
    {
      name: 'Ibrahim Diarra',
      email: 'ibrahim.diarra@artisan-connect.com',
      password: 'artisan123',
      phone: '+223 76 111 222',
      location: 'Bamako',
      country: 'Mali',
      bio: 'Mécanicien automobile toutes marques. Diagnostic électronique et réparation de moteurs.',
      specialties: ['Mécanique'],
      skills: ['Diagnostic électronique', 'Réparation moteur', 'Vidange', 'Freinage'],
      hourlyRate: 5000,
      experience: 14,
      rating: 4.4,
      reviewCount: 31,
      missionCount: 45,
      badge: 'Vérifié',
      latitude: 12.6500,
      longitude: -8.0000,
      certifications: ['CAP Mécanique automobile'],
      portfolio: [
        { title: 'Réparation moteur diesel', description: 'Réparation complète d\'un moteur 6 cylindres', imageUrl: '', category: 'Mécanique' },
      ],
    },
    {
      name: 'Ousmane Ba',
      email: 'ousmane.ba@artisan-connect.com',
      password: 'artisan123',
      phone: '+221 77 999 000',
      location: 'Saint-Louis',
      country: 'Sénégal',
      bio: 'Serrurier qualifié, spécialiste en portes blindées et systèmes de sécurité.',
      specialties: ['Serrurerie'],
      skills: ['Portes blindées', 'Serrures multipoints', 'Dépannage urgent', 'Cylindres'],
      hourlyRate: 5500,
      experience: 11,
      rating: 4.7,
      reviewCount: 36,
      missionCount: 58,
      badge: 'Top',
      latitude: 16.0326,
      longitude: -16.4818,
      certifications: ['Certificat serrurerie sécurité'],
      portfolio: [
        { title: 'Installation porte blindée', description: 'Pose d\'une porte blindée avec serrure 5 points', imageUrl: '', category: 'Serrurerie' },
      ],
    },
    {
      name: 'Aminata Koné',
      email: 'aminata.kone@artisan-connect.com',
      password: 'artisan123',
      phone: '+225 07 123 456',
      location: 'Abidjan',
      country: 'Côte d\'Ivoire',
      bio: 'Pâtissière professionnelle, créations uniques pour vos événements. Mariages, anniversaires, cérémonies.',
      specialties: ['Pâtisserie'],
      skills: ['Gâteaux d\'anniversaire', 'Pièces montées', 'Mariage', 'Pâtisserie fine'],
      hourlyRate: 8000,
      experience: 9,
      rating: 5.0,
      reviewCount: 72,
      missionCount: 134,
      badge: 'Élite',
      latitude: 5.3600,
      longitude: -4.0083,
      certifications: ['CAP Pâtisserie', 'Formation école hôtelière'],
      portfolio: [
        { title: 'Pièce montée mariage', description: 'Pièce montée 5 étages pour 200 invités', imageUrl: '', category: 'Pâtisserie' },
      ],
    },
    {
      name: 'Seydou Keita',
      email: 'seydou.keita@artisan-connect.com',
      password: 'artisan123',
      phone: '+223 65 555 444',
      location: 'Bamako',
      country: 'Mali',
      bio: 'Technicien en climatisation, installation et maintenance de tous types de systèmes. Intervention rapide.',
      specialties: ['Climatisation'],
      skills: ['Installation split', 'Maintenance', 'Recharge gaz', 'Dépannage'],
      hourlyRate: 6000,
      experience: 7,
      rating: 4.6,
      reviewCount: 28,
      missionCount: 49,
      badge: 'Vérifié',
      latitude: 12.6392,
      longitude: -8.0029,
      certifications: ['Certificat frigoriste', 'Habilitation fluide frigorigène'],
      portfolio: [
        { title: 'Installation climat bureau', description: 'Installation de 3 climatiseurs split pour bureau', imageUrl: '', category: 'Climatisation' },
      ],
    },
    {
      name: 'Fatoumata Diarra',
      email: 'fatoumata.diarra@artisan-connect.com',
      password: 'artisan123',
      phone: '+223 74 222 333',
      location: 'Bamako',
      country: 'Mali',
      bio: 'Coiffeuse à domicile, spécialiste en tresses africaines et soins capillaires naturels.',
      specialties: ['Coiffure'],
      skills: ['Tresses africaines', 'Soins naturels', 'Mariage', 'Tissage'],
      hourlyRate: 3500,
      experience: 6,
      rating: 4.8,
      reviewCount: 41,
      missionCount: 87,
      badge: 'Top',
      latitude: 12.6500,
      longitude: -8.0000,
      certifications: ['CAP Coiffure'],
      portfolio: [
        { title: 'Tresses inspiration', description: 'Tresses collées avec design moderne', imageUrl: '', category: 'Coiffure' },
      ],
    },
    {
      name: 'Jean-Pierre Aka',
      email: 'jean-pierre.aka@artisan-connect.com',
      password: 'artisan123',
      phone: '+225 05 888 999',
      location: 'Abidjan',
      country: 'Côte d\'Ivoire',
      bio: 'Spécialiste en nettoyage professionnel : bureaux, maisons, fin de chantier. Produits écologiques.',
      specialties: ['Nettoyage'],
      skills: ['Nettoyage bureaux', 'Fin de chantier', 'Vitres', 'Moquettes'],
      hourlyRate: 3500,
      experience: 5,
      rating: 4.5,
      reviewCount: 22,
      missionCount: 34,
      badge: 'Nouveau',
      latitude: 5.3600,
      longitude: -4.0083,
      certifications: ['Formation nettoyage professionnel'],
      portfolio: [
        { title: 'Nettoyage bureaux entreprise', description: 'Nettoyage de 500m² de bureaux', imageUrl: '', category: 'Nettoyage' },
      ],
    },
  ]

  for (const artisan of artisans) {
    const hashedPassword = await bcrypt.hash(artisan.password, 12)

    // Créer ou mettre à jour l'utilisateur
    const user = await prisma.user.upsert({
      where: { email: artisan.email },
      update: {
        name: artisan.name,
        phone: artisan.phone,
        location: artisan.location,
        country: artisan.country,
        bio: artisan.bio,
        role: 'artisan',
        isVerified: true,
        emailVerified: true,
      },
      create: {
        name: artisan.name,
        email: artisan.email,
        password: hashedPassword,
        phone: artisan.phone,
        location: artisan.location,
        country: artisan.country,
        bio: artisan.bio,
        role: 'artisan',
        isVerified: true,
        emailVerified: true,
      },
    })

    // Créer ou mettre à jour le profil artisan
    await prisma.artisan.upsert({
      where: { userId: user.id },
      update: {
        specialties: JSON.stringify(artisan.specialties),
        skills: JSON.stringify(artisan.skills),
        hourlyRate: artisan.hourlyRate,
        experience: artisan.experience,
        rating: artisan.rating,
        reviewCount: artisan.reviewCount,
        missionCount: artisan.missionCount,
        badge: artisan.badge,
        isAvailable: true,
        latitude: artisan.latitude,
        longitude: artisan.longitude,
        certifications: JSON.stringify(artisan.certifications),
        portfolio: JSON.stringify(artisan.portfolio),
      },
      create: {
        userId: user.id,
        specialties: JSON.stringify(artisan.specialties),
        skills: JSON.stringify(artisan.skills),
        hourlyRate: artisan.hourlyRate,
        experience: artisan.experience,
        rating: artisan.rating,
        reviewCount: artisan.reviewCount,
        missionCount: artisan.missionCount,
        badge: artisan.badge,
        isAvailable: true,
        latitude: artisan.latitude,
        longitude: artisan.longitude,
        certifications: JSON.stringify(artisan.certifications),
        portfolio: JSON.stringify(artisan.portfolio),
      },
    })
  }

  console.log(`✅ ${artisans.length} artisans créés`)

  // ============================================
  // 3. CRÉER UN COMPTE ADMIN
  // ============================================
  console.log('👨‍💼 Création du compte admin...')

  const adminPassword = await bcrypt.hash('admin123', 12)
  await prisma.user.upsert({
    where: { email: 'admin@artisan-connect.com' },
    update: {},
    create: {
      name: 'Administrateur',
      email: 'admin@artisan-connect.com',
      password: adminPassword,
      role: 'admin',
      isVerified: true,
      emailVerified: true,
    },
  })
  console.log('✅ Compte admin créé')

  console.log('\n🎉 Seed terminé avec succès !')
  console.log('\n📋 Comptes créés :')
  console.log('   👑 Admin : admin@artisan-connect.com / admin123')
  console.log('   👷 Artisans (mot de passe : artisan123) :')
  artisans.forEach(a => console.log(`      - ${a.email} (${a.specialties[0]})`))
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })