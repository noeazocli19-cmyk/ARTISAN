// Integration FeexPay - Mobile Money Benin (MTN, Moov)
// Documentation officielle : https://docs.feexpay.me/api_rest.html

const FEEXPAY_BASE_URL = (process.env.FEEXPAY_BASE_URL || "https://api.feexpay.me/api/transactions/public").replace(/\/$/, "")

export function isFeexPaySandbox(): boolean {
  return process.env.FEEXPAY_SANDBOX === "true"
}

export function isFeexPayConfigured(): boolean {
  const apiKey = process.env.FEEXPAY_API_KEY?.trim()
  const shopId = process.env.FEEXPAY_SHOP_ID?.trim()
  const hasRealCredentials = Boolean(apiKey && shopId && apiKey !== 'ta_cle_api_feexpay' && shopId !== 'ton_shop_id')
  return hasRealCredentials && (!isFeexPaySandbox() || Boolean(process.env.FEEXPAY_BASE_URL))
}

function feexpayHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + process.env.FEEXPAY_API_KEY,
  }
}
type FeexPayNetwork = "mtn" | "moov"

interface FeexPayInitiateParams {
  network: FeexPayNetwork
  phoneNumber: string
  amount: number
  firstName?: string
  lastName?: string
  description?: string
}

export async function initiateFeexPayPayment(params: FeexPayInitiateParams) {
  const { network, phoneNumber, amount, firstName, lastName, description } = params
  const url = `${FEEXPAY_BASE_URL}/requesttopay/${network}`

  const res = await fetch(url, {
    method: "POST",
    headers: feexpayHeaders(),
    body: JSON.stringify({
      shop: process.env.FEEXPAY_SHOP_ID,
      amount,
      phoneNumber,
      firstName,
      lastName,
      description,
    }),
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data?.message || "Erreur FeexPay lors de l'initiation du paiement")
  }
  return data as { reference: string; transref?: string; status?: string }
}

export async function checkFeexPayStatus(reference: string) {
  const url = `${FEEXPAY_BASE_URL}/single/status/${reference}`
  const res = await fetch(url, {
    method: "GET",
    headers: feexpayHeaders(),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data?.message || "Erreur FeexPay lors de la verification du statut")
  }
  return data as { status: string; reference: string; amount?: number | string }
}

export function normalizeFeexPayStatus(status: string): "completed" | "failed" | "processing" {
  const normalizedStatus = status.toUpperCase()
  if (["SUCCESS", "SUCCESSFUL", "COMPLETED"].includes(normalizedStatus)) return "completed"
  if (["FAILED", "FAILURE", "CANCELLED", "EXPIRED"].includes(normalizedStatus)) return "failed"
  return "processing"
}