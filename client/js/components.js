// ============================================
// TOOLSHARE — Shared UI Components
// ============================================

import { CATEGORIES, CONDITIONS, CURRENT_USER, getConditionInfo, getCategoryIcon, getCategoryLabel, formatCurrency, getInitials, formatDate, logout, toggleWishlist, timeAgo } from './data_v2.js';

// ---------- Toast System ----------
let toastContainer = null;

export function initToasts() {
  if (toastContainer) return;
  toastContainer = document.createElement('div');
  toastContainer.className = 'toast-container';
  toastContainer.id = 'toast-container';
  document.body.appendChild(toastContainer);
}

export function showToast(type, title, message, duration = 4000) {
  initToasts();
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `
    <span class="toast__icon">${icons[type] || 'ℹ️'}</span>
    <div class="toast__content">
      <div class="toast__title">${title}</div>
      ${message ? `<div class="toast__message">${message}</div>` : ''}
    </div>
    <button class="toast__close" onclick="this.parentElement.remove()">✕</button>
  `;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ---------- Navbar ----------
export function renderNavbar(activePage = '') {
  const isLoggedIn = localStorage.getItem('ts_logged_in') === 'true';
  const user = CURRENT_USER;

  // Auto-inject Chatbot UI
  setTimeout(() => {
    if (typeof renderChatbot === 'function') renderChatbot();
    // Dynamically import logic if not present
    if (!window.chatLogicInit) {
        import('./chatbot.js').then(m => {
            m.initChatbotLogic();
            window.chatLogicInit = true;
        });
    }
  }, 500);

  return `
  <header class="nav-pill" id="navbar">
    <a href="index.html" class="nav-logo">
      household tools
    </a>

    <nav class="nav-links-pill">
      <a href="index.html#about" class="nav-link-pill">About Us</a>
      <a href="index.html#how-it-works" class="nav-link-pill">How it Works</a>
      <div class="nav-divider"></div>
      <a href="index.html#pricing" class="nav-link-pill">Pricing</a>
      <a href="browse.html" class="nav-link-pill ${activePage === 'browse' ? 'nav-link-pill--active' : ''}">Browse Tools</a>
    </nav>

    <div class="nav-actions-pill">
      ${isLoggedIn ? `
        <div class="user-dropdown" id="user-dropdown">
          <div class="user-dropdown__trigger" onclick="toggleDropdown()">
            ${renderAvatar(user, 'sm')}
            <span style="font-family:'Oswald',sans-serif; font-weight:700; color:white; font-size:14px; text-transform:uppercase; margin-left:8px; cursor:pointer;">${user.name.split(' ')[0]}</span>
          </div>
          <div class="user-dropdown__menu" id="user-dropdown-menu">
            <div style="padding: 12px 16px; border-bottom: 1px solid var(--color-border); margin-bottom: 4px;">
              <div style="font-weight: 700; font-size: 14px; font-family:'Oswald',sans-serif; text-transform:uppercase;">${user.name}</strong></div>
              <div style="font-size: 12px; color: var(--color-text-3);">${user.email}</div>
            </div>
            <a href="${user.isOwner ? 'owner-dashboard.html' : 'renter-dashboard.html'}" class="user-dropdown__item">📊 Dashboard</a>
            ${user.isOwner ? `<a href="listing-new.html" class="user-dropdown__item">➕ List a Tool</a>` : ''}
            <a href="profile.html?id=${user.id}" class="user-dropdown__item">👤 View Profile</a>
            <div class="user-dropdown__divider"></div>
            <button class="user-dropdown__item" onclick="handleLogout()">🚪 Logout</button>
          </div>
        </div>
      ` : `
        <a href="login.html" class="nav-link-pill" style="color:var(--color-cream-surface); font-weight:700; margin-right: 20px;">LOGIN</a>
        <a href="listing-new.html" class="btn-list-tools">LIST A TOOL</a>
      `}
      <div class="nav-hamburger" id="hamburger" onclick="toggleMobileMenu()">☰</div>
    </div>
  </header>

  <div class="mobile-drawer" id="mobile-drawer">
    <div style="padding: 24px;">
      <div class="nav-logo" style="color:var(--color-dark-text); margin-bottom:32px;">ToolShare</div>
      <a href="index.html" class="mobile-drawer__link ${activePage === 'home' ? 'mobile-drawer__link--active' : ''}">Home</a>
      <a href="browse.html" class="mobile-drawer__link ${activePage === 'browse' ? 'mobile-drawer__link--active' : ''}">Browse Tools</a>
      <a href="listing-new.html" class="mobile-drawer__link ${activePage === 'list' ? 'mobile-drawer__link--active' : ''}">List a Tool</a>
      <div style="border-top: 1px solid var(--color-border); margin: 16px 0; padding-top: 16px;"></div>
      ${!isLoggedIn ? `
        <a href="login.html" class="btn btn--outline btn--full" style="margin-bottom:12px;">Log In</a>
        <a href="register.html" class="btn btn--primary btn--full">Sign Up Free</a>
      ` : `
        <a href="${user.isOwner ? 'owner-dashboard.html' : 'renter-dashboard.html'}" class="mobile-drawer__link">📊 Dashboard</a>
        <a href="profile.html?id=${user.id}" class="mobile-drawer__link">👤 View Profile</a>
        <button class="mobile-drawer__link" style="width:100%;text-align:left;background:none;border:none;" onclick="handleLogout()">🚪 Logout</button>
      `}
    </div>
  </div>`;
}


// ---------- Footer ----------
export function renderFooter() {
  return `
  <footer class="footer">
    <div class="container">
      <div class="footer__grid">
        <div class="footer__brand">
          <div style="display:flex;align-items:center;gap:8px;font-size:1.25rem;font-weight:800;margin-bottom:8px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
            ToolShare
          </div>
          <p>India's #1 peer-to-peer tool rental marketplace. Borrow what you need, earn from what you own.</p>
          <div class="footer__socials">
            <a href="#" class="footer__social" aria-label="Twitter">𝕏</a>
            <a href="#" class="footer__social" aria-label="Instagram">📷</a>
            <a href="#" class="footer__social" aria-label="LinkedIn">in</a>
            <a href="#" class="footer__social" aria-label="WhatsApp">💬</a>
          </div>
        </div>
        <div>
          <div class="footer__heading">Quick Links</div>
          <a href="browse.html" class="footer__link">Browse Tools</a>
          <a href="#" class="footer__link">Safety Center</a>
          <a href="#" class="footer__link">Help & Support</a>
          <a href="#" class="footer__link">Blog</a>
        </div>
        <div>
          <div class="footer__heading">For Owners</div>
          <a href="listing-new.html" class="footer__link">List Your Tool</a>
          <a href="#" class="footer__link">Owner Guide</a>
          <a href="#" class="footer__link">Insurance</a>
          <a href="#" class="footer__link">Pricing Calculator</a>
        </div>
        <div>
          <div class="footer__heading">Stay Updated</div>
          <p style="font-size:0.875rem;color:rgba(255,255,255,0.6);margin-bottom:12px;">Get the latest tools and offers in your inbox.</p>
          <div class="footer__newsletter">
            <input type="email" placeholder="Your email">
            <button class="btn btn--primary btn--sm">→</button>
          </div>
        </div>
      </div>
      <div class="footer__bottom">
        <span>© 2025 ToolShare. All rights reserved.</span>
        <div style="display:flex;gap:24px;">
          <a href="#" style="color:rgba(255,255,255,0.5);">Privacy Policy</a>
          <a href="#" style="color:rgba(255,255,255,0.5);">Terms of Service</a>
        </div>
      </div>
    </div>
  </footer>`;
}

// ---------- Tool Card ----------
export function renderToolCard(tool) {
  const cond = getConditionInfo(tool.condition);
  const isWished = tool.isWished;
  return `
  <a href="tool-detail.html?id=${tool.id}" class="tool-card" data-tool-id="${tool.id}">
    <div class="tool-card__img-wrap">
      <img src="${tool.photos[0]}" alt="${tool.title}" class="tool-card__img" loading="lazy">
      <span class="tool-card__badge badge badge--${cond.color}">${cond.label}</span>
      <button class="tool-card__fav ${isWished ? 'tool-card__fav--active' : ''}" 
              onclick="event.preventDefault();event.stopPropagation();handleToggleWishlist(${tool.id})">
        ${isWished ? '❤️' : '♡'}
      </button>
    </div>
    <div class="tool-card__body">
      <div class="tool-card__category">${getCategoryIcon(tool.category)} ${getCategoryLabel(tool.category)}</div>
      <div class="tool-card__title">${tool.title}</div>
      <div class="tool-card__location">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
        ${tool.city}
      </div>
      <div class="tool-card__footer">
        <div class="tool-card__price">${formatCurrency(tool.pricePerDay)} <span>/ day</span></div>
        <div class="tool-card__owner">
          <div class="stars" style="font-size:12px;">
            ${'★'.repeat(Math.round(tool.rating))}${'☆'.repeat(5 - Math.round(tool.rating))}
            <span class="stars__count">${tool.rating || 'New'}</span>
          </div>
        </div>
      </div>
    </div>
  </a>`;
}

// ---------- Skeleton Tool Card ----------
export function renderSkeletonCard() {
  return `
  <div class="skeleton--card">
    <div class="skeleton skeleton--img"></div>
    <div style="padding: 16px 20px 20px;">
      <div class="skeleton skeleton--text-sm" style="width:40%;margin-bottom:8px;"></div>
      <div class="skeleton skeleton--title"></div>
      <div class="skeleton skeleton--text-sm" style="width:50%;margin-bottom:16px;"></div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:1px solid var(--color-border);">
        <div class="skeleton" style="height:18px;width:80px;"></div>
        <div class="skeleton" style="height:14px;width:50px;"></div>
      </div>
    </div>
  </div>`;
}

// ---------- Star Rating Component ----------
export function renderStars(rating, count = null, size = 'md') {
  const sizes = { sm: '12px', md: '16px', lg: '20px' };
  const full = Math.round(rating);
  let html = `<div class="stars" style="font-size:${sizes[size]}">`;
  html += '<span class="stars__star">★</span>'.repeat(full);
  html += '<span class="stars__star--empty">★</span>'.repeat(5 - full);
  if (count !== null) html += `<span class="stars__count">(${count})</span>`;
  html += '</div>';
  return html;
}

// ---------- Condition Badge ----------
export function renderConditionBadge(condition) {
  const c = getConditionInfo(condition);
  return `<span class="badge badge--${c.color}">${c.label}</span>`;
}

// ---------- Booking Status Pill ----------
export function renderStatusPill(status) {
  const map = {
    PENDING: { color: 'amber', label: '⏳ Pending', },
    APPROVED: { color: 'blue', label: '✅ Approved', },
    CONFIRMED: { color: 'green', label: '💳 Confirmed', },
    RENTED: { color: 'primary', label: '🔧 Rented', },
    COMPLETED: { color: 'grey', label: '✓ Completed', },
    REJECTED: { color: 'red', label: '❌ Rejected', },
    CANCELLED: { color: 'red', label: '✕ Cancelled', },
  };
  const s = map[status] || map.PENDING;
  return `<span class="badge badge--${s.color}">${s.label}</span>`;
}

// ---------- Notification Item ----------
export function renderNotificationItem(n) {
  return `
  <div class="notification-item ${n.isRead ? '' : 'notification-item--unread'}" onclick="${n.link ? `location.href='${n.link}'` : ''}">
    <div class="notification-item__icon">🔔</div>
    <div class="notification-item__content">
      <div class="notification-item__text">${n.content}</div>
      <div class="notification-item__time">${timeAgo(n.createdAt)}</div>
    </div>
    ${!n.isRead ? '<div class="notification-item__dot"></div>' : ''}
  </div>`;
}

// ---------- Avatar ----------
export function renderAvatar(user, size = 'md') {
  if (!user) return `<div class="avatar avatar--${size}">?</div>`;
  if (user.avatar) {
    return `<div class="avatar avatar--${size}" style="background:none;"><img src="${user.avatar}" alt="${user.name}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;"></div>`;
  }
  return `<div class="avatar avatar--${size}" title="${user.name}">${getInitials(user.name)}</div>`;
}

// ---------- Profile Card ----------
export function renderProfileCard(user) {
  return `
  <div class="profile-card">
    <div class="profile-card__header">
      ${renderAvatar(user, 'lg')}
      <div class="profile-card__info">
        <h2 class="profile-card__name">${user.name} ${user.isVerified ? '<span title="Verified User" style="color:var(--color-primary);font-size:18px;">✅</span>' : ''}</h2>
        <div class="profile-card__meta">Member since ${user.memberSince}</div>
      </div>
    </div>
    <div class="profile-card__stats">
      <div class="stat-item">
        <div class="stat-item__value">${user.rating}</div>
        <div class="stat-item__label">Rating (${user.reviewCount})</div>
      </div>
      <div class="stat-item">
        <div class="stat-item__value">${user.rentalsCompleted}</div>
        <div class="stat-item__label">Rentals</div>
      </div>
      <div class="stat-item">
        <div class="stat-item__value">${user.responseRate}%</div>
        <div class="stat-item__label">Response</div>
      </div>
    </div>
    <div class="profile-card__bio">${user.bio}</div>
  </div>`;
}

// ---------- Review Item ----------
export function renderReviewItem(review) {
  return `
  <div class="review-item">
    <div class="review-item__header">
      ${renderAvatar(review.reviewer, 'sm')}
      <div class="review-item__author">
        <div class="review-item__name">${review.reviewer.name}</div>
        <div class="review-item__date">${formatDate(review.createdAt)}</div>
      </div>
      <div class="review-item__rating">
        ${renderStars(review.rating, null, 'sm')}
      </div>
    </div>
    <div class="review-item__text">${review.comment}</div>
  </div>`;
}

// ---------- Price Breakdown ----------
export function renderPriceBreakdown(dailyRate, days, deposit, deliveryFee = 0) {
  const subtotal = dailyRate * days;
  const serviceFee = Math.round(subtotal * 0.1);
  const total = subtotal + deposit + serviceFee + deliveryFee;
  return `
  <div style="background:var(--color-surface);border-radius:var(--radius-xl);padding:20px;">
    <div style="display:flex;justify-content:space-between;margin-bottom:12px;font-size:14px;">
      <span style="color:var(--color-text-3);">${formatCurrency(dailyRate)} × ${days} day${days > 1 ? 's' : ''}</span>
      <span style="font-weight:600;">${formatCurrency(subtotal)}</span>
    </div>
    <div style="display:flex;justify-content:space-between;margin-bottom:12px;font-size:14px;">
      <span style="color:var(--color-text-3);">Security deposit</span>
      <span style="font-weight:600;">${formatCurrency(deposit)}</span>
    </div>
    <div style="display:flex;justify-content:space-between;margin-bottom:12px;font-size:14px;">
      <span style="color:var(--color-text-3);">Service fee (10%)</span>
      <span style="font-weight:600;">${formatCurrency(serviceFee)}</span>
    </div>
    ${deliveryFee > 0 ? `
    <div style="display:flex;justify-content:space-between;margin-bottom:12px;font-size:14px;">
      <span style="color:var(--color-text-3);">Delivery fee</span>
      <span style="font-weight:600;">${formatCurrency(deliveryFee)}</span>
    </div>` : ''}
    <div style="border-top:2px solid var(--color-border);padding-top:12px;display:flex;justify-content:space-between;font-size:16px;">
      <span style="font-weight:700;">Total</span>
      <span style="font-weight:800;color:var(--color-text);">${formatCurrency(total)}</span>
    </div>
  </div>`;
}

// ---------- Category Chip ----------
export function renderCategoryChip(cat, active = false) {
  return `
  <button class="category-chip ${active ? 'category-chip--active' : ''}" data-category="${cat.id}">
    <span class="category-chip__icon">${cat.icon}</span>
    <span class="category-chip__label">${cat.label}</span>
  </button>`;
}

// ---------- Init Navbar Scroll ----------
export function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('navbar--scrolled');
    } else {
      navbar.classList.remove('navbar--scrolled');
    }
  });
}

// ---------- Init Scroll Reveal ----------
export function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal--visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal, .reveal-up').forEach(el => observer.observe(el));
}

// ---------- Global Functions (must be on window) ----------
window.handleToggleWishlist = async function(toolId) {
  try {
    const res = await toggleWishlist(toolId);
    showToast(res.isWished ? 'success' : 'info', res.message, '');
    // Refresh page or update UI manually
    setTimeout(() => location.reload(), 500);
  } catch (error) {
    showToast('error', 'Action failed', error.message);
  }
};

window.toggleDropdown = function() {
  const menu = document.getElementById('user-dropdown-menu');
  if (menu) menu.classList.toggle('user-dropdown__menu--open');
};

window.toggleMobileMenu = function() {
  const drawer = document.getElementById('mobile-drawer');
  const hamburger = document.getElementById('hamburger');
  if (drawer) drawer.classList.toggle('mobile-drawer--open');
  if (hamburger) hamburger.classList.toggle('navbar__hamburger--active');
};

window.handleLogout = async function() {
  try {
    await logout();
    showToast('success', 'Logged out', 'See you next time!');
    setTimeout(() => window.location.href = 'index.html', 800);
  } catch (error) {
    showToast('error', 'Logout failed', error.message);
  }
};

// Close dropdown on outside click
document.addEventListener('click', (e) => {
  const dropdown = document.getElementById('user-dropdown');
  const menu = document.getElementById('user-dropdown-menu');
  if (dropdown && menu && !dropdown.contains(e.target)) {
    menu.classList.remove('user-dropdown__menu--open');
  }
});

// ---------- Smart Assistant (Chatbot) ----------
export function renderChatbot() {
  if (document.querySelector('.chat-float')) return;

  const html = `
  <div class="chat-float">
    <div class="chat-window" id="chat-window">
      <div class="chat-header">
        <div class="chat-title">AI Shop Assistant</div>
        <div style="font-size:12px;opacity:0.8;">Online • Visual Search Active</div>
      </div>
      <div class="chat-history" id="chat-history">
        <div class="chat-msg chat-msg--bot">
          Hi! I'm your ToolShare Assistant. Need help finding tools? 
          <br><br>
          <b>New Feature:</b> Upload a photo of a tool, and I'll find similar ones for you!
        </div>
      </div>
      <div id="chat-image-preview-container" style="display:none; padding:10px; border-top:1px solid var(--color-border); background:#f9f9f9; position:relative;">
          <img id="chat-image-preview" src="" style="max-height:80px; border-radius:8px; display:block; margin:0 auto;">
          <button id="chat-image-remove" style="position:absolute; top:5px; right:10px; background:rgba(0,0,0,0.5); color:white; border-radius:50%; width:20px; height:20px; font-size:12px; display:flex; align-items:center; justify-content:center;">✕</button>
      </div>
      <div class="chat-input-area">
        <input type="file" id="chat-image-input" accept="image/*" style="display:none;">
        <button class="btn btn--icon" id="chat-upload-btn" title="Upload image for visual search" style="background:#f0f0f0; border-radius:50%; width:36px; height:36px; flex-shrink:0;">📷</button>
        <input type="text" class="chat-input" id="chat-input" placeholder="Ask about tools or upload a photo...">
        <button class="btn btn--primary btn--icon" id="chat-send-btn" style="width:36px;height:36px;flex-shrink:0;">→</button>
      </div>
    </div>
    <div class="chat-bubble" onclick="toggleChat()">
      🤖
    </div>
  </div>`;
  
  document.body.insertAdjacentHTML('beforeend', html);
}

window.toggleChat = function() {
  const win = document.getElementById('chat-window');
  if (win) win.classList.toggle('chat-window--open');
};
