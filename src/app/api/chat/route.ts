import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

const SYSTEM_PROMPT = `Tu es l'assistant virtuel d'Artisan Connecté, une plateforme qui connecte les clients avec des artisans qualifiés en Afrique. Ton rôle est d'aider les utilisateurs à :

1. Trouver des artisans adaptés à leurs besoins (plomberie, électricité, menuiserie, peinture, serrurerie, maçonnerie, climatisation, nettoyage)
2. Répondre aux questions sur le fonctionnement de la plateforme
3. Suggérer des catégories d'artisans selon les besoins décrits
4. Guider les utilisateurs dans la création de missions
5. Fournir des informations sur les tarifs moyens et les délais habituels

Sois chaleureux, professionnel et toujours prêt à aider. Réponds en français. Si tu ne connais pas la réponse, dis-le honnêtement et suggère à l'utilisateur de contacter le support.

Catégories disponibles sur la plateforme :
- Plomberie : réparation et installation de tuyauterie, robinets, chauffe-eau
- Électricité : installation et dépannage électrique, câblage
- Menuiserie : fabrication et réparation de meubles, portes, fenêtres
- Peinture : peinture intérieure et extérieure, décoration
- Serrurerie : installation et réparation de serrures, portes blindées
- Maçonnerie : construction, rénovation, dallage, enduits
- Climatisation : installation, entretien et réparation de systèmes de climatisation
- Nettoyage : nettoyage professionnel de locaux et maisons`

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, history } = body as { message: string; history?: ChatMessage[] }

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Le message est requis' },
        { status: 400 }
      )
    }

    const zai = await ZAI.create()

    // Build messages array
    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
    ]

    // Add conversation history if provided
    if (history && Array.isArray(history)) {
      messages.push(...history)
    }

    // Add current user message
    messages.push({ role: 'user', content: message })

    const result = await zai.chat.completions.create({
      messages,
      model: 'glm-4-flash',
    })

    const reply = result.choices?.[0]?.message?.content || 'Désolé, je n\'ai pas pu traiter votre demande. Veuillez réessayer.'

    return NextResponse.json({
      reply,
      history: [
        ...(history || []),
        { role: 'user', content: message },
        { role: 'assistant', content: reply },
      ],
    })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: 'Erreur lors du traitement du message' },
      { status: 500 }
    )
  }
}
