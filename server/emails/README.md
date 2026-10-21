# Kursimeyz emails

Every transactional email shares one look: an oatmeal page, a warm card, a sage (or clay)
hero band with a smiling sticker, and a footer with a row of fruit. Colours come from the
shop theme — oatmeal `#f2ece0`, forest `#3a4d39`, sage `#8a9a5b`/`#e8ecd7`, clay `#d27d53`/`#f5e8e1`,
brand red `#ff311b`.

```
server/
├── services/emailService.js   # loads templates, builds order emails, sends
├── utils/nodemailer.js        # Gmail transporter (EMAIL_USER / EMAIL_PASS)
└── emails/
    ├── partials/top.html      # <head>, the shared stylesheet, logo, opens the card
    ├── partials/bottom.html   # closes the card, fruit row, footer
    ├── assets/*.png           # stickers + logo, attached to each message
    ├── assets/src/*.svg       # editable sources of the stickers
    └── *.html                 # one file per email: hero + body only
```

## Templates

| File | Sent when | Variables |
| --- | --- | --- |
| `order-confirmation.html` | an order is placed (to the customer) | built by `getOrderVariables` + `paymentBlock`, `nextSteps`, `supportLine` |
| `admin-order-notification.html` | an order is placed (to every admin) | built by `getOrderVariables` + `attentionBlock` |
| `welcome.html` | a new account is created | `name`, `loginUrl` |
| `otp.html` | a verification or password-reset code | `otp`, `heading`, `intro` |
| `password-reset.html` | `sendPasswordResetEmail` | `name`, `resetUrl`, `expiryTime` |
| `course-enrollment.html` | unused by the shop; kept on-theme | `name`, `courseTitle`, … |

Every template also accepts `emailTitle`, `preheader` (the inbox preview line) and `footerNote`.
`{{year}}` is always available.

## How a template works

- `{{name}}` is replaced by the value of that variable, as text. Escape anything that came from a
  user (`emailService.escapeHtml`) before passing it in; a variable that holds HTML (like
  `orderItems`) is built by the service and escaped there.
- `{{>top}}` and `{{>bottom}}` include the files in `partials/`.
- A placeholder nobody supplied prints nothing.
- `<img src="cid:chair">` refers to `assets/chair.png`. The service attaches every `cid:` image a
  template uses, so stickers appear without hosting and without "load remote images".

## Stickers

`assets/src/*.svg` are the editable drawings (chair, box, lock, plant, apple, orange, lemon, pear).
The PNGs in `assets/` are what mail clients receive — rasterise an SVG at 256×256 with a transparent
background after editing it. `logo.png` is `client/public/logo.png` scaled to 360px wide.

## Configuration

```env
EMAIL_USER=your-address@gmail.com
EMAIL_PASS=a-google-app-password
CLIENT_URL=https://your-shop.example
```

`CLIENT_URL` builds the links inside emails (orders page, admin order, login).
