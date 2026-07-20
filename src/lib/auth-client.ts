// src/lib/auth-client.ts
// Instance CLIENT de Better Auth - utilisable dans les Client Components ("use client")

import { createAuthClient } from "better-auth/react"

// Better Auth client instance
// No baseURL needed if app runs on same domain
// For cross-domain scenarios, pass baseURL: process.env.NEXT_PUBLIC_APP_URL
export const authClient = createAuthClient({
  // baseURL is optional when client and server are on the same domain
  // If you need cross-domain auth, uncomment and set:
  // baseURL: process.env.NEXT_PUBLIC_APP_URL,
})

// Méthodes disponibles :
// authClient.signIn.email({ email, password }) - Login
// authClient.signUp.email({ email, password, name }) - Register
// authClient.signOut() - Logout
// authClient.getSession() - Get current session
// authClient.useSession() - React hook for session state
// authClient.resetPassword({ newPassword, token }) - Reset password (Better Auth native)