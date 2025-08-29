// Payment Service for HabibiStay
// Comprehensive payment integration with MyFatoorah and PayPal

import { Database } from '../db';

export interface PaymentProvider {
  id: string;
  name: string;
  isActive: boolean;
  supportedCurrencies: string[];
  supportedCountries: string[];
}

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'bank_transfer' | 'wallet' | 'installments';
  provider: string;
  name: string;
  logo?: string;
  isActive: boolean;
}

export interface PaymentRequest {
  bookingId: string;
  amount: number;
  currency: string;
  description: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      postal_code?: string;
    };
  };
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  success: boolean;
  paymentId: string;
  transactionId?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  paymentUrl?: string;
  redirectUrl?: string;
  error?: string;
  provider: string;
  metadata?: Record<string, any>;
}

export interface RefundRequest {
  paymentId: string;
  amount: number;
  reason?: string;
  metadata?: Record<string, any>;
}

export interface RefundResponse {
  success: boolean;
  refundId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  error?: string;
}

export interface WebhookPayload {
  provider: string;
  event: string;
  data: any;
  signature?: string;
  timestamp: string;
  // Optional metadata container (headers, transmission info) used by webhook verification
  metadata?: Record<string, any>;
}

export class PaymentService {
  private myFatoorahConfig: {
    apiKey: string;
    baseUrl: string;
    webhookSecret: string;
  };

  private paypalConfig: {
    clientId: string;
    clientSecret: string;
    mode: 'sandbox' | 'live';
    webhookId: string;
  };

  constructor(private db: Database) {
    this.myFatoorahConfig = {
      apiKey: process.env.MYFATOORAH_API_KEY || '',
      baseUrl: process.env.MYFATOORAH_BASE_URL || 'https://api.myfatoorah.com',
      webhookSecret: process.env.MYFATOORAH_WEBHOOK_SECRET || ''
    };

    this.paypalConfig = {
      clientId: process.env.PAYPAL_CLIENT_ID || '',
      clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
      mode: (process.env.PAYPAL_MODE as 'sandbox' | 'live') || 'sandbox',
      webhookId: process.env.PAYPAL_WEBHOOK_ID || ''
    };
  }

  // Get available payment providers
  async getPaymentProviders(): Promise<PaymentProvider[]> {
    return [
      {
        id: 'myfatoorah',
        name: 'MyFatoorah',
        isActive: !!this.myFatoorahConfig.apiKey,
        supportedCurrencies: ['SAR', 'AED', 'KWD', 'BHD', 'QAR', 'OMR', 'JOD', 'EGP'],
        supportedCountries: ['SA', 'AE', 'KW', 'BH', 'QA', 'OM', 'JO', 'EG']
      },
      {
        id: 'paypal',
        name: 'PayPal',
        isActive: !!this.paypalConfig.clientId,
        supportedCurrencies: ['USD', 'EUR', 'GBP', 'SAR', 'AED'],
        supportedCountries: ['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'IT', 'ES', 'SA', 'AE']
      }
    ];
  }

  // Get payment methods for a provider
  async getPaymentMethods(provider: string, currency: string = 'SAR'): Promise<PaymentMethod[]> {
    try {
      if (provider === 'myfatoorah') {
        return await this.getMyFatoorahPaymentMethods(currency);
      } else if (provider === 'paypal') {
        return await this.getPayPalPaymentMethods();
      }
      
      throw new Error(`Unsupported payment provider: ${provider}`);
    } catch (error) {
      throw new Error(`Failed to get payment methods: ${error.message}`);
    }
  }

  // Create payment
  async createPayment(request: PaymentRequest, provider: string = 'myfatoorah'): Promise<PaymentResponse> {
    try {
      // Validate request
      await this.validatePaymentRequest(request);

      // Create payment record
      const paymentId = await this.createPaymentRecord(request, provider);

      let response: PaymentResponse;

      if (provider === 'myfatoorah') {
        response = await this.createMyFatoorahPayment(paymentId, request);
      } else if (provider === 'paypal') {
        response = await this.createPayPalPayment(paymentId, request);
      } else {
        throw new Error(`Unsupported payment provider: ${provider}`);
      }

      // Update payment record
      await this.updatePaymentRecord(paymentId, response);

      return response;
    } catch (error) {
      throw new Error(`Failed to create payment: ${error.message}`);
    }
  }

  // Verify payment
  async verifyPayment(paymentId: string, provider: string): Promise<PaymentResponse> {
    try {
      let response: PaymentResponse;

      if (provider === 'myfatoorah') {
        response = await this.verifyMyFatoorahPayment(paymentId);
      } else if (provider === 'paypal') {
        response = await this.verifyPayPalPayment(paymentId);
      } else {
        throw new Error(`Unsupported payment provider: ${provider}`);
      }

      // Update payment record
      await this.updatePaymentRecord(paymentId, response);

      return response;
    } catch (error) {
      throw new Error(`Failed to verify payment: ${error.message}`);
    }
  }

  // Process refund
  async processRefund(paymentId: string, amount: number, reason?: string): Promise<RefundResponse> {
    try {
      // Get payment details
      const payment = await this.getPaymentRecord(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      // Validate refund amount
      if (amount > payment.amount) {
        throw new Error('Refund amount cannot exceed payment amount');
      }

      let response: RefundResponse;

      if (payment.provider === 'myfatoorah') {
        response = await this.processMyFatoorahRefund(payment.provider_transaction_id, amount, reason);
      } else if (payment.provider === 'paypal') {
        response = await this.processPayPalRefund(payment.provider_transaction_id, amount, reason);
      } else {
        throw new Error(`Unsupported payment provider: ${payment.provider}`);
      }

      // Create refund record
      await this.createRefundRecord(paymentId, response, reason);

      return response;
    } catch (error) {
      throw new Error(`Failed to process refund: ${error.message}`);
    }
  }

  // Handle webhook (with idempotency guard)
  async handleWebhook(payload: WebhookPayload): Promise<void> {
    try {
      // Idempotency: skip processing if the same webhook payload was already logged
      try {
        const payloadStr = JSON.stringify(payload.data || {});
        const existing = await this.db.get(
          `SELECT id FROM webhook_logs WHERE provider = ? AND event = ? AND payload = ?`,
          [payload.provider, payload.event, payloadStr]
        );
        if (existing) {
          // Already processed this exact payload -> ignore
          console.warn('Duplicate webhook received - ignoring', { provider: payload.provider, event: payload.event });
          return;
        }
      } catch (e) {
        // continue if idempotency check fails for any reason (best-effort)
        console.warn('Webhook idempotency check failed, continuing:', e);
      }

      // Verify webhook signature
      const isValid = await this.verifyWebhookSignature(payload);
      if (!isValid) {
        throw new Error('Invalid webhook signature');
      }

      if (payload.provider === 'myfatoorah') {
        await this.handleMyFatoorahWebhook(payload);
      } else if (payload.provider === 'paypal') {
        await this.handlePayPalWebhook(payload);
      } else {
        throw new Error(`Unsupported webhook provider: ${payload.provider}`);
      }

      // Log webhook (successful processing)
      await this.logWebhook(payload);
    } catch (error) {
      console.error('Webhook handling failed:', error);
      // Still attempt to log the failed webhook for audit (best-effort)
      try {
        await this.db.run(
          `INSERT INTO webhook_logs (provider, event, payload, processed_at) VALUES (?, ?, ?, ?)`,
          [payload.provider, payload.event, JSON.stringify(payload.data || {}), new Date().toISOString()]
        );
      } catch (e) {
        console.warn('Failed to persist failed webhook log:', e);
      }
      throw error;
    }
  }

  // MyFatoorah implementation
  private async getMyFatoorahPaymentMethods(currency: string): Promise<PaymentMethod[]> {
    try {
      const response = await fetch(`${this.myFatoorahConfig.baseUrl}/v2/InitiatePayment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.myFatoorahConfig.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          InvoiceAmount: 1,
          CurrencyIso: currency
        })
      });

      const data = await response.json();

      if (!data.IsSuccess) {
        throw new Error(data.Message || 'Failed to get payment methods');
      }

      return data.Data.PaymentMethods.map((method: any) => ({
        id: method.PaymentMethodId.toString(),
        type: this.mapMyFatoorahPaymentType(method.PaymentMethodCode),
        provider: 'myfatoorah',
        name: method.PaymentMethodEn,
        logo: method.ImageUrl,
        isActive: method.IsDirectPayment
      }));
    } catch (error) {
      throw new Error(`Failed to get MyFatoorah payment methods: ${error.message}`);
    }
  }

  private async createMyFatoorahPayment(paymentId: string, request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.myFatoorahConfig.baseUrl}/v2/ExecutePayment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.myFatoorahConfig.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          PaymentMethodId: 0, // 0 for payment gateway selection page
          InvoiceValue: request.amount,
          DisplayCurrencyIso: request.currency,
          CustomerName: request.customerInfo.name,
          CustomerEmail: request.customerInfo.email,
          CustomerMobile: request.customerInfo.phone,
          CustomerReference: request.bookingId,
          InvoiceItemsCreate: [
            {
              ItemName: request.description,
              Quantity: 1,
              UnitPrice: request.amount
            }
          ],
          CallBackUrl: `${process.env.APP_URL}/api/payments/callback/myfatoorah`,
          ErrorUrl: `${process.env.APP_URL}/api/payments/error/myfatoorah`,
          Language: 'en',
          UserDefinedField: paymentId
        })
      });

      const data = await response.json();

      if (!data.IsSuccess) {
        throw new Error(data.Message || 'Payment creation failed');
      }

      return {
        success: true,
        paymentId,
        transactionId: data.Data.InvoiceId.toString(),
        status: 'pending',
        amount: request.amount,
        currency: request.currency,
        paymentUrl: data.Data.PaymentURL,
        provider: 'myfatoorah',
        metadata: {
          invoiceId: data.Data.InvoiceId,
          invoiceStatus: data.Data.InvoiceStatus
        }
      };
    } catch (error) {
      return {
        success: false,
        paymentId,
        status: 'failed',
        amount: request.amount,
        currency: request.currency,
        provider: 'myfatoorah',
        error: error.message
      };
    }
  }

  private async verifyMyFatoorahPayment(paymentId: string): Promise<PaymentResponse> {
    try {
      const payment = await this.getPaymentRecord(paymentId);
      
      const response = await fetch(`${this.myFatoorahConfig.baseUrl}/v2/GetPaymentStatus`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.myFatoorahConfig.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          Key: payment.provider_transaction_id,
          KeyType: 'InvoiceId'
        })
      });

      const data = await response.json();

      if (!data.IsSuccess) {
        throw new Error(data.Message || 'Payment verification failed');
      }

      const status = this.mapMyFatoorahStatus(data.Data.InvoiceStatus);

      return {
        success: status === 'completed',
        paymentId,
        transactionId: data.Data.InvoiceId.toString(),
        status,
        amount: data.Data.InvoiceValue,
        currency: data.Data.DisplayCurrencyIso,
        provider: 'myfatoorah',
        metadata: {
          invoiceStatus: data.Data.InvoiceStatus,
          transactionId: data.Data.TransactionId
        }
      };
    } catch (error) {
      throw new Error(`MyFatoorah payment verification failed: ${error.message}`);
    }
  }

  private async processMyFatoorahRefund(transactionId: string, amount: number, reason?: string): Promise<RefundResponse> {
    try {
      const response = await fetch(`${this.myFatoorahConfig.baseUrl}/v2/MakeRefund`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.myFatoorahConfig.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          KeyType: 'InvoiceId',
          Key: transactionId,
          RefundChargeOnCustomer: false,
          ServiceChargeOnCustomer: false,
          Amount: amount,
          Comment: reason || 'Refund requested'
        })
      });

      const data = await response.json();

      if (!data.IsSuccess) {
        throw new Error(data.Message || 'Refund failed');
      }

      return {
        success: true,
        refundId: data.Data.RefundId.toString(),
        amount: data.Data.Amount,
        status: 'completed'
      };
    } catch (error) {
      return {
        success: false,
        refundId: '',
        amount,
        status: 'failed',
        error: error.message
      };
    }
  }

  private async handleMyFatoorahWebhook(payload: WebhookPayload): Promise<void> {
    // Handle MyFatoorah webhook events
    const { event, data } = payload;

    switch (event) {
      case 'Payment.Completed':
        await this.handlePaymentCompleted(data.invoiceId, 'myfatoorah');
        break;
      case 'Payment.Failed':
        await this.handlePaymentFailed(data.invoiceId, 'myfatoorah');
        break;
      case 'Refund.Completed':
        await this.handleRefundCompleted(data.refundId, 'myfatoorah');
        break;
      default:
        console.log(`Unhandled MyFatoorah webhook event: ${event}`);
    }
  }

  // PayPal implementation
  private async getPayPalPaymentMethods(): Promise<PaymentMethod[]> {
    return [
      {
        id: 'paypal_account',
        type: 'wallet',
        provider: 'paypal',
        name: 'PayPal Account',
        isActive: true
      },
      {
        id: 'paypal_credit',
        type: 'credit_card',
        provider: 'paypal',
        name: 'Credit/Debit Card via PayPal',
        isActive: true
      }
    ];
  }

  private async createPayPalPayment(paymentId: string, request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Get PayPal access token
      const accessToken = await this.getPayPalAccessToken();

      const response = await fetch(`${this.getPayPalBaseUrl()}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'PayPal-Request-Id': paymentId
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [
            {
              reference_id: request.bookingId,
              description: request.description,
              amount: {
                currency_code: request.currency,
                value: request.amount.toFixed(2)
              }
            }
          ],
          payment_source: {
            paypal: {
              experience_context: {
                payment_method_preference: 'UNRESTRICTED',
                user_action: 'PAY_NOW',
                return_url: `${process.env.APP_URL}/api/payments/callback/paypal`,
                cancel_url: `${process.env.APP_URL}/api/payments/cancel/paypal`
              }
            }
          }
        })
      });

      const data = await response.json();

      if (response.status !== 201) {
        throw new Error(data.message || 'PayPal payment creation failed');
      }

      const approvalUrl = data.links.find((link: any) => link.rel === 'approve')?.href;

      return {
        success: true,
        paymentId,
        transactionId: data.id,
        status: 'pending',
        amount: request.amount,
        currency: request.currency,
        paymentUrl: approvalUrl,
        provider: 'paypal',
        metadata: {
          orderId: data.id,
          status: data.status
        }
      };
    } catch (error) {
      return {
        success: false,
        paymentId,
        status: 'failed',
        amount: request.amount,
        currency: request.currency,
        provider: 'paypal',
        error: error.message
      };
    }
  }

  private async verifyPayPalPayment(paymentId: string): Promise<PaymentResponse> {
    try {
      const payment = await this.getPaymentRecord(paymentId);
      const accessToken = await this.getPayPalAccessToken();

      const response = await fetch(`${this.getPayPalBaseUrl()}/v2/checkout/orders/${payment.provider_transaction_id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'PayPal payment verification failed');
      }

      const status = this.mapPayPalStatus(data.status);

      return {
        success: status === 'completed',
        paymentId,
        transactionId: data.id,
        status,
        amount: parseFloat(data.purchase_units[0].amount.value),
        currency: data.purchase_units[0].amount.currency_code,
        provider: 'paypal',
        metadata: {
          orderId: data.id,
          orderStatus: data.status
        }
      };
    } catch (error) {
      throw new Error(`PayPal payment verification failed: ${error.message}`);
    }
  }

  private async processPayPalRefund(transactionId: string, amount: number, reason?: string): Promise<RefundResponse> {
    try {
      const accessToken = await this.getPayPalAccessToken();

      // First get the capture ID from the order
      const orderResponse = await fetch(`${this.getPayPalBaseUrl()}/v2/checkout/orders/${transactionId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      const orderData = await orderResponse.json();
      const captureId = orderData.purchase_units[0].payments.captures[0].id;

      // Process refund
      const response = await fetch(`${this.getPayPalBaseUrl()}/v2/payments/captures/${captureId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          amount: {
            value: amount.toFixed(2),
            currency_code: orderData.purchase_units[0].amount.currency_code
          },
          note_to_payer: reason || 'Refund processed'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'PayPal refund failed');
      }

      return {
        success: true,
        refundId: data.id,
        amount: parseFloat(data.amount.value),
        status: data.status === 'COMPLETED' ? 'completed' : 'pending'
      };
    } catch (error) {
      return {
        success: false,
        refundId: '',
        amount,
        status: 'failed',
        error: error.message
      };
    }
  }

  private async handlePayPalWebhook(payload: WebhookPayload): Promise<void> {
    // Handle PayPal webhook events
    const { event, data } = payload;

    switch (event) {
      case 'CHECKOUT.ORDER.APPROVED':
        await this.handlePaymentCompleted(data.id, 'paypal');
        break;
      case 'PAYMENT.CAPTURE.COMPLETED':
        await this.handlePaymentCompleted(data.supplementary_data.related_ids.order_id, 'paypal');
        break;
      case 'PAYMENT.CAPTURE.DENIED':
        await this.handlePaymentFailed(data.supplementary_data.related_ids.order_id, 'paypal');
        break;
      default:
        console.log(`Unhandled PayPal webhook event: ${event}`);
    }
  }

  // Helper methods
  private async getPayPalAccessToken(): Promise<string> {
    const response = await fetch(`${this.getPayPalBaseUrl()}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en_US',
        'Authorization': `Basic ${Buffer.from(`${this.paypalConfig.clientId}:${this.paypalConfig.clientSecret}`).toString('base64')}`
      },
      body: 'grant_type=client_credentials'
    });

    const data = await response.json();
    return data.access_token;
  }

  private getPayPalBaseUrl(): string {
    return this.paypalConfig.mode === 'sandbox' 
      ? 'https://api.sandbox.paypal.com'
      : 'https://api.paypal.com';
  }

  private mapMyFatoorahPaymentType(code: string): PaymentMethod['type'] {
    const typeMap: Record<string, PaymentMethod['type']> = {
      'VISA': 'credit_card',
      'MAST': 'credit_card',
      'AMEX': 'credit_card',
      'KNET': 'bank_transfer',
      'BENE': 'bank_transfer',
      'BNST': 'installments'
    };
    return typeMap[code] || 'credit_card';
  }

  private mapMyFatoorahStatus(status: string): PaymentResponse['status'] {
    const statusMap: Record<string, PaymentResponse['status']> = {
      'Paid': 'completed',
      'Pending': 'pending',
      'Failed': 'failed',
      'Cancelled': 'cancelled'
    };
    return statusMap[status] || 'pending';
  }

  private mapPayPalStatus(status: string): PaymentResponse['status'] {
    const statusMap: Record<string, PaymentResponse['status']> = {
      'COMPLETED': 'completed',
      'APPROVED': 'completed',
      'CREATED': 'pending',
      'SAVED': 'pending',
      'CANCELLED': 'cancelled',
      'FAILED': 'failed'
    };
    return statusMap[status] || 'pending';
  }

  private async validatePaymentRequest(request: PaymentRequest): Promise<void> {
    if (!request.bookingId) {
      throw new Error('Booking ID is required');
    }

    if (!request.amount || request.amount <= 0) {
      throw new Error('Valid payment amount is required');
    }

    if (!request.currency) {
      throw new Error('Currency is required');
    }

    if (!request.customerInfo.name || !request.customerInfo.email) {
      throw new Error('Customer name and email are required');
    }
  }

  private async createPaymentRecord(request: PaymentRequest, provider: string): Promise<string> {
    const paymentId = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await this.db.run(`
      INSERT INTO payments (
        id, booking_id, amount, currency, provider, status, 
        customer_name, customer_email, customer_phone, description,
        metadata, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      paymentId,
      request.bookingId,
      request.amount,
      request.currency,
      provider,
      'pending',
      request.customerInfo.name,
      request.customerInfo.email,
      request.customerInfo.phone,
      request.description,
      JSON.stringify(request.metadata || {}),
      new Date().toISOString(),
      new Date().toISOString()
    ]);

    return paymentId;
  }

  private async updatePaymentRecord(paymentId: string, response: PaymentResponse): Promise<void> {
    await this.db.run(`
      UPDATE payments 
      SET provider_transaction_id = ?, status = ?, payment_url = ?, 
          provider_metadata = ?, updated_at = ?
      WHERE id = ?
    `, [
      response.transactionId,
      response.status,
      response.paymentUrl,
      JSON.stringify(response.metadata || {}),
      new Date().toISOString(),
      paymentId
    ]);
  }

  private async getPaymentRecord(paymentId: string): Promise<any> {
    return await this.db.get('SELECT * FROM payments WHERE id = ?', [paymentId]);
  }

  private async createRefundRecord(paymentId: string, response: RefundResponse, reason?: string): Promise<void> {
    // Prevent duplicate refund records for same payment + provider refund id + amount
    try {
      const existing = await this.db.get(
        `SELECT id FROM refunds WHERE payment_id = ? AND provider_refund_id = ? AND amount = ?`,
        [paymentId, response.refundId || '', response.amount]
      );
      if (existing) {
        // Already recorded
        return;
      }
    } catch (e) {
      // ignore and proceed to create (best-effort)
    }

    await this.db.run(`
      INSERT INTO refunds (
        id, payment_id, amount, status, provider_refund_id, 
        reason, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      `REF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      paymentId,
      response.amount,
      response.status,
      response.refundId,
      reason || '',
      new Date().toISOString(),
      new Date().toISOString()
    ]);
  }

  private async verifyWebhookSignature(payload: WebhookPayload): Promise<boolean> {
    // Basic webhook signature verification implementations.
    // MyFatoorah: if webhookSecret configured, expect HMAC-SHA256 of JSON(data)+timestamp in payload.signature
    // PayPal: if webhookId configured, we attempt a best-effort verification by calling PayPal API (if credentials exist).
    try {
      if (payload.provider === 'myfatoorah') {
        if (!this.myFatoorahConfig.webhookSecret) return true; // allow if not configured (fallback)
        if (!payload.signature || !payload.timestamp) return false;

        const encoder = new TextEncoder();
        const msg = JSON.stringify(payload.data) + '|' + payload.timestamp;
        const key = await crypto.subtle.importKey(
          'raw',
          encoder.encode(this.myFatoorahConfig.webhookSecret),
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['verify']
        );
        const signatureBuf = Uint8Array.from(atob(payload.signature), c => c.charCodeAt(0));
        const expected = await crypto.subtle.verify('HMAC', key, signatureBuf, encoder.encode(msg));
        return expected;
      } else if (payload.provider === 'paypal') {
        // PayPal webhook verification requires verifying the signature via PayPal API.
        // If client credentials are not configured, fall back to trusting the webhook (not ideal for prod).
        if (!this.paypalConfig.clientId || !this.paypalConfig.clientSecret) return true;

        try {
          // Attempt to call PayPal webhook verification endpoint (best-effort).
          // Construct verification body per PayPal docs if payload.signature and headers present in metadata
          const verificationUrl = `${this.getPayPalBaseUrl()}/v1/notifications/verify-webhook-signature`;
          // Payload.metadata may include headers required; attempt to read common fields
          const webhookMeta = (payload.metadata || {}) as any;
          const verificationBody = {
            auth_algo: webhookMeta.auth_algo || 'SHA256withRSA',
            cert_url: webhookMeta.cert_url || '',
            transmission_id: webhookMeta.transmission_id || '',
            transmission_sig: payload.signature || webhookMeta.transmission_sig || '',
            transmission_time: payload.timestamp || webhookMeta.transmission_time || '',
            webhook_id: this.paypalConfig.webhookId || webhookMeta.webhook_id || '',
            webhook_event: {
              id: webhookMeta.event_id || '',
              event_type: payload.event,
              resource: payload.data || {}
            }
          };

          // Obtain access token
          const token = await this.getPayPalAccessToken();

          const resp = await fetch(verificationUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(verificationBody)
          });

          const data = await resp.json();
          return data && (data.verification_status === 'SUCCESS' || data.verification_status === 'SUCCESS_WITH_WARNING');
        } catch (err) {
          console.warn('PayPal webhook verification failed (best-effort):', err);
          return false;
        }
      }
    } catch (err) {
      console.error('Webhook signature verification error:', err);
      return false;
    }

    return false;
  }

  private async handlePaymentCompleted(transactionId: string, provider: string): Promise<void> {
    // Update payment status and booking status
    await this.db.run(`
      UPDATE payments 
      SET status = 'completed', updated_at = ?
      WHERE provider_transaction_id = ? AND provider = ?
    `, [new Date().toISOString(), transactionId, provider]);

    // Update booking status
    const payment = await this.db.get(`
      SELECT booking_id FROM payments 
      WHERE provider_transaction_id = ? AND provider = ?
    `, [transactionId, provider]);

    if (payment) {
      await this.db.run(`
        UPDATE bookings 
        SET status = 'confirmed', updated_at = ?
        WHERE id = ?
      `, [new Date().toISOString(), payment.booking_id]);
    }
  }

  private async handlePaymentFailed(transactionId: string, provider: string): Promise<void> {
    // Update payment status
    await this.db.run(`
      UPDATE payments 
      SET status = 'failed', updated_at = ?
      WHERE provider_transaction_id = ? AND provider = ?
    `, [new Date().toISOString(), transactionId, provider]);
  }

  private async handleRefundCompleted(refundId: string, provider: string): Promise<void> {
    // Update refund status
    await this.db.run(`
      UPDATE refunds 
      SET status = 'completed', updated_at = ?
      WHERE provider_refund_id = ?
    `, [new Date().toISOString(), refundId]);
  }

  private async logWebhook(payload: WebhookPayload): Promise<void> {
    await this.db.run(`
      INSERT INTO webhook_logs (
        provider, event, payload, processed_at
      ) VALUES (?, ?, ?, ?)
    `, [
      payload.provider,
      payload.event,
      JSON.stringify(payload.data),
      new Date().toISOString()
    ]);
  }
}
