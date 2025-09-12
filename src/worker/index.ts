import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use("*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
}));

// Health check endpoint
app.get("/api/health", async (c) => {
  return c.json({
    success: true,
    message: "HabibiStay API is running (minimal version)",
    timestamp: new Date().toISOString(),
  });
});

// Simple properties endpoint
app.get("/api/properties", async (c) => {
  // Mock data for testing
  const mockProperties = [
    {
      id: 1,
      title: "Luxury Riyadh Apartment",
      location: "Riyadh, Saudi Arabia",
      price_per_night: 450,
      max_guests: 4,
      bedrooms: 2,
      bathrooms: 2,
      amenities: ["wifi", "pool", "parking"],
      images: ["https://via.placeholder.com/400x300?text=Riyadh+Apt"],
      is_featured: true,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      title: "Cozy Jeddah Villa",
      location: "Jeddah, Saudi Arabia",
      price_per_night: 750,
      max_guests: 6,
      bedrooms: 3,
      bathrooms: 3,
      amenities: ["beach", "garden", "wifi"],
      images: ["https://via.placeholder.com/400x300?text=Jeddah+Villa"],
      is_featured: false,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  return c.json({
    success: true,
    data: mockProperties,
    pagination: {
      page: 1,
      limit: 20,
      total: mockProperties.length,
      totalPages: 1,
    },
  });
});

// Simple booking endpoint
app.post("/api/bookings", async (c) => {
  const data = await c.req.json();

  // Basic validation
  if (!data.property_id || !data.check_in_date || !data.check_out_date) {
    return c.json({
      success: false,
      error: "Missing required fields: property_id, check_in_date, check_out_date",
    }, 400);
  }

  // Mock booking creation
  const bookingId = `HBS${Date.now().toString().slice(-8)}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

  return c.json({
    success: true,
    data: {
      booking_id: bookingId,
      total_amount: 1800, // Mock amount
      status: 'pending',
      property_title: 'Mock Property',
      next_step: {
        action: 'payment_required',
        payment_endpoint: '/api/payments/create',
        payment_data: {
          bookingId: bookingId,
          amount: 1800,
          currency: 'SAR',
          description: `Booking for Mock Property`,
          available_providers: ['myfatoorah', 'paypal']
        }
      }
    },
  });
});

// Simple payment endpoint
app.post("/api/payments/create", async (c) => {
  const body = await c.req.json();

  if (!body.bookingId || !body.amount) {
    return c.json({
      success: false,
      error: 'Missing required payment information'
    }, 400);
  }

  // Mock payment creation
  return c.json({
    success: true,
    data: {
      payment_id: `PAY${Date.now()}`,
      payment_url: 'https://test.myfatoorah.com/payment', // Mock URL
      transaction_id: `TXN${Date.now()}`,
      status: 'pending',
      provider: 'myfatoorah'
    },
    error: null
  });
});

// Simple chat endpoint
app.post("/api/chat", async (c) => {
  const { message } = await c.req.json();

  if (!message) {
    return c.json({
      success: false,
      error: "Message is required",
    }, 400);
  }

  // Mock AI response
  const responses = [
    "I'd be happy to help you find the perfect stay in Riyadh!",
    "Our luxury apartments offer the best amenities for your comfort.",
    "Let me check availability for your preferred dates.",
    "We have several properties that match your criteria.",
  ];

  const randomResponse = responses[Math.floor(Math.random() * responses.length)];

  return c.json({
    success: true,
    data: { message: randomResponse },
  });
});

// Admin stats endpoint
app.get("/api/admin/stats", async (c) => {
  // Mock admin stats
  const stats = {
    total_users: 150,
    total_properties: 25,
    active_properties: 20,
    total_bookings: 45,
    pending_bookings: 5,
    total_revenue: 67500,
    monthly_growth: 12,
    occupancy_rate: 85,
  };

  return c.json({
    success: true,
    data: stats,
  });
});

export default {
  fetch: app.fetch,
};
