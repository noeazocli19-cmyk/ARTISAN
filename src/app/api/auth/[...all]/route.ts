// src/app/api/auth/[...all]/route.ts
// Monte toutes les routes Better Auth automatiquement

import { auth } from "@/lib/better-auth"
import { toNextJsHandler } from "better-auth/next-js"

export const { GET, POST } = toNextJsHandler(auth)
