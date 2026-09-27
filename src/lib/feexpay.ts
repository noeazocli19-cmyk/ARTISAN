// Integration FeexPay - Mobile Money Benin (MTN, Moov)
// Documentation officielle : https://docs.feexpay.me/api_rest.html

const FEEXPAY_BASE_URL = "https://api.feexpay.me/api/transactions/public"

export function isFeexPayConfigured(): boolean {
  return Boolean(process.env.FEEXPAY_API_KEY && process.env.FEEXPAY_SHOP_ID)
}

function feexpayHeaders() {
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${process.env.FEEXPAY_API_KEY}`,
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
  return data as { status: "PENDING" | "SUCCESSFUL" | "FAILED"; reference: string }
}