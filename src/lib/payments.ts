/**
 * CinetPay Payment Integration
 * African payment aggregator supporting Mobile Money & Cards
 * Docs: https://docs.cinetpay.com/
 */

const CINETPAY_API_KEY = process.env.CINETPAY_API_KEY || ''
const CINETPAY_SITE_ID = process.env.CINETPAY_SITE_ID || ''
const CINETPAY_BASE_URL = 'https://api-checkout.cinetpay.com/v2'

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

/**
 * Initialize a CinetPay payment
 */
export async function initiateCinetPayPayment(params: CinetPayPaymentParams): Promise<CinetPayPaymentResponse> {
  try {
    const response = await fetch(`${CINETPAY_BASE_URL}/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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

/**
 * Verify a CinetPay payment status
 */
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
      headers: {
        'Content-Type': 'application/json',
      },
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
    return {
      success: false,
      status: 'error',
    }
  }
}

/**
 * Map our payment method IDs to CinetPay channels
 */
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

/**
 * Check if CinetPay is configured
 */
export function isCinetPayConfigured(): boolean {
  return !!(CINETPAY_API_KEY && CINETPAY_SITE_ID)
}

/**
 * Generate a unique transaction reference
 */
export function generateTransactionId(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `AC-${timestamp}-${random}`
}
