/**
 * HabibiStay Browser Authentication Helper
 * 
 * Copy and paste this script into your browser's developer console
 * to authenticate as an admin user for testing.
 * 
 * Instructions:
 * 1. Open your browser and navigate to http://localhost:8787
 * 2. Open Developer Tools (F12)
 * 3. Go to Console tab
 * 4. Copy and paste this entire script
 * 5. Press Enter to execute
 * 6. Refresh the page
 */

// Admin authentication data
const adminAuth = {
  user: {
    id: 'admin-test-12345',
    email: 'admin@habibistay.com',
    name: 'HabibiStay Admin',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&h=300',
    phone: '+966-55-0800-669',
    is_verified: true,
    is_active: true,
    google_user_data: {
      name: 'HabibiStay Admin',
      email: 'admin@habibistay.com',
      picture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&h=300'
    }
  },
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbi10ZXN0LTEyMzQ1IiwiZW1haWwiOiJhZG1pbkBoYWJpYmlzdGF5LmNvbSIsIm5hbWUiOiJIYWJpYmlTdGF5IEFkbWluIiwicm9sZSI6ImFkbWluIiwic2Vzc2lvbklkIjoiYmE0ZDQ0MDg4NzkzNjEwNDcwMDgxNGQyYTFiYjkzMWYiLCJpYXQiOjE3NTY1MzQ5OTksImV4cCI6MTc1NjYyMTM5OSwiaXNzIjoiaGFiaWJpc3RheSIsImF1ZCI6ImhhYmliaXN0YXktYXBwIn0.9qJpUVYpJmaCsDOdaU9ugv7SxjAJan4LMgXHdB5heGs',
  refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbi10ZXN0LTEyMzQ1Iiwic2Vzc2lvbklkIjoiYWYzNDYxYTc2OWM2Y2VmYjk5YjdjMmY1ZjQ5M2I3NjYiLCJ0b2tlblZlcnNpb24iOjEsImlhdCI6MTc1NjUzNDk5OSwiZXhwIjoxNzU5MTI2OTk5LCJpc3MiOiJoYWJpYmlzdGF5IiwiYXVkIjoiaGFiaWJpc3RheS1yZWZyZXNoIn0.wcZNVrHtixe2OVLWXfM9akGI7SpTUrlszUCXz1-pq_U',
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
};

// Alternative test accounts
const testAccounts = {
  admin: {
    email: 'admin@habibistay.com',
    role: 'admin',
    name: 'HabibiStay Admin'
  },
  owner: {
    email: 'owner@habibistay.com', 
    role: 'admin',
    name: 'Property Owner Admin'
  },
  host: {
    email: 'host@habibistay.com',
    role: 'host', 
    name: 'Test Property Host'
  },
  guest: {
    email: 'guest@habibistay.com',
    role: 'guest',
    name: 'Test Guest User'
  }
};

// Function to authenticate
function authenticateAsAdmin() {
  try {
    // Store authentication data in localStorage
    localStorage.setItem('auth_token', adminAuth.token);
    localStorage.setItem('refresh_token', adminAuth.refreshToken);
    localStorage.setItem('auth_user', JSON.stringify(adminAuth.user));
    localStorage.setItem('auth_expires_at', adminAuth.expiresAt);
    
    // Also try sessionStorage for compatibility
    sessionStorage.setItem('auth_token', adminAuth.token);
    sessionStorage.setItem('auth_user', JSON.stringify(adminAuth.user));
    
    console.log('✅ Successfully authenticated as admin!');
    console.log('👤 User:', adminAuth.user.name, '(' + adminAuth.user.email + ')');
    console.log('🔑 Role:', adminAuth.user.role);
    console.log('⏰ Token expires:', new Date(adminAuth.expiresAt).toLocaleString());
    console.log('');
    console.log('🚀 Ready to test! Try accessing:');
    console.log('   • http://localhost:8787/admin/dashboard - Admin Dashboard');
    console.log('   • http://localhost:8787/dashboard - User Dashboard'); 
    console.log('   • http://localhost:8787/properties - Properties Management');
    console.log('');
    console.log('💡 Refresh the page to see the changes!');
    
    return true;
  } catch (error) {
    console.error('❌ Authentication failed:', error);
    return false;
  }
}

// Function to check current authentication
function checkAuth() {
  const token = localStorage.getItem('auth_token');
  const user = localStorage.getItem('auth_user');
  
  if (token && user) {
    const userData = JSON.parse(user);
    console.log('✅ Currently authenticated as:', userData.name, '(' + userData.email + ')');
    console.log('🔑 Role:', userData.role);
    return userData;
  } else {
    console.log('❌ Not authenticated');
    return null;
  }
}

// Function to logout
function logout() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('auth_user');
  localStorage.removeItem('auth_expires_at');
  sessionStorage.clear();
  console.log('✅ Logged out successfully!');
}

// Function to test API access
async function testAdminAPI() {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    console.log('❌ No auth token found. Run authenticateAsAdmin() first.');
    return;
  }
  
  try {
    console.log('🧪 Testing admin API access...');
    
    const response = await fetch('/api/admin/stats', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Admin API access successful!');
      console.log('📊 Stats:', data);
    } else {
      console.log('❌ Admin API access failed:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('❌ API test error:', error);
  }
}

// Auto-execute authentication
console.log('🔐 HabibiStay Admin Authentication Helper');
console.log('=====================================');
console.log('');
authenticateAsAdmin();

// Make functions available globally
window.habibistayAuth = {
  authenticateAsAdmin,
  checkAuth,
  logout,
  testAdminAPI,
  testAccounts
};

console.log('');
console.log('🛠️  Available functions:');
console.log('   • habibistayAuth.checkAuth() - Check current authentication');
console.log('   • habibistayAuth.logout() - Logout current user');
console.log('   • habibistayAuth.testAdminAPI() - Test admin API access');
console.log('   • habibistayAuth.authenticateAsAdmin() - Re-authenticate as admin');