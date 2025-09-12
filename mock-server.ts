import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data
const mockProperties = [
  {
    id: 1,
    title: "Luxury Villa in Riyadh North",
    description: "Beautiful 3-bedroom villa with private pool and garden",
    location: "Riyadh North, Saudi Arabia",
    price_per_night: 450,
    max_guests: 6,
    bedrooms: 3,
    bathrooms: 2,
    is_featured: true,
    is_active: true,
    images: ["/api/placeholder/400/300"],
    amenities: ["Pool", "Garden", "WiFi", "Air Conditioning", "Kitchen"],
    created_at: "2024-01-15T10:00:00Z"
  },
  {
    id: 2,
    title: "Modern Apartment Downtown",
    description: "Stylish 2-bedroom apartment in the heart of Riyadh",
    location: "Downtown Riyadh, Saudi Arabia",
    price_per_night: 280,
    max_guests: 4,
    bedrooms: 2,
    bathrooms: 1,
    is_featured: true,
    is_active: true,
    images: ["/api/placeholder/400/300"],
    amenities: ["WiFi", "Air Conditioning", "Kitchen", "Elevator", "Parking"],
    created_at: "2024-01-16T14:30:00Z"
  },
  {
    id: 3,
    title: "Cozy Studio Near KAFD",
    description: "Perfect studio apartment near King Abdullah Financial District",
    location: "KAFD, Riyadh, Saudi Arabia",
    price_per_night: 180,
    max_guests: 2,
    bedrooms: 1,
    bathrooms: 1,
    is_featured: false,
    is_active: true,
    images: ["/api/placeholder/400/300"],
    amenities: ["WiFi", "Air Conditioning", "Kitchen", "Gym Access"],
    created_at: "2024-01-17T09:15:00Z"
  }
];

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: { status: 'healthy', timestamp: new Date().toISOString() }
  });
});

app.get('/api/properties', (req, res) => {
  const { location, min_price, max_price, guests, page = 1, limit = 20 } = req.query;
  
  let filteredProperties = [...mockProperties];
  
  // Apply filters
  if (location) {
    filteredProperties = filteredProperties.filter(p => 
      p.location.toLowerCase().includes((location as string).toLowerCase())
    );
  }
  
  if (min_price) {
    filteredProperties = filteredProperties.filter(p => 
      p.price_per_night >= parseInt(min_price as string)
    );
  }
  
  if (max_price) {
    filteredProperties = filteredProperties.filter(p => 
      p.price_per_night <= parseInt(max_price as string)
    );
  }
  
  if (guests) {
    filteredProperties = filteredProperties.filter(p => 
      p.max_guests >= parseInt(guests as string)
    );
  }
  
  // Pagination
  const startIndex = (parseInt(page as string) - 1) * parseInt(limit as string);
  const endIndex = startIndex + parseInt(limit as string);
  const paginatedProperties = filteredProperties.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    data: paginatedProperties,
    pagination: {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      total: filteredProperties.length,
      totalPages: Math.ceil(filteredProperties.length / parseInt(limit as string))
    }
  });
});

app.get('/api/properties/featured', (req, res) => {
  const featuredProperties = mockProperties.filter(p => p.is_featured);
  res.json({
    success: true,
    data: featuredProperties
  });
});

app.get('/api/properties/:id', (req, res) => {
  const { id } = req.params;
  const property = mockProperties.find(p => p.id === parseInt(id));
  
  if (!property) {
    return res.status(404).json({
      success: false,
      error: "Property not found"
    });
  }
  
  res.json({
    success: true,
    data: {
      ...property,
      reviews: [
        {
          id: 1,
          user_id: "guest-1",
          reviewer_name: "Jane Guest",
          rating: 5,
          comment: "Amazing stay! The property was exactly as described and the host was very responsive.",
          created_at: "2024-01-10T15:30:00Z"
        }
      ]
    }
  });
});

app.post('/api/chat', (req, res) => {
  const { message } = req.body;
  
  // Simple chatbot responses
  let response = "Hello! I'm Sara, your AI assistant for HabibiStay. How can I help you today?";
  
  if (message.toLowerCase().includes('property') || message.toLowerCase().includes('accommodation')) {
    response = "I'd be happy to help you find the perfect property! We have luxury villas, modern apartments, and cozy studios in Riyadh. What type of accommodation are you looking for?";
  } else if (message.toLowerCase().includes('booking') || message.toLowerCase().includes('book')) {
    response = "Great! To help you with booking, I'll need to know your check-in and check-out dates, number of guests, and any specific preferences you have.";
  } else if (message.toLowerCase().includes('price') || message.toLowerCase().includes('cost')) {
    response = "Our properties range from 180 SAR to 450 SAR per night, depending on the location and amenities. Would you like me to show you properties within a specific price range?";
  }
  
  res.json({
    success: true,
    data: { message: response }
  });
});

app.post('/api/bookings', (req, res) => {
  const bookingData = req.body;
  
  // Mock booking creation
  const bookingId = `HBS${Date.now().toString().slice(-8)}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  
  res.json({
    success: true,
    data: {
      booking_id: bookingId,
      total_amount: 450 * 3, // Mock calculation
      status: 'pending',
      message: 'Booking created successfully'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('- GET /api/health');
  console.log('- GET /api/properties');
  console.log('- GET /api/properties/featured');
  console.log('- GET /api/properties/:id');
  console.log('- POST /api/chat');
  console.log('- POST /api/bookings');
});

export default app;