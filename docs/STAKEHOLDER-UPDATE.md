# Kursimeyz website: customer experience update

## In one paragraph

We reviewed the website the way a first-time furniture buyer would use it, and improved the places where people were most likely to get confused, stuck, or give up: finding a chair, trusting the product, paying, and coming back to check on an order. The changes also make day-to-day admin work safer and quicker. Every change below has been checked by an automated test that behaves like a real shopper and a real admin, and 50 of 50 checks pass.

---

## What customers will notice

### Buying is clearer and faster
- **Delivery cost is visible before checkout.** In the cart, a customer picks their city and immediately sees the delivery charge and the full total. For cities we don't have a fixed rate for, it says clearly that the charge will be agreed after the order.
- **Less typing.** Checkout remembers the customer's last address and phone number (on their own device) and fills them in. Phones can also auto-fill forms.
- **Mistakes are caught early.** If a phone number is mistyped, the customer is told straight away, instead of us finding out after the order when nobody can reach them.
- **A proper "order placed" page.** After ordering, the customer sees their order number, how much to pay, and exactly where to send it, with a one-tap Copy button. A ready-written WhatsApp message (with the order number and amount filled in) lets them send their payment screenshot in one tap. Before, customers paying by Easypaisa or JazzCash were sent away to another website and never saw their order number.
- **Clearer wording and prices.** Checkout steps now say what they are ("Delivery details", "Payment method", "Order summary"). Prices are easier to read: Rs. 125,000 instead of Rs. 125000.
- **Cart tidy-up.** Items that have since been removed from the shop no longer break the cart or checkout.

### Products are easier to judge
- **Better photos.** Customers can swipe through photos on a phone and tap to open any photo full-screen, large enough to judge wood grain and fabric.
- **Real customer reviews.** What buyers wrote about a product is now shown on its page (first name and initial only, so privacy is protected).
- **Easier to ask a question.** Each product page has an "Ask us about this piece on WhatsApp" link that already names the product.
- **Always within reach on a phone.** A sticky "Add to Cart" bar with the price appears as customers scroll down the product page.
- **Find things in a collection.** Chairs, tables and sofas can now be searched and sorted (newest, price low-to-high, price high-to-low, top rated). On a phone, the filters fold away until needed. The price slider reacts much faster.
- **We removed the "In Stock" label.** The website doesn't track stock, so the label was a promise we couldn't keep. We recommend a real "made to order, ready in X days" message instead (see decisions below).

### Coming back to an order
- **Orders show what was bought.** "My Orders" now lists the product names and photos. Before, every item appeared as a generic placeholder.
- **A progress bar for each order**: Placed, Processing, Shipped, Delivered.
- **Payment help where it's needed.** An order still waiting for payment shows a one-tap link to send the payment screenshot.
- **A new "My Account" page.** Customers can fix their phone number, save delivery details, and sign out. Previously they could only sign out.

### Smoother everywhere
- **Pages start at the top.** Opening a product from halfway down the shop no longer leaves the customer halfway down the product page.
- **The site no longer "blinks" between pages.** The header, footer and WhatsApp button stay put when moving around.
- **Signing in takes you back to where you were.** A customer who clicks Checkout, is asked to sign in, and signs in lands back on Checkout instead of the home page.
- **The "rate your order" pop-up stays out of the way** while someone is shopping or paying.
- **Each page has a proper title** in the browser tab (for example "Alpha Oak Chair | Kursimeyz"), which helps with bookmarks and search results.
- **Works better on phones and short laptop screens.** Sign-up and sign-in pages no longer get cut off, and the WhatsApp button no longer covers important buttons or pop-ups.
- **Recovers after we update the site.** Someone with the site open during an update now gets a quiet automatic refresh instead of an error page.

---

## What the admin team will notice

- **"Are you sure?" before risky actions.** Deleting a product, cancelling an order, or marking an order Delivered now asks for confirmation first. These used to happen on a single click.
- **The customer list is usable.** Search by name, email or phone works, and there is a button to download the list as a spreadsheet (CSV). Buttons that did nothing have been removed.
- **No more dead-end menu item.** "Seller Management" (a "Coming Soon" page) has been removed from the menu.
- **Admins who stay signed in are taken straight to the admin area.** Previously, an admin who closed the browser and came back to the website would see the shop as if they were a customer. Now they land on the admin dashboard. (Side effect: an admin can't browse the shop in the same browser while signed in. Use a private window to preview the shop.)

---

## Problems found and fixed while testing

Testing also caught four mistakes in our own new work before it reached customers:
1. **Reviewer names were cut up wrongly** (for example "Ayesha Khan" appeared as "Aye H."). Fixed.
2. **The full-screen photo viewer skipped a photo** on each arrow-key press. Fixed.
3. **The city suggestion list covered the order total and the Checkout button** in the cart. It now closes once a full city name is entered.
4. **The cart count in the header still counted removed items.** Fixed.

---

## How we know it works

We built a safe test copy of the whole website (shop, admin, and database, filled with sample chairs, tables, customers and orders) that is completely separate from the live data, with emails switched off. An automated tester then used it like a real person would: browsing, searching, signing in, placing cash, Easypaisa and bank orders, rating products, and acting as an admin. It also checked phone-sized screens.

- **50 of 50 checks pass**, covering the new features and the things that must not break (sign-in rules, who can see what, prices and delivery charges being calculated by the server, admin pages still loading).
- The site builds cleanly, and the server logged no errors during the run.
- The code-quality checker reports slightly fewer warnings than before we started (46, down from 47).

**What we have not done:** this was tested on a computer in a desktop browser (Chrome) with phone-sized screens simulated. We recommend a quick check on one real Android phone and one iPhone before launch, especially for photo swiping and the WhatsApp links.

---

## Decisions we need from stakeholders

These were deliberately left alone because they are business decisions, not design ones:

1. **Postal code at checkout.** Many customers don't know theirs. Should it become optional?
2. **Stock and delivery time.** Should product pages say "made to order, ready in X days", or should we start tracking real stock?
3. **Customer-initiated cancellations and receipts.** Should customers be able to cancel an order, or upload a payment receipt themselves? If yes, under what rules?
4. **Order updates.** Should customers automatically get a message (email or WhatsApp) when an order is Shipped or Delivered?
5. **Delivery pricing.** Delivery is currently one price per city regardless of what is ordered. A sofa and a stool cost the same to ship. Should price depend on the size or number of items?

## Not part of this update

This update was about the customer and admin experience. **Security improvements are a separate piece of work and are still recommended before a wider launch**, in particular protections on the sign-in and password-reset steps. We can brief you on those separately.
