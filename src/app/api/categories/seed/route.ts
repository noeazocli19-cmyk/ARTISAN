import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

const SEED_CATEGORIES = [
  {
    name: 'Plomberie',
    slug: 'plomberie',
    icon: 'Wrench',
    description: 'Réparation et installation de tuyauterie, robinets, chauffe-eau et systèmes d\'eau',
    artisanCount: 0,
  },
  {
    name: 'Électricité',
    slug: 'electricite',
    icon: 'Zap',
    description: 'Installation et dépannage électrique, câblage, tableaux et prises',
    artisanCount: 0,
  },
  {
    name: 'Menuiserie',
    slug: 'menuiserie',
    icon: 'Hammer',
    description: 'Fabrication et réparation de meubles, portes, fenêtres et ouvrages en bois',
    artisanCount: 0,
  },
  {
    name: 'Peinture',
    slug: 'peinture',
    icon: 'Paintbrush',
    description: 'Peinture intérieure et extérieure, décoration, finitions et revêtements muraux',
    artisanCount: 0,
  },
  {
    name: 'Serrurerie',
    slug: 'serrurerie',
    icon: 'KeyRound',
    description: 'Installation et réparation de serrures, portes blindées et systèmes de sécurité',
    artisanCount: 0,
  },
  {
    name: 'Maçonnerie',
    slug: 'maconnerie',
    icon: 'Building',
    description: 'Construction, rénovation, dallage, enduits et travaux de gros œuvre',
    artisanCount: 0,
  },
  {
    name: 'Climatisation',
    slug: 'climatisation',
    icon: 'Thermometer',
    description: 'Installation, entretien et réparation de systèmes de climatisation et ventilation',
    artisanCount: 0,
  },
  {
    name: 'Nettoyage',
    slug: 'nettoyage',
    icon: 'Sparkles',
    description: 'Nettoyage professionnel de locaux, maisons, bureaux et espaces commerciaux',
    artisanCount: 0,
  },
]

export async function POST() {
  try {
    // Check if categories already exist
    const existingCount = await db.category.count()

    if (existingCount > 0) {
      return NextResponse.json(
        { message: `${existingCount} catégories existent déjà`, seeded: false },
        { status: 200 }
      )
    }

    // Seed categories
    const categories = await db.category.createMany({
      data: SEED_CATEGORIES,
    })

    return NextResponse.json(
      {
        message: `${categories.count} catégories créées avec succès`,
        seeded: true,
        count: categories.count,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Seed categories error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'initialisation des catégories' },
      { status: 500 }
    )
  }
}
