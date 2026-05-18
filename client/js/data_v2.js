// ============================================
// TOOLSHARE — Backend Integration
// ============================================

// Polyfill for performance.clearMarks if not available
if (typeof performance !== 'undefined' && !performance.clearMarks) {
  performance.clearMarks = function() {};
}

export let CURRENT_USER = (() => {
    try {
        const user = localStorage.getItem('ts_user');
        return user ? JSON.parse(user) : null;
    } catch (e) {
        console.warn('Failed to parse user from localStorage', e);
        return null;
    }
})();

export const CATEGORIES = [
  { id: 'POWER_TOOLS',      label: 'Power Tools',       icon: '⚡', count: 2847 },
  { id: 'HAND_TOOLS',       label: 'Hand Tools',        icon: '🔨', count: 1923 },
  { id: 'GARDEN',           label: 'Garden & Outdoor',  icon: '🌿', count: 1456 },
  { id: 'HEAVY_EQUIPMENT',  label: 'Heavy Equipment',   icon: '🏗️', count: 892  },
  { id: 'WOODWORKING',      label: 'Woodworking',       icon: '🪵', count: 654  },
  { id: 'CLEANING',         label: 'Cleaning',          icon: '🧹', count: 432  },
];

export const CONDITIONS = [
  { id: 'BRAND_NEW',  label: 'Brand New',  color: 'green',  desc: 'Unused in original packaging' },
  { id: 'LIKE_NEW',   label: 'Like New',   color: 'blue',   desc: 'Minimal use, perfect condition' },
  { id: 'GOOD',       label: 'Good',       color: 'grey',   desc: 'Used, showing minor wear' },
  { id: 'FAIR',       label: 'Fair',       color: 'amber',  desc: 'Functional, visible wear' }
];

const hostname = window.location.hostname || '127.0.0.1';
// In production, we expect the frontend to be served from Vercel/Netlify, 
// and the backend from Render. We use an environment check or just hardcode the Render URL if available.
// For this setup, we'll check if we are on localhost; if not, we assume production.
// IMPORTANT: Replace 'your-render-app-url.onrender.com' with the actual Render URL after deploying!
export const API_BASE = (hostname === '127.0.0.1' || hostname === 'localhost') 
    ? `http://${hostname}:8000/api` 
    : `https://your-render-app-url.onrender.com/api`;

// Helper for API calls
export async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  if (CURRENT_USER && CURRENT_USER.email) {
    headers['X-User-Email'] = CURRENT_USER.email;
  } else {
    try {
      const stored = localStorage.getItem('ts_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.email) headers['X-User-Email'] = parsed.email;
      }
    } catch(e){}
  }

  const defaultOptions = {
    credentials: 'include',
    ...options,
    headers
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    // Read body as text first for diagnostics
    const text = await response.text();
    let data;

    // Handle empty responses
    if (!text || text.trim() === '') {
        if (!response.ok) {
            throw new Error(`Empty response from server (Status: ${response.status})`);
        }
        return {}; // OK empty response
    }

    // Try to parse JSON
    try {
        data = JSON.parse(text);
    } catch (e) {
        console.error('Failed to parse JSON:', text);
        const snippet = text.substring(0, 100).replace(/</g, '&lt;');
        throw new Error(`Server returned invalid JSON. Snippet: "${snippet}..."`);
    }

    if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
    }
    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      console.error('Network error or server unreachable:', error);
      throw new Error('Could not connect to the server at http://127.0.0.1:8000. Please ensure the Django backend is running.');
    }
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

// Reactive data (initially empty, filled on demand)
export let USERS = [];
export let TOOLS = [];
export let BOOKINGS = [];
export let REVIEWS = [];
export let MESSAGES = [];


export async function checkAuth() {
    try {
        // Prevent aggressive browser caching of auth state
        const data = await apiFetch('/auth/check/', { cache: 'no-store' });
        if (data.isLoggedIn) {
            CURRENT_USER = data.user;
            localStorage.setItem('ts_user', JSON.stringify(data.user));
            localStorage.setItem('ts_logged_in', 'true');
        } else {
            CURRENT_USER = null;
            localStorage.removeItem('ts_user');
            localStorage.setItem('ts_logged_in', 'false');
        }
        return data.isLoggedIn;
    } catch (e) {
        console.warn('Auth check failed:', e);
        return false;
    }
}

export async function fetchTools(params = {}) {
    const query = new URLSearchParams(params).toString();
    const data = await apiFetch(`/tools/?${query}`);
    TOOLS = data.tools;
    return TOOLS;
}

export async function fetchBookings() {
    const data = await apiFetch('/bookings/');
    BOOKINGS = data.bookings;
    return BOOKINGS;
}

export async function login(email, password) {
    const data = await apiFetch('/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
    CURRENT_USER = data.user;
    localStorage.setItem('ts_user', JSON.stringify(data.user));
    localStorage.setItem('ts_logged_in', 'true');
    return data;
}

export async function register(userData) {
    const data = await apiFetch('/auth/register/', {
        method: 'POST',
        body: JSON.stringify(userData)
    });
    CURRENT_USER = data.user;
    localStorage.setItem('ts_user', JSON.stringify(data.user));
    localStorage.setItem('ts_logged_in', 'true');
    return data;
}

export async function fetchToolDetail(id) {
    const data = await apiFetch(`/tools/${id}/`);
    return data;
}

export async function createBooking(bookingData) {
    const data = await apiFetch('/bookings/create/', {
        method: 'POST',
        body: JSON.stringify(bookingData)
    });
    return data;
}

export async function addTool(toolData) {
    const data = await apiFetch('/tools/create/', {
        method: 'POST',
        body: JSON.stringify(toolData)
    });
    return data;
}

export async function updateTool(id, toolData) {
    const data = await apiFetch(`/tools/${id}/update/`, {
        method: 'POST', // Django CSRF handling is easier with POST + @csrf_exempt
        body: JSON.stringify(toolData)
    });
    return data;
}

export async function logout() {
    await apiFetch('/auth/logout/', { method: 'POST' });
    CURRENT_USER = null;
    localStorage.removeItem('ts_user');
    localStorage.setItem('ts_logged_in', 'false');
}

// Wishlist
export async function toggleWishlist(toolId) {
    return await apiFetch(`/wishlist/toggle/${toolId}/`, { method: 'POST' });
}

export async function fetchWishlist() {
    const data = await apiFetch('/wishlist/');
    return data.tools;
}

// Booking Lifecycle
export async function updateBookingStatus(id, status, extra = {}) {
    return await apiFetch(`/bookings/${id}/status/`, {
        method: 'POST',
        body: JSON.stringify({ status, ...extra })
    });
}

export async function requestRent(toolId, message, startDate, endDate) {
    return await apiFetch(`/bookings/create/`, {
        method: 'POST',
        body: JSON.stringify({ tool_id: toolId, initial_msg: message, startDate, endDate })
    });
}

export async function confirmDeposit(bookingId) {
    return await apiFetch(`/bookings/${bookingId}/confirm-deposit/`, { method: 'POST' });
}

export async function finalizeReturn(bookingId) {
    return await apiFetch(`/bookings/${bookingId}/return/`, { method: 'POST' });
}

export async function payBalance(bookingId) {
    return await apiFetch(`/bookings/${bookingId}/pay-balance/`, { method: 'POST' });
}

export async function getOwnerStats() {
    return await apiFetch(`/owner-stats/`);
}

// Messages
export async function fetchMessages(bookingId) {
    const data = await apiFetch(`/bookings/${bookingId}/messages/`);
    return data.messages;
}

export async function sendMessage(bookingId, content) {
    return await apiFetch(`/bookings/${bookingId}/messages/`, {
        method: 'POST',
        body: JSON.stringify({ content })
    });
}

// Notifications
export async function fetchNotifications() {
    const data = await apiFetch('/notifications/');
    return data.notifications;
}

// Helper functions (Pure UI)
export function getCategoryLabel(id) {
  return CATEGORIES.find(c => c.id === id)?.label || id;
}

export function getCategoryIcon(id) {
  return CATEGORIES.find(c => c.id === id)?.icon || '🔧';
}

export function getConditionInfo(id) {
  return CONDITIONS.find(c => c.id === id) || CONDITIONS[2];
}

export function formatCurrency(amount) {
  return '₹' + parseInt(amount).toLocaleString('en-IN');
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

export function getInitials(name) {
  if (!name) return '??';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7)  return `${days} days ago`;
  if (days < 30) return `${Math.floor(days/7)} weeks ago`;
  return `${Math.floor(days/30)} months ago`;
}
export async function signAgreement(bookingId) {
    return await apiFetch(`/bookings/${bookingId}/sign-agreement/`, { method: 'POST' });
}

export function getContractUrl(bookingId) {
    return `${API_BASE}/bookings/${bookingId}/contract/`;
}
