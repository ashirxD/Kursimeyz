const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { orderLabel } = require('../utils/orderNumber');
const { FINISH_PARTS, isFinishEmpty, normalizeFinish } = require('../utils/productFinish');
const { createTransporter } = require('../utils/nodemailer');
const PaymentSettings = require('../models/PaymentSettings');
const { AppError } = require('../utils/errors');
const { buildPaymentSettingsResponse } = require('../utils/paymentSettings');

// Methods the customer pays for outside the shop, before the order ships.
const PREPAID_METHODS = ['Easypaisa', 'JazzCash', 'Bank'];

class EmailService {
  constructor() {
    this.transporter = createTransporter();
    this.templatesDir = path.join(__dirname, '../emails');
  }

  escapeHtml(value = '') {
    return value
      .toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  formatCurrency(value = 0) {
    return `Rs. ${Number(value || 0).toLocaleString('en-US')}`;
  }

  formatDate(value) {
    return new Date(value || Date.now()).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  /**
   * The body/fabric line under an item's name.
   *
   * A cropped swatch is an ordinary https image, so it renders in a mail client;
   * a flat colour is a background-coloured span, which degrades to nothing
   * visible where inline styles are stripped. Either way the material name is
   * plain text, so the information survives regardless.
   */
  buildFinishHtml(finish) {
    const parts = FINISH_PARTS.map((part) => {
      const { color, material } = finish[part];
      if (!color.hex && !color.image && !material) return '';

      const label = part === 'body' ? 'Body' : 'Fabric';

      const swatch = color.image
        ? `<img src="${this.escapeHtml(color.image)}" width="12" height="12" alt="" style="width:12px;height:12px;border-radius:50%;vertical-align:middle;border:1px solid rgba(0,0,0,0.12);" />`
        : color.hex
          ? `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background-color:${this.escapeHtml(color.hex)};border:1px solid rgba(0,0,0,0.12);vertical-align:middle;"></span>`
          : '';

      const text = material ? this.escapeHtml(material) : this.escapeHtml(color.hex);

      return `<span style="white-space:nowrap;">${swatch} ${label}: ${text}</span>`;
    }).filter(Boolean);

    if (parts.length === 0) return '';

    return `<div style="margin-top:4px;font-size:12px;color:#6a7e69;">${parts.join('&nbsp;&nbsp;·&nbsp;&nbsp;')}</div>`;
  }

  // A product photo is only worth putting in a mail if a mail client can fetch it:
  // legacy relative /uploads paths cannot be, so they are skipped.
  getProductImage(product) {
    const candidates = [...(product?.images || []), product?.image];
    return candidates.find((url) => typeof url === 'string' && /^https:\/\//i.test(url)) || '';
  }

  buildOrderItemsHtml(order) {
    return (order.items || []).map((item) => {
      const productName = item.product?.name || 'Product';
      const image = this.getProductImage(item.product);
      const thumbnail = image
        ? `<img src="${this.escapeHtml(image)}" width="56" height="56" alt="" style="display:block;width:56px;height:56px;border-radius:10px;object-fit:cover;background:#f4f5f0;" />`
        : '';
      const quantity = Number(item.quantity || 0);
      const price = Number(item.price || item.product?.price || 0);
      // The order's own snapshot, so an old email reprint shows what was bought.
      const finish = normalizeFinish(item.finish);
      const finishHtml = isFinishEmpty(finish) ? '' : this.buildFinishHtml(finish);

      return `
        <tr>
          <td class="thumb">${thumbnail}</td>
          <td>${this.escapeHtml(productName)}${finishHtml}</td>
          <td class="center">${quantity}</td>
          <td class="right">${this.formatCurrency(price)}</td>
          <td class="right">${this.formatCurrency(price * quantity)}</td>
        </tr>
      `;
    }).join('');
  }

  buildShippingAddressHtml(address = {}) {
    return [
      address.street,
      [address.city, address.zipCode].filter(Boolean).join(', '),
      address.phone ? `Phone: ${address.phone}` : '',
    ]
      .filter(Boolean)
      .map((line) => this.escapeHtml(line))
      .join('<br>');
  }

  // An unlisted city was ordered from, so no rate was charged: say so rather
  // than printing "Rs. 0" and reading as free delivery.
  formatShippingPrice(order) {
    return order.isCustomShippingCity
      ? 'To be confirmed'
      : this.formatCurrency(order.shippingPrice);
  }

  getPaymentStatus(order) {
    return order.isPaid ? 'Paid' : 'Pending payment';
  }

  getClientUrl() {
    return (process.env.CLIENT_URL || 'http://localhost:1800').replace(/\/+$/, '');
  }

  // The name as it should read in a subject line: no markup, no line breaks.
  getPlainName(user) {
    return String(user?.username || 'Customer').replace(/\s+/g, ' ').trim() || 'Customer';
  }

  getPhone(user, order) {
    return user?.phone || order.shippingAddress?.phone || '';
  }

  getItemCount(order) {
    return (order.items || []).reduce((total, item) => total + Number(item.quantity || 0), 0);
  }

  getOrderVariables(user, order) {
    const orderId = order._id?.toString() || '';
    const itemCount = this.getItemCount(order);
    const phone = this.getPhone(user, order);
    const phoneDigits = phone.replace(/[^\d+]/g, '');
    const email = user?.email || '';

    return {
      customerName: this.escapeHtml(user?.username || 'Customer'),
      customerEmail: this.escapeHtml(user?.email || ''),
      customerFirstName: this.escapeHtml(this.getPlainName(user).split(' ')[0]),
      customerPhone: this.escapeHtml(phone),
      // Tap-to-call and tap-to-write, for the admin who has to reach the customer.
      customerEmailLink: email
        ? `<a href="mailto:${this.escapeHtml(email)}" style="color:#3a4d39;">${this.escapeHtml(email)}</a>`
        : '—',
      customerPhoneLink: phone
        ? `<a href="tel:${this.escapeHtml(phoneDigits)}" style="color:#3a4d39;">${this.escapeHtml(phone)}</a>`
        : '—',
      itemCount: String(itemCount),
      itemCountLabel: `${itemCount} item${itemCount === 1 ? '' : 's'}`,
      orderId: this.escapeHtml(orderId),
      // Complete label, '#' included when it falls back to the id, so the
      // templates print it verbatim rather than prefixing their own '#'.
      shortOrderId: this.escapeHtml(orderLabel(order, 8)),
      orderDate: this.formatDate(order.createdAt),
      orderItems: this.buildOrderItemsHtml(order),
      itemsPrice: this.formatCurrency(order.itemsPrice),
      shippingPrice: this.escapeHtml(this.formatShippingPrice(order)),
      totalPrice: this.formatCurrency(order.totalPrice),
      paymentMethod: this.escapeHtml(order.paymentMethod),
      paymentStatus: this.escapeHtml(this.getPaymentStatus(order)),
      shippingAddress: this.buildShippingAddressHtml(order.shippingAddress),
      adminOrderUrl: `${this.getClientUrl()}/admin/orders/${orderId}`,
      ordersUrl: `${this.getClientUrl()}/orders`,
    };
  }

  async getPaymentSettings() {
    try {
      return buildPaymentSettingsResponse(await PaymentSettings.findOne().lean());
    } catch (error) {
      // Instructions are a nicety: an order email must still go out without them.
      console.error('Could not read payment settings for an order email:', error.message);
      return buildPaymentSettingsResponse(null);
    }
  }

  // [label, value] rows of where to send the money, for the method the customer chose.
  getPaymentAccountRows(order, settings) {
    switch (order.paymentMethod) {
      case 'Easypaisa':
        return settings.easypaisaAccountNumber
          ? [['Easypaisa account', settings.easypaisaAccountNumber]]
          : [];
      case 'JazzCash':
        return settings.jazzcashAccountNumber
          ? [['JazzCash account', settings.jazzcashAccountNumber]]
          : [];
      case 'Bank':
        return [
          ['Bank', settings.bankName],
          ['Account title', settings.bankAccountTitle],
          ['Account number', settings.bankAccountNumber],
        ].filter(([, value]) => value);
      default:
        return [];
    }
  }

  buildCallout({ tone = 'info', title, body, rows = [] }) {
    const rowsHtml = rows.length
      ? `<table role="presentation" class="kv">${rows
          .map(
            ([label, value]) =>
              `<tr><td class="kv-label">${this.escapeHtml(label)}</td><td class="kv-value">${this.escapeHtml(value)}</td></tr>`
          )
          .join('')}</table>`
      : '';

    return `<div class="callout callout-${tone}"><div class="callout-title">${this.escapeHtml(title)}</div><div class="callout-body">${body}</div>${rowsHtml}</div>`;
  }

  /**
   * What the customer needs to do about paying, which depends entirely on how
   * they chose to pay: nothing (card), have cash ready, or send money and share
   * the receipt. Empty when there is nothing to say.
   */
  buildCustomerPaymentHtml(order, label, settings) {
    const total = this.escapeHtml(this.formatCurrency(order.totalPrice));
    const safeLabel = this.escapeHtml(label);

    if (order.isPaid) {
      return this.buildCallout({
        tone: 'success',
        title: 'Payment received',
        body: `We have received your payment of <strong>${total}</strong>. There is nothing more to pay.`,
      });
    }

    if (order.paymentMethod === 'Cash') {
      return this.buildCallout({
        title: 'Pay on delivery',
        body: `Please keep <strong>${total}</strong> ready in cash for when your order arrives.`,
      });
    }

    if (!PREPAID_METHODS.includes(order.paymentMethod)) return '';

    const methodName = order.paymentMethod === 'Bank' ? 'bank transfer' : order.paymentMethod;

    // No rate was charged for an unlisted city, so there is no final amount to pay yet.
    if (order.isCustomShippingCity) {
      return this.buildCallout({
        tone: 'action',
        title: 'Payment: we will confirm the amount first',
        body: `Your city is not on our delivery list yet, so we will contact you to agree the delivery cost. Once the final total is settled, we will share how to pay by ${this.escapeHtml(methodName)}.`,
      });
    }

    const rows = this.getPaymentAccountRows(order, settings);
    const whatsapp = settings.whatsappNumber
      ? ` on WhatsApp at <strong>${this.escapeHtml(settings.whatsappNumber)}</strong>`
      : '';

    if (rows.length === 0) {
      return this.buildCallout({
        tone: 'action',
        title: 'Complete your payment',
        body: `You chose ${this.escapeHtml(methodName)}. Our team will message you with the payment details for <strong>${total}</strong> shortly.`,
      });
    }

    return this.buildCallout({
      tone: 'action',
      title: 'Complete your payment',
      body: `Please send <strong>${total}</strong> by ${this.escapeHtml(methodName)} to the account below, then send us a screenshot of the payment${whatsapp}, mentioning order <strong>${safeLabel}</strong>. We will confirm it and get your order moving.`,
      rows,
    });
  }

  // A short, honest outline of what comes next — no delivery promises, since
  // none are configured anywhere.
  buildCustomerNextStepsHtml(order) {
    const city = this.escapeHtml(order.shippingAddress?.city || 'your address');
    let steps;

    if (order.isPaid) {
      steps = [
        'We prepare your order.',
        `We deliver it to ${city}.`,
        'If anything about your order changes, we will get in touch.',
      ];
    } else if (order.paymentMethod === 'Cash') {
      steps = [
        'We confirm your order and delivery details with you.',
        `We prepare it and deliver it to ${city}.`,
        'You pay in cash when it arrives.',
      ];
    } else {
      steps = [
        'You complete your payment (details above).',
        'We confirm it and prepare your order.',
        `We deliver it to ${city}.`,
      ];
    }

    return `<ol class="steps">${steps.map((step) => `<li>${step}</li>`).join('')}</ol>`;
  }

  /**
   * The admin's to-do list for a new order. Always says how this one is being
   * paid for, and calls out anything that needs a human before it can ship.
   */
  buildAdminAttentionHtml(order) {
    const total = this.escapeHtml(this.formatCurrency(order.totalPrice));
    const method = this.escapeHtml(order.paymentMethod);
    const items = [];

    if (order.isPaid) {
      items.push(`<strong>Paid</strong> by ${method} — ${total}. Nothing to collect.`);
    } else if (order.paymentMethod === 'Cash') {
      items.push(`<strong>Cash on delivery</strong> — collect ${total} when it is delivered.`);
    } else if (PREPAID_METHODS.includes(order.paymentMethod)) {
      items.push(
        `<strong>Awaiting ${method} payment</strong> of ${total}. The customer has been given the account details and asked to send their receipt on WhatsApp — confirm the payment on the order once it arrives.`
      );
    } else {
      items.push(`<strong>Payment pending</strong> (${method}) — ${total}.`);
    }

    if (order.isCustomShippingCity) {
      items.push(
        `<strong>Delivery rate needed.</strong> “${this.escapeHtml(order.shippingAddress?.city || 'Unknown')}” is not in your shipping list, so no delivery was charged. Agree a rate with the customer before they pay.`
      );
    }

    return `<ul class="attention">${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
  }

  // Plain-text twin of each email: for clients that do not render HTML, and
  // because mail with a text part is judged less harshly by spam filters.
  buildOrderText(order, lines) {
    const items = (order.items || []).map((item) => {
      const name = item.product?.name || 'Product';
      const quantity = Number(item.quantity || 0);
      const price = Number(item.price || item.product?.price || 0);
      return `  - ${name} x${quantity}  ${this.formatCurrency(price * quantity)}`;
    });

    const address = order.shippingAddress || {};

    return [
      ...lines,
      '',
      'Items',
      ...items,
      '',
      `Subtotal: ${this.formatCurrency(order.itemsPrice)}`,
      `Shipping: ${this.formatShippingPrice(order)}`,
      `Total: ${this.formatCurrency(order.totalPrice)}`,
      '',
      'Shipping address',
      [address.street, [address.city, address.zipCode].filter(Boolean).join(', '), address.phone]
        .filter(Boolean)
        .join('\n'),
    ].join('\n');
  }

  // `{{>name}}` pulls in emails/partials/name.html, which is how every email
  // shares one header, footer and stylesheet. One level deep, which is all the
  // layout needs.
  async includePartials(template) {
    const includes = [...new Set([...template.matchAll(/{{>\s*(\w+)\s*}}/g)].map((m) => m[1]))];

    for (const name of includes) {
      const partial = await fs.readFile(path.join(this.templatesDir, 'partials', `${name}.html`), 'utf8');
      template = template.replace(new RegExp(`{{>\\s*${name}\\s*}}`, 'g'), () => partial);
    }

    return template;
  }

  async loadTemplate(templateName, variables = {}) {
    try {
      const templatePath = path.join(this.templatesDir, `${templateName}.html`);
      const raw = await fs.readFile(templatePath, 'utf8');
      const template = await this.includePartials(raw);

      const values = { year: new Date().getFullYear(), ...variables };

      // One pass over the template: a value is printed as text and never scanned
      // again, so a customer's "{{otp}}" or "$&" in an address cannot turn into
      // anything. A placeholder nobody supplied prints nothing rather than itself.
      return template.replace(/{{\s*(\w+)\s*}}/g, (_match, key) => {
        const value = values[key];
        return value === undefined || value === null ? '' : String(value);
      });
    } catch (error) {
      console.error(`Error loading template ${templateName}:`, error);
      throw new Error(`Template ${templateName} not found`);
    }
  }

  // The stickers and logo are referenced as `cid:name` in the templates and
  // travel inside the message, so they show up without any hosting and without a
  // mail client asking to "load remote images".
  buildInlineAttachments(html) {
    const names = [...new Set([...String(html || '').matchAll(/cid:([a-z0-9_-]+)/gi)].map((m) => m[1]))];

    return names
      .map((name) => ({
        filename: `${name}.png`,
        path: path.join(this.templatesDir, 'assets', `${name}.png`),
        cid: name,
      }))
      .filter((attachment) => fsSync.existsSync(attachment.path));
  }

  async sendEmail(options) {
    const { to, subject, html, text, attachments, replyTo } = options;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html,
      text,
      attachments: [...(attachments || []), ...this.buildInlineAttachments(html)],
      ...(replyTo && { replyTo })
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending email:', error);
      throw new AppError(`Failed to send email: ${error.message}`, {
        statusCode: 502,
        code: 'EMAIL_SEND_FAILED',
        cause: error,
      });
    }
  }

  async sendWelcomeEmail(userEmail, userName, loginUrl) {
    try {
      const html = await this.loadTemplate('welcome', {
        name: this.escapeHtml(userName || 'friend'),
        loginUrl: loginUrl || `${this.getClientUrl()}/login`,
        emailTitle: 'Welcome to Kursimeyz',
        preheader: 'Your account is ready — come and find your favourite seat.',
        footerNote: 'You are receiving this because you created a Kursimeyz account.'
      });

      return await this.sendEmail({
        to: userEmail,
        subject: 'Welcome home to Kursimeyz 🪑',
        html
      });
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(userEmail, userName, resetUrl, expiryHours = 2) {
    try {
      const html = await this.loadTemplate('password-reset', {
        name: this.escapeHtml(userName || 'there'),
        resetUrl,
        expiryTime: expiryHours,
        emailTitle: 'Reset your Kursimeyz password',
        preheader: 'Choose a new password for your account.',
        footerNote: 'You are receiving this because a password reset was requested for your account.'
      });

      return await this.sendEmail({
        to: userEmail,
        subject: 'Reset Your Kursimeyz Password',
        html
      });
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }

  async sendCourseEnrollmentEmail(userEmail, userName, courseDetails) {
    try {
      const html = await this.loadTemplate('course-enrollment', {
        name: this.escapeHtml(userName || 'there'),
        courseTitle: this.escapeHtml(courseDetails.title),
        instructorName: this.escapeHtml(courseDetails.instructor),
        courseDuration: this.escapeHtml(courseDetails.duration),
        courseLevel: this.escapeHtml(courseDetails.level),
        courseUrl: courseDetails.url,
        emailTitle: `Enrolled in ${courseDetails.title}`,
        preheader: 'You are all set — here are the details.'
      });

      return await this.sendEmail({
        to: userEmail,
        subject: `🎉 Enrolled in ${courseDetails.title}`,
        html
      });
    } catch (error) {
      console.error('Error sending course enrollment email:', error);
      throw error;
    }
  }

  async sendCustomEmail(to, subject, templateName, variables = {}) {
    try {
      // The subject doubles as the document title unless the caller says otherwise.
      const html = await this.loadTemplate(templateName, { emailTitle: subject, ...variables });
      return await this.sendEmail({
        to,
        subject,
        html
      });
    } catch (error) {
      console.error('Error sending custom email:', error);
      throw error;
    }
  }

  async sendBulkEmails(recipients, subject, templateName, variables = {}) {
    const results = [];
    
    for (const recipient of recipients) {
      try {
        const recipientVariables = { ...variables, ...recipient.variables };
        const result = await this.sendCustomEmail(
          recipient.email,
          subject,
          templateName,
          recipientVariables
        );
        results.push({ email: recipient.email, success: true, ...result });
      } catch (error) {
        results.push({ email: recipient.email, success: false, error: error.message });
      }
    }
    
    return results;
  }

  // The customer's email: reassurance, what happens next, and — depending on how
  // they are paying — exactly what to do about it.
  async sendCustomerOrderConfirmation(user, order) {
    if (!user?.email) {
      throw new Error('Customer email is missing');
    }

    const label = orderLabel(order, 8);
    const settings = await this.getPaymentSettings();

    const variables = {
      ...this.getOrderVariables(user, order),
      paymentBlock: this.buildCustomerPaymentHtml(order, label, settings),
      nextSteps: this.buildCustomerNextStepsHtml(order),
      emailTitle: `Your Kursimeyz order ${label}`,
      preheader: `Order ${this.escapeHtml(label)} is confirmed — here is a copy, and what happens next.`,
      footerNote: 'You are receiving this because an order was placed from your account.',
      supportLine: settings.whatsappNumber
        ? `Questions? Reply to this email or message us on WhatsApp at ${this.escapeHtml(settings.whatsappNumber)}.`
        : 'Questions? Just reply to this email.',
    };
    const html = await this.loadTemplate('order-confirmation', variables);

    const text = this.buildOrderText(order, [
      `Thank you for your order, ${this.getPlainName(user)}!`,
      `Order ${label} · ${this.formatDate(order.createdAt)}`,
      `Payment: ${order.paymentMethod} (${this.getPaymentStatus(order)})`,
      `View your orders: ${variables.ordersUrl}`,
    ]);

    return this.sendEmail({
      to: user.email,
      subject: `Your Kursimeyz order ${label} is confirmed`,
      html,
      text,
    });
  }

  // The admin's email: not a receipt but a work item — how much, who, how it is
  // being paid, and what needs doing before it can ship.
  async sendAdminOrderNotification(adminEmails, user, order) {
    const recipients = Array.isArray(adminEmails)
      ? adminEmails.filter(Boolean)
      : [adminEmails].filter(Boolean);

    if (recipients.length === 0) {
      throw new Error('Admin email recipient is missing');
    }

    const label = orderLabel(order, 8);
    const variables = {
      ...this.getOrderVariables(user, order),
      attentionBlock: this.buildAdminAttentionHtml(order),
      emailTitle: `New order ${label}`,
      preheader: `${this.escapeHtml(this.formatCurrency(order.totalPrice))} from ${this.escapeHtml(this.getPlainName(user))} · ${this.escapeHtml(order.paymentMethod)} (${this.escapeHtml(this.getPaymentStatus(order))})`,
      footerNote: 'Internal notification for the Kursimeyz team.',
    };
    const html = await this.loadTemplate('admin-order-notification', variables);

    const text = this.buildOrderText(order, [
      `New order ${label} — ${this.formatCurrency(order.totalPrice)}`,
      `Customer: ${this.getPlainName(user)}${user?.email ? ` <${user.email}>` : ''}`,
      `Phone: ${this.getPhone(user, order) || '—'}`,
      `Payment: ${order.paymentMethod} (${this.getPaymentStatus(order)})`,
      `Open in admin: ${variables.adminOrderUrl}`,
    ]);

    return this.sendEmail({
      to: recipients,
      subject: `New order ${label} · ${this.formatCurrency(order.totalPrice)} · ${this.getPlainName(user)}`,
      html,
      text,
      // Replying to the alert reaches the customer, not the shop's own inbox.
      replyTo: user?.email || undefined,
    });
  }
}

module.exports = new EmailService();
