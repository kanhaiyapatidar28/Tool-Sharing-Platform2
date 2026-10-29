# ToolShare India — Peer-to-Peer Tool Rental Marketplace

ToolShare is a peer-to-peer equipment and tool-sharing platform connecting local tool owners with verified borrowers across Indian cities (Mumbai, Pune, Bengaluru, Delhi, and more).

Live Application: [https://tool-sharing-platform.vercel.app/](https://tool-sharing-platform.vercel.app/)  
GitHub Repository: [https://github.com/kanhaiyapatidar28/Tool-Sharing-Platform2](https://github.com/kanhaiyapatidar28/Tool-Sharing-Platform2)

---

## Key Features

### 1. Robust Server-Authoritative Authentication & Role Verification
- **Dual Role Architecture:** Users register and authenticate as either an **Owner** or a **Borrower**.
- **Server-Enforced Role Consistency:** Roles are stored in trusted server-side MongoDB records. During login, the system strictly validates that the UI-selected role matches the user's registered role in the database; role mismatches are immediately rejected with **HTTP 403 Forbidden**.
- **HttpOnly Signed Session Cookies:** Sessions use HMAC-SHA256 signed tokens stored in `HttpOnly`, `SameSite=Lax`, and `Secure` cookies. No sensitive auth state is trusted from unverified client `localStorage`.
- **Role-Based Redirects:** Successful login automatically routes Owners to `/owner/dashboard` and Borrowers to `/borrower/dashboard`.

### 2. Dynamic Role-Based Navbar & UI
- **Owner Navigation:** Dashboard (`/owner/dashboard`), My Tool Fleet (`/owner/tools`), Add Tool (`/owner/tools/new`), Incoming Bookings (`/owner/bookings`), and Profile (`/profile`).
- **Borrower Navigation:** Dashboard (`/borrower/dashboard`), Explore Marketplace (`/borrower/explore`), My Rentals (`/borrower/bookings`), and Profile (`/profile`).
- **Public Navigation:** Home (`/`), Explore Tools (`/browse`), Sign In (`/login`), and Register (`/register`).
- **Real-Time Role Awareness:** Dynamic profile menu with instant sign-out, session restoration, and loading skeletons.

### 3. Owner Tool Fleet Management
- **Full Listing Lifecycle:** Create, preview, edit, publish/unpublish, and delete tools.
- **Form Controls:** Tool title, detailed description, category classification, multi-photo preview with presets and uploads, equipment condition, daily rental rate (₹), refundable security deposit (₹), pickup neighborhood, and availability toggles.
- **Server Ownership Protection:** `ownerId` and `ownerEmail` are derived exclusively from the authenticated session, preventing IDOR/BOLA attacks.
- **Real-Time Fleet Analytics:** Total active listings, live rental count, and earnings metrics computed from live database bookings.
- **Equipment QR Tag Generation:** Printable hardware tags for every published tool.

### 4. Borrower Experience & Rental Workflow
- **Marketplace Browsing:** Real-time search, city filtering, category selection, price sliders, and sorting options.
- **Rental Calculation Engine:** Server-authoritative calculation of duration, base rate, transparent 5% marketplace platform fee, and refundable security deposit.
- **Self-Rental Prevention:** Tool owners cannot book their own listings (enforced on both UI and server API).
- **Concurrency & Double-Booking Protection:** Atomic date-interval overlap checks prevent double-booking of equipment across conflicting date ranges.

### 5. Physical QR Code Integration & Public Scan Page (`/scan/[publicId]`)
- **Direct Mobile Camera Scan:** Generates QR codes pointing to `${APP_URL}/scan/[publicId]`. Any smartphone camera opens the page in the browser **without requiring an app download**.
- **Cryptographic Identifier:** Tools are assigned a cryptographically random, unguessable `publicId` (e.g. `tool_a1b2c3d4e5f6`).
- **Zero-PII Public Resolver:** The `/api/tools/scan/[publicId]` endpoint returns sanitized public data: photos, specifications, pickup area, and owner first name/rating. Private email addresses, phone numbers, exact residential street addresses, and internal database IDs are strictly stripped.
- **Handover Security Protocol:** Prominently alerts borrowers that scanning the QR tag is for equipment inspection and identity confirmation; physical handover strictly requires an approved reservation and mutual inspection confirmation.
- **Printable Equipment Sticker Layout:** One-click sticker generator formatted for direct printing or PNG download to attach to power tools and equipment cases.

---

## Technology Stack

- **Framework:** Next.js 16.4.3 (App Router with Turbopack)
- **UI & Components:** React 19, Tailwind CSS 3.4, Lucide React Icons
- **Database:** MongoDB & Mongoose 9.11.4 with automatic in-memory fallback for local development
- **Security:** Node.js native `crypto` (PBKDF2 with timingSafeEqual, HMAC-SHA256 token signing)
- **QR Generation:** `qrcode` high-contrast SVG and Canvas generation

---

## Directory Structure

```
next-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/          # Login, Register, Logout, Me endpoints
│   │   │   ├── tools/         # Fleet CRUD, public catalog & QR scan resolver
│   │   │   └── bookings/      # Rental reservations & status transitions
│   │   ├── owner/             # Owner fleet & incoming bookings routes
│   │   ├── borrower/          # Borrower dashboard, explore & rentals routes
│   │   ├── scan/[publicId]/   # Public mobile QR scan landing route
│   │   ├── tools/[id]/        # Tool details with booking calculator & owner actions
│   │   ├── login/ & register/ # Role-based authentication pages
│   │   └── profile/           # User profile & verified role management
│   ├── components/            # Navbar, Footer, ToolCard, ToolQRModal, ChatModal
│   ├── lib/                   # server-auth, data-store, constants, utils
│   └── models/                # Canonical Tool, Booking, and User Mongoose schemas
```

---

## Getting Started

### 1. Install Dependencies
```bash
cd next-app
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure the following variables:
```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/toolshare?retryWrites=true&w=majority
AUTH_SECRET=your_32_character_cryptographically_random_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## Automated Verification & Testing

Run the test suite:
```bash
node "path/to/test-verification.mjs"
```
Suites cover:
1. PBKDF2 password hashing & timing-safe equality checks
2. HMAC-SHA256 session token generation, tamper rejection, and expiry validation
3. Server-side login role mismatch prevention (HTTP 403) and role-based redirects
4. Tool ownership authorization guards and self-rental rejection (`CANNOT_RENT_OWN_TOOL`)
5. Cryptographic QR public identifier generation and public API PII sanitization
6. Booking date interval overlap collision detection
