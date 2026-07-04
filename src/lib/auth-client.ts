// src/lib/auth-client.ts
// Instance CLIENT de Better Auth - utilisable dans les Client Components ("use client")

import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  // Pas besoin de baseURL si l'app est sur le meme domaine
})

// Methodes disponibles :
// authClient.signIn.email(...)
// authClient.signUp.email(...)
// authClient.signOut()
// authClient.useSession()
