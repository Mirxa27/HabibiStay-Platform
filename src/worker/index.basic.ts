export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    // Health check endpoint
    if (url.pathname === '/api/health') {
      return new Response(JSON.stringify({ 
        success: true, 
        data: { status: 'healthy', timestamp: new Date().toISOString() } 
      }), {
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        }
      });
    }
    
    // Properties endpoint
    if (url.pathname === '/api/properties') {
      try {
        const { results } = await env.DB.prepare(
          "SELECT * FROM properties WHERE is_active = 1 ORDER BY created_at DESC LIMIT 20"
        ).all();
        
        return new Response(JSON.stringify({
          success: true,
          data: results,
        }), {
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({
          success: false,
          error: "Failed to fetch properties",
        }), {
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        });
      }
    }
    
    // Featured properties endpoint
    if (url.pathname === '/api/properties/featured') {
      try {
        const { results } = await env.DB.prepare(
          "SELECT * FROM properties WHERE is_featured = 1 AND is_active = 1 ORDER BY created_at DESC LIMIT 2"
        ).all();
        
        return new Response(JSON.stringify({
          success: true,
          data: results,
        }), {
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({
          success: false,
          error: "Failed to fetch featured properties",
        }), {
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        });
      }
    }
    
    // Basic chat endpoint
    if (url.pathname === '/api/chat' && request.method === 'POST') {
      try {
        const body = await request.json() as any;
        const message = body.message || '';
        
        return new Response(JSON.stringify({
          success: true,
          data: { 
            message: `Hello! You said: "${message}". I'm Sara, your AI assistant for HabibiStay. How can I help you find the perfect accommodation?`
          },
        }), {
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({
          success: false,
          error: "Failed to process chat message",
        }), {
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        });
      }
    }
    
    // Serve static files or SPA fallback
    return new Response(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <link rel="icon" type="image/svg+xml" href="/vite.svg" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>HabibiStay</title>
        </head>
        <body>
          <div id="root"></div>
          <script>
            console.log('HabibiStay API Server Running');
            window.location.href = 'http://localhost:5173';
          </script>
        </body>
      </html>
    `, {
      headers: { 
        'Content-Type': 'text/html',
        ...corsHeaders 
      }
    });
  },
};