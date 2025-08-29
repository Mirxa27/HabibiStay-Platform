import { z } from "zod";

// MyFatoorah Payment Schemas
export const PaymentRequestSchema = z.object({
  InvoiceAmount: z.number().positive(),
  CurrencyIso: z.string().default('SAR'),
  CustomerName: z.string(),
  CustomerEmail: z.string().email(),
  CustomerPhone: z.string().optional(),
  CallBackUrl: z.string().url(),
  ErrorUrl: z.string().url(),
  Language: z.enum(['en', 'ar']).default('en'),
  DisplayCurrencyIso: z.string().default('SAR'),
  MobileCountryCode: z.string().optional(),
  CustomerReference: z.string().optional(),
  UserDefinedField: z.string().optional(),
});

export const PaymentStatusSchema = z.object({
  InvoiceId: z.number(),
  InvoiceStatus: z.string(),
  InvoiceReference: z.string().optional(),
  CustomerReference: z.string().optional(),
  PaymentId: z.number().optional(),
  TransactionId: z.string().optional(),
  ExpiryDate: z.string().optional(),
  InvoiceDisplayValue: z.string().optional(),
});

export const CreatePaymentSchema = z.object({
  booking_id: z.number(),
  amount: z.number().positive(),
  currency: z.string().default('SAR'),
  return_url: z.string().url(),
  cancel_url: z.string().url(),
});

export const PaymentCallbackSchema = z.object({
  paymentId: z.string(),
  Id: z.string().optional(),
  InvoiceId: z.string().optional(),
});

// Types
export type PaymentRequest = z.infer<typeof PaymentRequestSchema>;
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;
export type CreatePayment = z.infer<typeof CreatePaymentSchema>;
export type PaymentCallback = z.infer<typeof PaymentCallbackSchema>;

// MyFatoorah API Response Types
export interface MyFatoorahCreateInvoiceResponse {
  IsSuccess: boolean;
  Message: string;
  ValidationErrors: any[];
  Data: {
    InvoiceId: number;
    InvoiceURL: string;
    CustomerReference: string;
    UserDefinedField: string;
  };
}

export interface MyFatoorahPaymentStatusResponse {
  IsSuccess: boolean;
  Message: string;
  Data: {
    InvoiceId: number;
    InvoiceStatus: string;
    InvoiceReference: string;
    CustomerReference: string;
    CreatedDate: string;
    ExpiryDate: string;
    InvoiceValue: number;
    Comments: string;
    CustomerName: string;
    CustomerMobile: string;
    CustomerEmail: string;
    UserDefinedField: string;
    InvoiceDisplayValue: string;
    DueDeposit: number;
    DepositeStatus: string;
    InvoiceItems: any[];
    InvoiceTransactions: Array<{
      TransactionDate: string;
      PaymentGateway: string;
      ReferenceId: string;
      TrackId: string;
      TransactionId: string;
      PaymentId: string;
      AuthorizationId: string;
      TransactionStatus: string;
      TransactionValue: string;
      CustomerServiceCharge: number;
      DueValue: number;
      PaidCurrency: string;
      PaidCurrencyValue: string;
      IpAddress: string;
      Country: string;
      Currency: string;
      Error: string;
      CardNumber: string;
      ErrorCode: string;
    }>;
  };
}

// Payment service utility functions
export class MyFatoorahService {
  private apiKey: string;
  private baseUrl: string;
  constructor(apiKey: string, baseUrl: string = 'https://apitest.myfatoorah.com') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  private async makeRequest(endpoint: string, method: 'GET' | 'POST', data?: any): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      method,
      headers,
    };

    if (data && method === 'POST') {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`MyFatoorah API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async createInvoice(paymentData: PaymentRequest): Promise<MyFatoorahCreateInvoiceResponse> {
    return this.makeRequest('/v2/SendPayment', 'POST', paymentData);
  }

  async getPaymentStatus(paymentId: string): Promise<MyFatoorahPaymentStatusResponse> {
    return this.makeRequest(`/v2/getPaymentStatus`, 'POST', {
      Key: paymentId,
      KeyType: 'PaymentId'
    });
  }

  async getInvoiceStatus(invoiceId: string): Promise<MyFatoorahPaymentStatusResponse> {
    return this.makeRequest(`/v2/getPaymentStatus`, 'POST', {
      Key: invoiceId,
      KeyType: 'InvoiceId'
    });
  }

  async cancelInvoice(invoiceId: string): Promise<any> {
    return this.makeRequest(`/v2/CancelToken`, 'POST', {
      InvoiceId: invoiceId
    });
  }
}
