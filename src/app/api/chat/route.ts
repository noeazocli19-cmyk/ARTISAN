import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `Tu es l'assistant virtuel d'Artisan Connect, une plateforme qui connecte les clients avec des artisans qualifiés en Afrique.`

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

// Base de connaissances pour le chatbot préprogrammé
const KNOWLEDGE_BASE: { keywords: string[]; response: string }[] = [
  {
    keywords: ['bonjour', 'salut', 'hello', 'bonsoir', 'coucou', 'hey'],
    response: 'Bonjour ! 👋 Je suis l\'assistant Artisan Connect. Comment puis-je vous aider aujourd\'hui ? Vous pouvez me demander comment trouver un artisan, comment créer une mission, ou comment fonctionne la plateforme.'
  },
  {
    keywords: ['comment ça marche', 'comment ca marche', 'fonctionnement', 'présentation', 'présente'],
    response: 'Artisan Connect est une plateforme qui met en relation les clients avec des artisans qualifiés en Afrique. Voici comment ça marche :\n\n1️⃣ Inscrivez-vous gratuitement\n2️⃣ Rechercher un artisan par spécialité et localisation\n3️⃣ Créez une mission avec votre besoin\n4️⃣ Recevez des devis et choisissez votre artisan\n5️⃣ Payez en toute sécurité via Mobile Money\n6️⃣ Évaluez l\'artisan après la mission\n\nSouhaitez-vous savoir comment trouver un artisan ?'
  },
  {
    keywords: ['trouver artisan', 'rechercher artisan', 'chercher artisan', 'comment trouver', 'recherche'],
    response: 'Pour trouver un artisan :\n\n🔍 Utilisez la barre de recherche sur la page d\'accueil\n📍 Entrez votre localisation\n🛠️ Choisissez la catégorie (plomberie, électricité, etc.)\n⭐ Filtrez par note et prix\n\nVous pouvez aussi consulter la carte des artisans pour voir ceux près de chez vous. Souhaitez-vous connaître les catégories disponibles ?'
  },
  {
    keywords: ['catégorie', 'categories', 'spécialité', 'specialite', 'métier', 'metier', 'type artisan'],
    response: 'Voici les catégories d\'artisans disponibles sur Artisan Connect :\n\n🔧 Plomberie\n💡 Électricité\n🪚 Menuiserie\n🎨 Peinture\n🔑 Serrurerie\n🧱 Maçonnerie\n❄️ Climatisation\n🧽 Nettoyage\n👗 Couture\n🍰 Pâtisserie\n🔧 Mécanique\n💇 Coiffure\n\nQuelle catégorie vous intéresse ?'
  },
  {
    keywords: ['créer mission', 'creer mission', 'nouvelle mission', 'demande devis', 'devis', 'mission'],
    response: 'Pour créer une mission :\n\n1️⃣ Connectez-vous à votre compte\n2️⃣ Allez dans "Mon Tableau de bord"\n3️⃣ Cliquez sur "Nouvelle Mission"\n4️⃣ Décrivez votre besoin (titre, description)\n5️⃣ Choisissez la catégorie\n6️⃣ Indiquez votre budget et localisation\n7️⃣ Publiez la mission\n\nLes artisans pourront alors vous faire des propositions ! Souhaitez-vous savoir comment payer ?'
  },
  {
    keywords: ['payer', 'paiement', 'payment', 'mobile money', 'orange money', 'mtn', 'wave', 'moov'],
    response: 'Artisan Connect accepte plusieurs méthodes de paiement :\n\n🟠 Orange Money\n🟡 MTN Money\n🔵 Wave\n🟣 Moov Money\n💳 Carte bancaire\n💵 Espèces\n\nTous les paiements sont sécurisés via Kkiapay. Vous pouvez gérer votre portefeuille dans la section "Portefeuille" de votre tableau de bord. Souhaitez-vous savoir comment déposer de l\'argent ?'
  },
  {
    keywords: ['déposer', 'deposer', 'retrait', 'retirer', 'portefeuille', 'wallet', 'solde'],
    response: 'Pour gérer votre portefeuille :\n\n💰 Déposer : Allez dans "Portefeuille" → "Déposer" → choisissez le montant et la méthode\n💸 Retirer : Allez dans "Portefeuille" → "Retirer" → entrez le montant\n📊 Historique : Consultez toutes vos transactions dans l\'onglet "Historique"\n\nVous pouvez exporter vos transactions en CSV pour votre comptabilité.'
  },
  {
    keywords: ['prix', 'tarif', 'coût', 'cout', 'cher', 'combien', 'tarification'],
    response: 'Les tarifs des artisans varient selon :\n\n⭐ L\'expérience et les avis\n📍 La localisation\n🛠️ Le type de travail\n⏰ L\'urgence de la mission\n\nTarifs moyens indicatifs :\n🔧 Plomberie : 5 000 - 25 000 FCFA\n💡 Électricité : 5 000 - 30 000 FCFA\n🪚 Menuiserie : 10 000 - 50 000 FCFA\n🎨 Peinture : 8 000 - 40 000 FCFA\n\nPour un devis précis, créez une mission et recevez des propositions d\'artisans !'
  },
  {
    keywords: ['inscription', 'inscrire', 'compte', 's\'inscrire', 'register', 'créer compte'],
    response: 'Pour vous inscrire sur Artisan Connect :\n\n1️⃣ Cliquez sur "S\'inscrire" en haut à droite\n2️⃣ Choisissez votre rôle : Client ou Artisan\n3️⃣ Remplissez vos informations (nom, email, mot de passe)\n4️⃣ Ajoutez votre téléphone et localisation\n5️⃣ Validez votre compte\n\nSi vous êtes un artisan, vous pourrez compléter votre profil avec vos spécialités, tarifs et portfolio. L\'inscription est 100% gratuite !'
  },
  {
    keywords: ['artisan', 'devenir artisan', 'profil artisan', 'inscription artisan'],
    response: 'Pour devenir artisan sur Artisan Connect :\n\n1️⃣ Inscrivez-vous avec le rôle "Artisan"\n2️⃣ Complétez votre profil :\n   • Spécialités (plomberie, électricité, etc.)\n   • Compétences détaillées\n   • Tarif horaire\n   • Années d\'expérience\n   • Certifications\n3️⃣ Ajoutez des photos de vos réalisations (portfolio)\n4️⃣ Soyez disponible pour recevoir des missions\n\nPlus votre profil est complet, plus vous avez de chances d\'être choisi par les clients !'
  },
  {
    keywords: ['urgence', 'urgent', 'immédiat', 'rapidement', 'vite'],
    response: 'Pour une urgence (plomberie, électricité, serrurerie) :\n\n🚨 Utilisez le service "Service d\'urgence" dans le menu\n⏰ Disponible 24h/24 et 7j/7\n📍 Un artisan près de chez vous sera dépêché\n\nPour les urgences graves (fuite d\'eau, court-circuit, porte bloquée), indiquez bien la nature de l\'urgence pour une prise en charge rapide.'
  },
  {
    keywords: ['avis', 'évaluation', 'evaluation', 'note', 'rating', 'commentaire'],
    response: 'Les avis sont importants sur Artisan Connect :\n\n⭐ Après chaque mission, vous pouvez noter l\'artisan (1 à 5 étoiles)\n📝 Laissez un commentaire détaillé\n✅ Les avis aident les autres clients à choisir\n🏆 Les artisans avec les meilleurs avis obtiennent le badge "Top" ou "Élite"\n\nLes avis sont vérifiés et ne peuvent être laissés qu\'après une mission réelle.'
  },
  {
    keywords: ['pays', 'disponible', 'où', 'afrique', 'sénégal', 'côte d\'ivoire', 'mali'],
    response: 'Artisan Connect est disponible dans 15+ pays africains :\n\n🇸🇳 Sénégal\n🇨🇮 Côte d\'Ivoire\n🇬🇭 Ghana\n🇹🇬 Togo\n🇲🇱 Mali\n🇬🇳 Guinée\n🇧🇫 Burkina Faso\n🇧🇯 Bénin\n🇳🇪 Niger\n🇨🇲 Cameroun\n🇨🇩 RD Congo\n🇨🇬 Congo\n🇬🇦 Gabon\n🇲🇬 Madagascar\n🇹🇩 Tchad\n\nLa plateforme s\'étend progressivement à d\'autres pays africains.'
  },
  {
    keywords: ['contact', 'support', 'aide', 'assistance', 'service client'],
    response: 'Pour contacter le support Artisan Connect :\n\n📧 Email : support@artisan-connect.com\n💬 Chat : Utilisez la messagerie dans votre tableau de bord\n📱 Téléphone : +221 77 123 456\n\nNotre équipe est disponible 7j/7 de 8h à 22h. Pour les urgences, utilisez le service d\'urgence disponible 24h/24.'
  },
  {
    keywords: ['merci', 'thanks', 'thank you', 'super', 'génial', 'parfait'],
    response: 'Avec plaisir ! 😊 N\'hésitez pas si vous avez d\'autres questions. Je suis là pour vous aider à profiter pleinement d\'Artisan Connect. Bonne recherche d\'artisan ! 🛠️'
  },
  {
    keywords: ['au revoir', 'bye', 'à bientôt', 'a bientot', 'salut'],
    response: 'Au revoir ! 👋 Merci d\'avoir utilisé Artisan Connect. N\'hésitez pas à revenir si vous avez besoin d\'un artisan. Bonne journée ! 🌟'
  }
]

function findResponse(message: string): string {
  const lowerMessage = message.toLowerCase()

  // Trouver la meilleure réponse basée sur les mots-clés
  for (const item of KNOWLEDGE_BASE) {
    for (const keyword of item.keywords) {
      if (lowerMessage.includes(keyword)) {
        return item.response
      }
    }
  }

  // Réponse par défaut si aucune correspondance
  return `Je suis l'assistant Artisan Connect. 🤖

Je peux vous aider avec :
• Trouver un artisan 🔍
• Créer une mission 📝
• Comprendre le paiement 💳
• Gérer votre portefeuille 💰
• Devenir artisan 🛠️
• Les catégories disponibles 📋

Posez-moi une question sur un de ces sujets, ou demandez-moi "comment ça marche" pour une présentation de la plateforme !`
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

    // Petite pause pour simuler le "typing" (effet plus réalier)
    await new Promise(resolve => setTimeout(resolve, 400))

    const reply = findResponse(message)

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