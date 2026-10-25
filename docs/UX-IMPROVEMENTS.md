# UX improvements: what changed and why

Scope: the storefront and admin experience for Kursimeyz (chairs, tables, sofas).
Everything below is uncommitted in the working tree on `main`.

**How it was checked:** see "Testing" at the end: 50 automated end-to-end checks pass (real Chrome, real server, throwaway database), plus `tsc`, a production build and ESLint (46 problems, down from 47 before this work).

---

## 1. Buying: cart, checkout, confirmation

| Before | Now |
|---|---|
| Checkout headings read "Shipping Sanctuary / Payment Essence / Order Harmony". | "Delivery details / Payment method / Order summary". |
| Phone, street and city were retyped on every order. | Checkout starts from the last delivery details used and the account phone. Saved in this browser only. |
| Phone number was never validated at checkout, so a typo meant an order nobody could call. | Validated with the same Pakistani-mobile rule as sign-up, with an inline error and focus on the field. Stored in `+92…` form. |
| Form fields had no labels linked to inputs and no autofill hints. | Labels are linked (`htmlFor`), and fields carry `autocomplete` / `inputmode` so phones can autofill. |
| Delivery cost was a surprise at checkout. | The cart has an "Estimate delivery to" city picker, shared with checkout. Unlisted cities say "Quoted after you order". |
| Easypaisa/JazzCash orders threw a modal then **left the site**, skipping the confirmation page. | Every payment method lands on the confirmation page. The wallet app opens only by choice, in a new tab. |
| Confirmation page showed no order number and no payment details; both buttons went to Home. | Shows the order number, the amount, account details with a Copy button, numbered steps, and a WhatsApp link prefilled with the order number and amount. Cash orders say "Nothing to pay now". Unlisted-city orders are told shipping will be agreed. "Track my order" goes to My Orders. |
| Button text during submit was a spinner only. | "Placing order…", plus a line saying whether anything is charged today. |
| A deleted product left a blank line that crashed checkout. | Empty lines are dropped in cart and checkout, and the cart count ignores them. |
| Prices read `Rs. 125000`. | `Rs. 125,000` everywhere (cart, checkout, product page, cards, orders, shipping list). |
| Cart +/− and Remove had no accessible names, tiny hit areas, and an invalid class `text-[#white]/60`. | Labelled buttons with 36px targets, − disabled at 1, valid contrast classes. |

## 2. My Orders and My Account

- **Order history now shows product names and photos.** It used to say "Sanctuary Addition" for everything. Cause: the server never loaded the products (`getMyOrders`, one-line populate). A removed product shows a neutral chair icon, not a stock photo.
- **Progress timeline** per order: Placed → Processing → Shipped → Delivered (Cancelled gets its own message).
- **Unpaid wallet/bank orders** show "Awaiting payment" and a one-tap WhatsApp link to send the screenshot. Cash orders say how much to pay on arrival.
- **New `/account` page** (header person icon on desktop, "Account" tab on mobile): shows profile, edits the phone number, saves or clears delivery details, links to orders, and signs out. Previously logout was the only account action.

## 3. Product page and shop

- **Photos:** swipe on touch, arrow keys, arrows always visible on phones (hover-only before), tap to open a full-screen viewer with pinch-zoom, next/prev and Esc. Furniture is bought on grain and weave, which a 460px square can't show.
- **Removed the invented "In Stock" badge.** The system has no inventory, so it was a promise nobody could keep. Replaced with an "Ask us about this piece on WhatsApp" link that includes the product name and page URL.
- **Customer review comments are now visible** (stars, first name + initial, month). New public endpoint `GET /api/reviews/product/:productId`; no email or full name is exposed.
- **Mobile sticky "Add to Cart" bar** with the price, shown only once the main button scrolls out of view. The floating WhatsApp button lifts clear of it.
- **"Added!" button** was dark text on red (hard to read), now white. After adding, a "View cart" link appears. Quantity buttons are labelled and capped at 20.
- **Shop:** search within the collection, sort (newest, price low/high, top rated), result count, a collapsible Filters panel on phones, a price slider that responds in 350ms instead of 1s, and an empty state with "Clear all filters". Search and sort reset when you switch collection.

## 4. Navigation and general behaviour

- **New pages open at the top.** Scroll position used to carry over (a product opened halfway down). `#find-your-space` links now actually scroll. The Back button still restores position.
- **Header and footer no longer reload between pages.** Public and signed-in pages each mounted their own layout, so the header, footer, WhatsApp button and review popup reset on every shop→cart move. They now share one layout.
- **Sign-in sends you back where you were** (for example `/checkout`), instead of Home. Login↔Sign-up links and OTP verification carry that along. Signing in from the quick-login popup no longer jumps to Home.
- **Review popup stays away from payment.** It no longer opens over `/cart`, `/checkout` or the confirmation page (it used to re-check on tab focus, including when returning from a wallet app).
- **Shop menu works by tap and keyboard** (`aria-expanded`, Esc to close); it was hover-only.
- **Sign-out clears cached data**, so the next person on the browser doesn't briefly see the previous user's cart or orders.
- **Page titles** per page (product name, "Checkout", "My orders"…) and a real default description. Removed two unused Google fonts (Inter, Space Grotesk).
- **Stale-tab recovery:** a tab left open across an update used to land on the error page; it now reloads once automatically.
- **Saved admin session no longer shows the shop as a customer.** The browser keeps the session in localStorage for 7 days, so reopening the site after closing the browser showed the shop signed in as the admin. A saved admin session now goes straight to `/admin/dashboard` (shop and sign-in pages included). Visiting `/admin` while signed out goes to the admin sign-in page instead of the shop.
- **WhatsApp:** floating button link now uses digits only (`+` broke `wa.me`), sits below dialogs instead of above them, and opens with a prefilled greeting.

## 5. Sign-in screens

- Autofill hints on every field (email, new/current password, phone, one-time code); numeric keypad for codes.
- Pages use `h-dvh` and a form column that always scrolls, so sign-up no longer clips on short laptop screens or when a phone's browser bar changes height.

## 6. Admin

- **Confirm before deleting a product** (red button, focus starts on Cancel, states that past orders lose the product name and photo).
- **Confirm before Cancelled / Delivered** order changes (Delivered also marks paid and opens reviews).
- **Customers page:** search by name, email or phone now works, **Export CSV** is real, and the decorative Filter button and fake pagination ("1 2 3 … 4") are gone.
- **Removed the "Seller Management" menu item** (it led to a "Coming Soon" page).

---

## New building blocks

`ConfirmDialog`, `ScrollManager`, `useDocumentTitle`, `usePaymentSettings` (payment/WhatsApp details, one fetch shared by checkout, confirmation, orders and product page), `useProductReviews`, and utilities `formatPrice`, `buildWhatsAppLink`, `checkoutPrefs`.

## Server changes (small)

- `controller/order.js`: `getMyOrders` populates product name and photos.
- `controller/reviews.js` + `routes/apis/reviews.js`: public `GET /reviews/product/:productId`.

Nothing else on the server changed. The security issues from the audit are **not** part of this work.

---

## Deliberately not done, and why

| Item | Why |
|---|---|
| Making postal code optional | A business rule: the `Order` model requires it. Many customers don't know theirs; decide whether to relax it. |
| Cancel / reorder / receipt upload on My Orders | Each needs a rule (who may cancel, what happens to paid orders) and server endpoints. |
| Real stock or "made to order, X days" on products | Needs a data decision first. The badge was removed rather than replaced with another guess. |
| Subsetting the 3.8 MB icon font | Biggest single speed win for mobile data, but needs a build step and care: admins pick icons dynamically. Worth a separate task. |
| Admin Transactions page (fake data) | Its menu link was already hidden. Build it from payment confirmations or delete it. |
| Slug product URLs, sitemap, prerendering (SEO) | Larger change; titles and description are in place as a first step. |
| Product variants (fabric colours, sizes) | Data-model change. |
| Customer notifications on status change | Needs a rule on which statuses notify and via which channel. |

**Correction to the earlier audit:** I said no images lazy-load. Product photos already do (inside `ProductPhoto`); only cart, checkout, orders and gallery thumbnails were missing it, and those are now covered.

---

## Manual test checklist

1. Add a chair from the shop (signed out): quick-login popup should not redirect Home after signing in.
2. Cart: pick a city, see delivery and total; open checkout and confirm the city is prefilled.
3. Checkout with a bad phone (`0300`) → inline error; with a good one → lands on the confirmation page with the order number.
4. Place one order each with Cash, Easypaisa (needs account number set in admin Settings) and Bank; check the confirmation content.
5. My Orders: names and photos show, timeline matches the status, and the WhatsApp link opens with the order number.
6. Product page on a phone: swipe the photos, tap for full screen, scroll down to see the sticky bar; confirm WhatsApp doesn't overlap it.
7. Shop: search "oak", sort by price, narrow the slider, clear filters; switch collections and confirm search resets.
8. Open `/checkout` signed out → sign in → you return to checkout.
9. Admin: delete a product (dialog appears), set an order to Cancelled (dialog appears), search customers, export CSV.
10. Open a product from halfway down the shop page: it should start at the top; Back should return to the same place.

---

## Testing

**What ran.** A harness outside the repo starts a throwaway in-memory MongoDB, the real Express server (on port 5055, with the database URL, JWT secret and email credentials overridden so nothing real is touched or sent) and the real Vite client (port 5199), seeds chairs, tables, a sofa, customers, an admin, orders (including one whose product was deleted) and a public review, then drives Chrome with Playwright at desktop (1366x850) and phone (390x844, touch) sizes.

**Result: 50 passed, 0 failed** (the final full run, made after the last code change).

| Area | Checks |
|---|---|
| API regression (6) | Admin/customer sign-in rules unchanged; public data endpoints still 200; protected routes still 401/403; public review endpoint returns comment + "Ayesha K." and leaks no email/phone; order totals and shipping are computed server-side (Lahore Rs. 500, unlisted city Rs. 0 and flagged); My Orders returns names and photos (null for a deleted product, no error) |
| Browsing (12) | Every public page renders; per-page titles; shop search, sort, Load More, slider, category, clear; collection switch resets search; product page content, WhatsApp links, quantity; review shown; photo viewer; quick sign-in popup still opens; layout stays mounted; scroll reset and hash scroll; shop menu click/Esc |
| Sign-in (4) | Return to /cart after sign-in; destination carried through Sign up; autofill hints; sign-up reachable at 1280x560 |
| Buying (8) | Cart estimate and totals; checkout prefill, bad phone blocked with no order created, good phone creates exactly one correct order and clears the cart; refresh on confirmation; Easypaisa and Bank confirmation content and that the browser stays on-site; unlisted city note; deleted product line; stepper buttons |
| Account (4) | My Orders content, timeline and payment link; phone validation and save (checked in the database); header/tab links; /account requires sign-in |
| Rating prompt (1) | Appears on /orders, never on /cart or /checkout |
| Admin (9) | Sign-in; a saved admin session sent from 8 storefront/sign-in URLs to /admin/dashboard in a fresh browser; shop reachable after sign-out; customer kept out of /admin; no Seller Management; delete and status-change dialogs (Cancel/Go back keep data, confirm applies it); customer search and CSV; 12 admin pages still load |
| Phones (4) | No horizontal scroll on 10 pages; sticky bar and WhatsApp button do not overlap; swipe; collapsible filters |
| Resilience (2) | Stale-bundle reload happens once, no loop; server logged no 5xx during the run |

**Bugs the tests found (all fixed):**
1. `controller/reviews.js`: the reviewer-name regex had lost its backslash and split names on the letter "s" ("Ayesha Khan" became "Aye H.").
2. `ProductImageGallery.tsx`: in the full-screen viewer one arrow key moved two photos (React forwards events from a portal to the gallery behind it).
3. `CitySelect.tsx`: after typing a city the suggestion list stayed open over the cart totals and the Checkout button; it now closes on an exact match, Tab, Enter and Escape.
4. `useCart.ts`: the header cart badge still counted lines whose product was deleted; it also added two lint `any` errors, since replaced by a real type.

**Mistakes in the tests themselves** (wrong expected number, header text is upper-cased by CSS, a price read from the wrong part of a card, an intentionally-triggered error counted as a crash) were corrected in the tests, not the product.

**One thing to know about the first run.** A dev client of yours was already running on port 1800, so the first attempt's browser steps hit it instead of the test copy. Those steps used made-up accounts and tokens, which your API (port 5000) would have rejected, so no data should have changed; the suite was then moved to its own port (5199) and re-run in full.

**Not covered:** real phones (iOS Safari, Android Chrome), Safari/Firefox, real email delivery, Google sign-in, S3 image upload, and the admin About/Home/Footer editors beyond "page loads".

**Re-running.** The harness lives in the session scratchpad, not the repo. If you want it kept, it can be added as `client/e2e/` with Playwright as a dev dependency (it uses installed Chrome; no browser download).
