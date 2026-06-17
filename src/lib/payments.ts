/**
 * Artisan Connect — Payment Integration Layer
 *
 * PRIMARY PROVIDER: Kkiapay (https://kkiapay.me)
 *   - Client-side widget (openKkiapayWidget)
 *   - Server-side verification via REST API
 *
 * LEGACY: CinetPay (kept for backward compatibility, can be removed later)
 */

import crypto from 'crypto'

// ============================================================
// CONFIGURATION
// ============================================================

const KKIAPAY_API_KEY = process.env.KKIAPAY_API_KEY || ''
const KKIAPAY_PRIVATE_KEY = process.env.KKIAPAY_PRIVATE_KEY || ''
const KKIAPAY_SECRET_KEY = process.env.KKIAPAY_SECRET_KEY || ''
const KKIAPAY_SANDBOX = process.env.KKIAPAY_SANDBOX === 'true'
const KKIAPAY_BASE_URL = 'https://api.kkiapay.me/api/v1'

const CINETPAY_API_KEY = process.env.CINETPAY_API_KEY || ''
const CINETPAY_SITE_ID = process.env.CINETPAY_SITE_ID || ''
const CINETPAY_BASE_URL = 'https://api-checkout.cinetpay.com/v2'

// ============================================================
// COMMISSION CALCULATION
// ============================================================

export interface CommissionBreakdown {
  originalAmount: number // amount the user wants to deposit/send
  commission: number // platform commission (2%)
  totalToPay: number // amount actually charged (originalAmount + commission)
  netAmount: number // amount credited to wallet (originalAmount)
}

/**
 * Calculate the platform commission for a client-facing payment.
 * Commission rate: 2% (minimum 100 FCFA, maximum 5000 FCFA)
 */
export function calculateClientCommission(originalAmount: number): CommissionBreakdown {
  const COMMISSION_RATE = 0.02
  const MIN_COMMISSION = 100
  const MAX_COMMISSION = 5000

  let commission = Math.round(originalAmount * COMMISSION_RATE)
  commission = Math.max(MIN_COMMISSION, Math.min(MAX_COMMISSION, commission))

  return {
    originalAmount,
    commission,
    totalToPay: originalAmount + commission,
    netAmount: originalAmount,
  }
}

/**
 * Calculate the artisan payout (amount received after platform fee).
 * Platform fee: 5% (deducted from artisan's payment)
 */
export function calculateArtisanPayout(grossAmount: number): {
  grossAmount: number
  platformFee: number
  netPayout: number
} {
  const PLATFORM_FEE_RATE = 0.05
  const platformFee = Math.round(grossAmount * PLATFORM_FEE_RATE)
  return {
    grossAmount,
    platformFee,
    netPayout: grossAmount - platformFee,
  }
}

// ============================================================
// TRANSACTION ID GENERATION
// ============================================================

/**
 * Generate a unique transaction reference
 */
export function generateTransactionId(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `AC-${timestamp}-${random}`
}

// ============================================================
// KKIAPAY — Primary Provider
// ============================================================

export function isKkiapayConfigured(): boolean {
  return !!(KKIAPAY_API_KEY && KKIAPAY_PRIVATE_KEY)
}

export function getKkiapayPublicKey(): string {
  return KKIAPAY_API_KEY
}

export function isKkiapaySandbox(): boolean {
  return KKIAPAY_SANDBOX
}

export interface KkiapayVerificationResult {
  success: boolean
  status: string // 'completed' | 'failed' | 'pending'
  amount?: number
  method?: string
  transactionId?: string
  payload?: unknown
}

/**
 * Verify a Kkiapay transaction server-side.
 * Docs: https://docs.kkiapay.me
 *
 * @param transactionId - The Kkiapay transaction ID returned by the widget
 */
export async function verifyKkiapayTransaction(transactionId: string): Promise<KkiapayVerificationResult> {
  if (!isKkiapayConfigured()) {
    return {
      success: false,
      status: 'error',
    }
  }

  try {
    const response = await fetch(`${KKIAPAY_BASE_URL}/transactions/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': KKIAPAY_PRIVATE_KEY,
      },
      body: JSON.stringify({
        transactionId,
      }),
    })

    if (!response.ok) {
      console.error('Kkiapay verification HTTP error:', response.status, response.statusText)
      return { success: false, status: 'error' }
    }

    const data = await response.json()

    // Kkiapay returns status as 'SUCCESS' for completed transactions
    // Other possible: 'FAILED', 'PENDING', 'REFUNDED'
    const status = String(data?.status || '').toUpperCase()
    const mappedStatus =
      status === 'SUCCESS' ? 'completed' :
      status === 'FAILED' ? 'failed' :
      status === 'REFUNDED' ? 'refunded' :
      'pending'

    return {
      success: status === 'SUCCESS',
      status: mappedStatus,
      amount: data?.amount ? Number(data.amount) : undefined,
      method: data?.paymentMethod || data?.source || undefined,
      transactionId,
      payload: data,
    }
  } catch (error) {
    console.error('Kkiapay verification error:', error)
    return {
      success: false,
      status: 'error',
    }
  }
}

/**
 * Verify the signature of a Kkiapay webhook notification.
 * Kkiapay signs webhooks with HMAC SHA256 using the secret key.
 *
 * @param payload - Raw request body (string)
 * @param signature - Signature from the 'x-kkiapay-signature' header
 */
export function verifyKkiapayWebhookSignature(payload: string, signature: string): boolean {
  if (!KKIAPAY_SECRET_KEY) return false
  try {
    const computed = crypto
      .createHmac('sha256', KKIAPAY_SECRET_KEY)
      .update(payload)
      .digest('hex')
    return computed === signature
  } catch (error) {
    console.error('Kkiapay webhook signature verification error:', error)
    return false
  }
}

// ============================================================
// CINETPAY — Legacy Provider (kept for backward compatibility)
// ============================================================

export interface CinetPayPaymentParams {
  transactionId: string
  amount: number
  currency: string
  description: string
  customerName: string
  customerEmail: string
  customerPhoneNumber?: string
  channels: string // 'MOBILE_MONEY', 'CREDIT_CARD', 'ALL'
  returnUrl: string
  notifyUrl: string
  metadata?: string
}

export interface CinetPayPaymentResponse {
  code: string
  message: string
  data?: {
    payment_token: string
    payment_url: string
  }
  api_response_id?: string
}

export async function initiateCinetPayPayment(params: CinetPayPaymentParams): Promise<CinetPayPaymentResponse> {
  try {
    const response = await fetch(`${CINETPAY_BASE_URL}/payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apikey: CINETPAY_API_KEY,
        site_id: CINETPAY_SITE_ID,
        transaction_id: params.transactionId,
        amount: params.amount,
        currency: params.currency,
        description: params.description,
        customer_name: params.customerName,
        customer_email: params.customerEmail,
        customer_phone_number: params.customerPhoneNumber || '',
        channels: params.channels,
        return_url: params.returnUrl,
        notify_url: params.notifyUrl,
        metadata: params.metadata || '',
      }),
    })

    const data = await response.json()
    return data as CinetPayPaymentResponse
  } catch (error) {
    console.error('CinetPay payment initiation error:', error)
    return {
      code: 'ERROR',
      message: 'Erreur lors de l\'initialisation du paiement',
    }
  }
}

export async function verifyCinetPayPayment(transactionId: string): Promise<{
  success: boolean
  status: string
  amount?: number
  method?: string
  metadata?: string
}> {
  try {
    const response = await fetch(`${CINETPAY_BASE_URL}/payment/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apikey: CINETPAY_API_KEY,
        site_id: CINETPAY_SITE_ID,
        transaction_id: transactionId,
      }),
    })

    const data = await response.json()

    if (data.code === '00' && data.data?.status === 'ACCEPTED') {
      return {
        success: true,
        status: 'completed',
        amount: data.data.amount,
        method: data.data.payment_method || data.data.channel,
        metadata: data.data.metadata,
      }
    }

    return {
      success: false,
      status: data.data?.status?.toLowerCase() || 'unknown',
    }
  } catch (error) {
    console.error('CinetPay verification error:', error)
    return { success: false, status: 'error' }
  }
}

export function getChannelForMethod(method: string): string {
  const channelMap: Record<string, string> = {
    orange_money: 'MOBILE_MONEY',
    mtn_money: 'MOBILE_MONEY',
    wave: 'MOBILE_MONEY',
    moov_money: 'MOBILE_MONEY',
    airtel_money: 'MOBILE_MONEY',
    m_pesa: 'MOBILE_MONEY',
    card: 'CREDIT_CARD',
    cash: 'ALL',
  }
  return channelMap[method] || 'ALL'
}

export function isCinetPayConfigured(): boolean {
  return !!(CINETPAY_API_KEY && CINETPAY_SITE_ID)
}

// ============================================================
// UNIFIED HELPERS
// ============================================================

/**
 * Returns the active payment provider name.
 * Priority: Kkiapay (primary) > CinetPay (legacy)
 */
export function getActiveProvider(): 'kkiapay' | 'cinetpay' | 'demo' {
  if (isKkiapayConfigured()) return 'kkiapay'
  if (isCinetPayConfigured()) return 'cinetpay'
  return 'demo'
}

/**
 * Check if any real payment provider is configured.
 * When false, the app runs in "demo mode" (payments auto-complete for testing).
 */
export function isPaymentConfigured(): boolean {
  return isKkiapayConfigured() || isCinetPayConfigured()
}