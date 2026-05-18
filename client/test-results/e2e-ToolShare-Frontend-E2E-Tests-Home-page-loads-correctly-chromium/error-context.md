# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.spec.js >> ToolShare Frontend E2E Tests >> Home page loads correctly
- Location: tests\e2e.spec.js:9:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Rent Tools')
Expected: visible
Error: strict mode violation: locator('text=Rent Tools') resolved to 9 elements:
    1) <span>Rent Tools</span> aka getByText('Rent Tools').first()
    2) <span>Rent Tools</span> aka getByText('Rent Tools').nth(1)
    3) <span>Rent Tools</span> aka getByText('Rent Tools').nth(2)
    4) <span>Rent Tools</span> aka getByText('Rent Tools').nth(3)
    5) <span>Rent Tools</span> aka getByText('Rent Tools').nth(4)
    6) <span>Rent Tools</span> aka getByText('Rent Tools').nth(5)
    7) <span>Rent Tools</span> aka locator('span:nth-child(7)')
    8) <span>Rent Tools</span> aka locator('span:nth-child(8)')
    9) <span>Can I rent tools for multiple days?</span> aka getByText('Can I rent tools for multiple')

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=Rent Tools')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - banner [ref=e5]:
        - link "household tools" [ref=e6] [cursor=pointer]:
          - /url: index.html
        - navigation [ref=e7]:
          - link "About Us" [ref=e8] [cursor=pointer]:
            - /url: index.html#about
          - link "How it Works" [ref=e9] [cursor=pointer]:
            - /url: index.html#how-it-works
          - link "Pricing" [ref=e11] [cursor=pointer]:
            - /url: index.html#pricing
          - link "Browse Tools" [ref=e12] [cursor=pointer]:
            - /url: browse.html
        - generic [ref=e13]:
          - link "LOGIN" [ref=e14] [cursor=pointer]:
            - /url: login.html
          - link "LIST A TOOL" [ref=e15] [cursor=pointer]:
            - /url: listing-new.html
      - generic:
        - generic:
          - generic: ToolShare
          - link "Home":
            - /url: index.html
          - link "Browse Tools":
            - /url: browse.html
          - link "List a Tool":
            - /url: listing-new.html
          - link "Log In":
            - /url: login.html
          - link "Sign Up Free":
            - /url: register.html
    - main [ref=e16]:
      - generic:
        - generic:
          - generic: Rent Tools
          - generic: Rent Tools
          - generic: Rent Tools
          - generic: Rent Tools
          - generic: Rent Tools
          - generic: Rent Tools
          - generic: Rent Tools
          - generic: Rent Tools
      - generic [ref=e17]:
        - img "High Torque Drill" [ref=e18]
        - generic [ref=e19] [cursor=pointer]:
          - generic: Precision Trigger
          - text: +
        - generic [ref=e20] [cursor=pointer]:
          - generic: High Torque Motor
          - text: +
        - generic [ref=e21] [cursor=pointer]:
          - generic: Quick-Release Chuck
          - text: +
      - generic [ref=e22]:
        - paragraph [ref=e23]: We create a marketplace that doesn't just list tools — it becomes your project's accent. Each rental is a combination of reliability and visual harmony.
        - link "View Collections" [ref=e24] [cursor=pointer]:
          - /url: browse.html
      - generic [ref=e27]: ↓
    - generic [ref=e28]:
      - generic [ref=e29]:
        - generic [ref=e30]:
          - img "Step Ladder" [ref=e32]
          - generic [ref=e33]: Compact Storage
        - generic [ref=e34]:
          - img "Hammer" [ref=e36]
          - generic [ref=e37]: Steel Hammer
      - generic [ref=e39]:
        - generic [ref=e40]:
          - generic [ref=e41]:
            - text: Rental
            - text: Special Offers
          - generic [ref=e42] [cursor=pointer]: ➔
        - generic [ref=e43]:
          - img "Tool" [ref=e45]
          - img "Tool" [ref=e47]
        - link "View Offers" [ref=e48] [cursor=pointer]:
          - /url: browse.html
      - generic [ref=e49]:
        - generic [ref=e50]:
          - generic [ref=e51]: List Your Tools
          - generic [ref=e52]: Earn extra cash with your idle equipment.
          - link "Get a Quote ➔" [ref=e53] [cursor=pointer]:
            - /url: listing-new.html
        - generic [ref=e54]:
          - generic [ref=e55]: 📍
          - generic [ref=e56]:
            - generic [ref=e57]: Find Tools Near You
            - generic [ref=e58]: Open Map View
  - generic [ref=e60]:
    - generic [ref=e61]: HOW IT WORKS
    - heading "Three steps. That's all it takes." [level=2] [ref=e62]:
      - text: Three steps.
      - text: That's all it takes.
    - generic [ref=e63]:
      - generic [ref=e64]:
        - generic [ref=e65]: "01"
        - generic [ref=e66]: 🔍
        - heading "Search Nearby" [level=3] [ref=e67]
        - paragraph [ref=e68]: Enter your location and instantly browse thousands of tools available near you. Filter by category, condition, and price.
      - generic [ref=e69]: →
      - generic [ref=e70]:
        - generic [ref=e71]: "02"
        - generic [ref=e72]: 📅
        - heading "Book & Confirm" [level=3] [ref=e73]
        - paragraph [ref=e74]: Select your rental dates, pay a fully refundable security deposit, and get instant confirmation from the tool owner.
      - generic [ref=e75]: →
      - generic [ref=e76]:
        - generic [ref=e77]: "03"
        - generic [ref=e78]: 🚀
        - heading "Pick Up & Return" [level=3] [ref=e79]
        - paragraph [ref=e80]: Collect the tool, complete your project, and return it. Your deposit is refunded automatically. Rate your experience.
    - generic [ref=e81]:
      - generic [ref=e82]: Are you a tool owner?
      - generic [ref=e83]:
        - generic [ref=e84]: 📸 List Free
        - generic [ref=e85]: →
        - generic [ref=e86]: ✅ Approve Bookings
        - generic [ref=e87]: →
        - generic [ref=e88]: 💰 Get Paid
      - link "Start Earning" [ref=e89] [cursor=pointer]:
        - /url: listing-new.html
  - generic [ref=e91]:
    - generic [ref=e92]:
      - generic [ref=e93]: ABOUT US
      - heading "Built for people who build things." [level=2] [ref=e94]:
        - text: Built for people
        - text: who build things.
      - paragraph [ref=e95]: Household Tools was born from a simple frustration — why buy a drill for one shelf? We connect neighbors, builders, and makers so tools get used, money stays local, and projects get done.
      - paragraph [ref=e96]: Today we're India's fastest growing peer-to-peer tool rental platform, with over 10,000 listings, 5,000 verified users, and a community passionate about sharing.
      - generic [ref=e97]:
        - generic [ref=e98]:
          - generic [ref=e99]: 10K+
          - generic [ref=e100]: Tools Listed
        - generic [ref=e101]:
          - generic [ref=e102]: 5K+
          - generic [ref=e103]: Verified Users
        - generic [ref=e104]:
          - generic [ref=e105]: ₹0
          - generic [ref=e106]: To Join
        - generic [ref=e107]:
          - generic [ref=e108]: 4.9★
          - generic [ref=e109]: Avg. Rating
    - generic [ref=e110]:
      - img "Drill Machine" [ref=e112]
      - img "Hammer" [ref=e114]
      - img "Ladder" [ref=e116]
      - generic [ref=e117]:
        - generic [ref=e118]: 🏆
        - generic [ref=e119]:
          - text: "India's #1"
          - text: Tool Marketplace
  - generic [ref=e121]:
    - generic [ref=e122]: PRICING
    - heading "Simple. Transparent. No surprises." [level=2] [ref=e123]:
      - text: Simple. Transparent.
      - text: No surprises.
    - generic [ref=e124]:
      - generic [ref=e125]:
        - generic [ref=e126]: Borrower
        - generic [ref=e127]: Free to join
        - list [ref=e128]:
          - listitem [ref=e129]: ✓ Browse all listings
          - listitem [ref=e130]: ✓ Unlimited rental bookings
          - listitem [ref=e131]: ✓ Refundable security deposit
          - listitem [ref=e132]: ✓ 24/7 support
          - listitem [ref=e133]: ✓ Damage protection included
        - link "Get Started" [ref=e134] [cursor=pointer]:
          - /url: register.html
      - generic [ref=e135]:
        - generic [ref=e136]: Most Popular
        - generic [ref=e137]: Tool Owner
        - generic [ref=e138]: Free to list
        - list [ref=e139]:
          - listitem [ref=e140]: ✓ Unlimited tool listings
          - listitem [ref=e141]: ✓ Keep 90% of rental income
          - listitem [ref=e142]: ✓ Owner dashboard & analytics
          - listitem [ref=e143]: ✓ Instant payout to bank
          - listitem [ref=e144]: ✓ Damage dispute resolution
          - listitem [ref=e145]: ✓ Priority support
        - link "List a Tool Now" [ref=e146] [cursor=pointer]:
          - /url: listing-new.html
      - generic [ref=e147]:
        - generic [ref=e148]: Business
        - generic [ref=e149]: Custom pricing
        - list [ref=e150]:
          - listitem [ref=e151]: ✓ Fleet management tools
          - listitem [ref=e152]: ✓ Dedicated account manager
          - listitem [ref=e153]: ✓ Custom rental agreements
          - listitem [ref=e154]: ✓ Bulk listing discounts
          - listitem [ref=e155]: ✓ White-label options
        - link "Contact Sales" [ref=e156] [cursor=pointer]:
          - /url: mailto:hello@householdtools.in
  - generic [ref=e158]:
    - generic [ref=e159]: TESTIMONIALS
    - heading "Trusted by thousands of neighbors." [level=2] [ref=e160]:
      - text: Trusted by thousands
      - text: of neighbors.
    - generic [ref=e161]:
      - generic [ref=e162]:
        - generic [ref=e163]: ★★★★★
        - paragraph [ref=e164]: "\"Rented a tile cutter for a weekend project. Saved ₹8,000 vs buying. The owner was super helpful and the tool was in perfect shape.\""
        - generic [ref=e165]:
          - generic [ref=e166]: RK
          - generic [ref=e167]:
            - generic [ref=e168]: Rajesh Kumar
            - generic [ref=e169]: Borrower · Pune
      - generic [ref=e170]:
        - generic [ref=e171]: ★★★★★
        - paragraph [ref=e172]: "\"I listed my power tools that were collecting dust and made ₹24,000 last month alone. My drill has literally paid for itself three times over.\""
        - generic [ref=e173]:
          - generic [ref=e174]: AS
          - generic [ref=e175]:
            - generic [ref=e176]: Amit Sharma
            - generic [ref=e177]: Tool Owner · Mumbai
      - generic [ref=e178]:
        - generic [ref=e179]: ★★★★★
        - paragraph [ref=e180]: "\"As someone who does DIY projects twice a year, this is a game changer. Professional tools at a fraction of the cost, right in my neighbourhood.\""
        - generic [ref=e181]:
          - generic [ref=e182]: PD
          - generic [ref=e183]:
            - generic [ref=e184]: Priya Deshpande
            - generic [ref=e185]: Borrower · Bangalore
      - generic [ref=e186]:
        - generic [ref=e187]: ★★★★★
        - paragraph [ref=e188]: "\"The damage protection gives me peace of mind as an owner. I've had zero bad experiences — the platform really vets its borrowers well.\""
        - generic [ref=e189]:
          - generic [ref=e190]: VR
          - generic [ref=e191]:
            - generic [ref=e192]: Vivek Rao
            - generic [ref=e193]: Tool Owner · Delhi
  - generic [ref=e195]:
    - generic [ref=e196]:
      - generic [ref=e197]: FAQ
      - heading "Got questions? We've got answers." [level=2] [ref=e198]:
        - text: Got questions?
        - text: We've got answers.
      - paragraph [ref=e199]: Can't find what you're looking for? Reach out to our support team and we'll get back to you within 2 hours.
      - link "Contact Support" [ref=e200] [cursor=pointer]:
        - /url: mailto:hello@householdtools.in
    - generic [ref=e201]:
      - generic [ref=e202] [cursor=pointer]:
        - generic [ref=e203]:
          - generic [ref=e204]: Is it free to join and list tools?
          - generic [ref=e205]: +
        - generic: Yes, completely free. There are no listing fees or membership costs. We take a small 10% commission only when a rental is completed.
      - generic [ref=e206] [cursor=pointer]:
        - generic [ref=e207]:
          - generic [ref=e208]: What if the tool gets damaged?
          - generic [ref=e209]: +
        - generic: Every rental is protected by our Damage Protection Plan. Borrowers pay a refundable security deposit, and our dispute resolution team handles any claims within 48 hours.
      - generic [ref=e210] [cursor=pointer]:
        - generic [ref=e211]:
          - generic [ref=e212]: How do I verify my identity?
          - generic [ref=e213]: +
        - generic: We require a government-issued ID (Aadhaar or PAN) during onboarding. Verification takes under 5 minutes and is required before your first booking.
      - generic [ref=e214] [cursor=pointer]:
        - generic [ref=e215]:
          - generic [ref=e216]: How quickly do owners get paid?
          - generic [ref=e217]: +
        - generic: Payouts are processed within 24 hours of a rental completion directly to your registered bank account or UPI ID.
      - generic [ref=e218] [cursor=pointer]:
        - generic [ref=e219]:
          - generic [ref=e220]: Can I rent tools for multiple days?
          - generic [ref=e221]: +
        - generic: Absolutely. You can set rental duration by the hour, day, or week. Most owners offer discounted weekly rates — check the listing for details.
  - contentinfo [ref=e222]:
    - generic [ref=e223]:
      - generic [ref=e224]:
        - generic [ref=e225]:
          - generic [ref=e226]: household tools
          - paragraph [ref=e227]: India's peer-to-peer tool rental marketplace. Borrow smarter. Earn from idle tools.
          - generic [ref=e228]:
            - link "f" [ref=e229] [cursor=pointer]:
              - /url: "#"
            - link "in" [ref=e230] [cursor=pointer]:
              - /url: "#"
            - link "yt" [ref=e231] [cursor=pointer]:
              - /url: "#"
            - link "x" [ref=e232] [cursor=pointer]:
              - /url: "#"
        - generic [ref=e233]:
          - generic [ref=e234]: Platform
          - link "Browse Tools" [ref=e235] [cursor=pointer]:
            - /url: browse.html
          - link "List a Tool" [ref=e236] [cursor=pointer]:
            - /url: listing-new.html
          - link "Login" [ref=e237] [cursor=pointer]:
            - /url: login.html
          - link "Sign Up" [ref=e238] [cursor=pointer]:
            - /url: register.html
        - generic [ref=e239]:
          - generic [ref=e240]: Company
          - link "About Us" [ref=e241] [cursor=pointer]:
            - /url: "#about"
          - link "How It Works" [ref=e242] [cursor=pointer]:
            - /url: "#how-it-works"
          - link "Pricing" [ref=e243] [cursor=pointer]:
            - /url: "#pricing"
          - link "FAQ" [ref=e244] [cursor=pointer]:
            - /url: "#faq"
        - generic [ref=e245]:
          - generic [ref=e246]: Legal
          - link "Terms of Service" [ref=e247] [cursor=pointer]:
            - /url: "#"
          - link "Privacy Policy" [ref=e248] [cursor=pointer]:
            - /url: "#"
          - link "Rental Agreement" [ref=e249] [cursor=pointer]:
            - /url: "#"
          - link "Refund Policy" [ref=e250] [cursor=pointer]:
            - /url: "#"
        - generic [ref=e251]:
          - generic [ref=e252]: Contact
          - generic [ref=e253]: 📧 hello@householdtools.in
          - generic [ref=e254]: 📱 +91 98765 43210
          - generic [ref=e255]: 📍 Mumbai, India
          - generic [ref=e256]: 🕐 Mon–Sat, 9am–7pm
      - generic [ref=e257]:
        - generic [ref=e258]: © 2025 Household Tools. Made with ❤️ in India.
        - generic [ref=e259]:
          - generic [ref=e260]: 🔒 Secure Payments
          - generic [ref=e261]: ✓ ID Verified
          - generic [ref=e262]: 🛡️ Damage Protected
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('ToolShare Frontend E2E Tests', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     // Set base URL for the frontend
  6  |     await page.goto('http://localhost:3000/index.html');
  7  |   });
  8  | 
  9  |   test('Home page loads correctly', async ({ page }) => {
  10 |     await expect(page).toHaveTitle(/ToolShare/);
> 11 |     await expect(page.locator('text=Rent Tools')).toBeVisible();
     |                                                   ^ Error: expect(locator).toBeVisible() failed
  12 |     await expect(page.locator('text=View Collections')).toBeVisible();
  13 |   });
  14 | 
  15 |   test('Navigate to browse page', async ({ page }) => {
  16 |     await page.click('text=Browse Tools');
  17 |     await expect(page).toHaveURL(/browse\.html/);
  18 |     // Add more checks for browse page
  19 |   });
  20 | 
  21 |   // Add more tests for other pages
  22 | });
```