import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BookingService } from '../server/services/BookingService';

// Minimal local type to satisfy tests (avoid coupling to server/db typings)
type Database = any;

// Minimal mocks for dependencies
const makeMockDb = () => {
  const rows: Record<string, any[]> = {};
  return {
    get: vi.fn(async (sql: string, params?: any[]) => {
      // Very small parser for the few queries used in tests
      if (sql.includes('FROM properties WHERE id = ?')) {
        const id = params?.[0];
        return rows['properties']?.find((r: any) => r.id === id) || null;
      }
      return null;
    }),
    all: vi.fn(async () => ([])),
    run: vi.fn(async () => ({ success: true, meta: { last_row_id: 1 } })),
    prepare: vi.fn(() => ({ bind: vi.fn(() => ({ run: vi.fn(async () => ({ success: true, meta: { last_row_id: 1 } })), first: vi.fn(async () => null), all: vi.fn(async () => ({ results: [] })) })) })),
    // expose internal storage for test setup
    __rows: rows,
  } as unknown as Database;
};

const makePaymentServiceMock = () => ({
  processRefund: vi.fn(async () => ({})),
});

const makeEmailServiceMock = () => ({
  sendBookingConfirmation: vi.fn(async () => true),
  sendBookingStatusUpdate: vi.fn(async () => true),
  sendBookingCancellation: vi.fn(async () => true),
});

const makePricingServiceMock = () => ({
  getPropertyPrice: vi.fn(async (propertyId: number) => {
    // return undefined to let BookingService use property.price_per_night
    return undefined;
  }),
});

describe('BookingService - unit tests', () => {
  let db: ReturnType<typeof makeMockDb>;
  let bookingService: BookingService;
  let paymentService: ReturnType<typeof makePaymentServiceMock>;
  let emailService: ReturnType<typeof makeEmailServiceMock>;
  let pricingService: ReturnType<typeof makePricingServiceMock>;

  beforeEach(() => {
    db = makeMockDb();
    // seed a property row used by tests
    db.__rows['properties'] = [
      {
        id: 42,
        price_per_night: 500,
        max_guests: 4,
      }
    ];

    paymentService = makePaymentServiceMock();
    emailService = makeEmailServiceMock();
    pricingService = makePricingServiceMock();

    bookingService = new BookingService(db as unknown as Database, paymentService as any, emailService as any, pricingService as any);
  });

  it('calculates price correctly for short stay with no discounts', async () => {
    const result = await bookingService.calculateBookingPrice(42, '2025-09-01', '2025-09-04', 2);
    // 3 nights * 500 = 1500
    expect(result.nights).toBe(3);
    expect(result.basePrice).toBe(500);
    expect(result.subtotal).toBe(1500);
    // serviceFee 12% in BookingService implementation
    expect(result.serviceFee).toBe(Math.round(1500 * 0.12));
    // taxes 15% applied on subtotal + serviceFee
    const expectedTaxes = Math.round((1500 + Math.round(1500 * 0.12)) * 0.15);
    expect(result.taxes).toBe(expectedTaxes);
    const expectedTotal = 1500 + Math.round(1500 * 0.12) + expectedTaxes - 0;
    expect(result.totalAmount).toBe(expectedTotal);
  });

  it('applies weekly discount for 7+ nights', async () => {
    // mock property price remains 500
    const res = await bookingService.calculateBookingPrice(42, '2025-09-01', '2025-09-08', 2); // 7 nights
    expect(res.nights).toBe(7);
    // there should be at least one discount of type 'weekly'
    expect(res.breakdown.discounts.some((d: any) => d.type === 'weekly')).toBe(true);
  });

  it('throws when property not found', async () => {
    await expect(bookingService.calculateBookingPrice(9999, '2025-09-01', '2025-09-03', 1)).rejects.toThrow('Property not found');
  });
});
