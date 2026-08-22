const fs = require('fs').promises;
const path = require('path');
const { orderLabel } = require('../utils/orderNumber');
const { FINISH_PARTS, isFinishEmpty, normalizeFinish } = require('../utils/productFinish');
const { createTransporter } = require('../utils/nodemailer');

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

  buildOrderItemsHtml(order) {
    return (order.items || []).map((item) => {
      const productName = item.product?.name || 'Product';
      const quantity = Number(item.quantity || 0);
      const price = Number(item.price || item.product?.price || 0);
      // The order's own snapshot, so an old email reprint shows what was bought.
      const finish = normalizeFinish(item.finish);
      const finishHtml = isFinishEmpty(finish) ? '' : this.buildFinishHtml(finish);

      return `
        <tr>
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

  getOrderVariables(user, order) {
    const orderId = order._id?.toString() || '';

    return {
      customerName: this.escapeHtml(user?.username || 'Customer'),
      customerEmail: this.escapeHtml(user?.email || ''),
      customerPhone: this.escapeHtml(user?.phone || order.shippingAddress?.phone || ''),
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
      adminOrderUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/admin/orders/${orderId}`,
    };
  }

  async loadTemplate(templateName, variables = {}) {
    try {
      const templatePath = path.join(this.templatesDir, `${templateName}.html`);
      let template = await fs.readFile(templatePath, 'utf8');
      
      // Replace template variables
      for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        template = template.replace(regex, value || '');
      }
      
      return template;
    } catch (error) {
      console.error(`Error loading template ${templateName}:`, error);
      throw new Error(`Template ${templateName} not found`);
    }
  }

  async sendEmail(options) {
    const { to, subject, html, text, attachments } = options;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html,
      text,
      attachments
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async sendWelcomeEmail(userEmail, userName, loginUrl) {
    try {
      const html = await this.loadTemplate('welcome', {
        name: userName,
        loginUrl: loginUrl || 'https://kursimeyz.com/login'
      });

      return await this.sendEmail({
        to: userEmail,
        subject: 'Welcome to Kursimeyz! 🎉',
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
        name: userName,
        resetUrl,
        expiryTime: expiryHours
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
        name: userName,
        courseTitle: courseDetails.title,
        instructorName: courseDetails.instructor,
        courseDuration: courseDetails.duration,
        courseLevel: courseDetails.level,
        courseUrl: courseDetails.url
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
      const html = await this.loadTemplate(templateName, variables);
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

  async sendCustomerOrderConfirmation(user, order) {
    if (!user?.email) {
      throw new Error('Customer email is missing');
    }

    const variables = this.getOrderVariables(user, order);
    const html = await this.loadTemplate('order-confirmation', variables);

    return this.sendEmail({
      to: user.email,
      subject: `Kursimeyz Order Confirmation #${variables.shortOrderId}`,
      html,
    });
  }

  async sendAdminOrderNotification(adminEmails, user, order) {
    const recipients = Array.isArray(adminEmails)
      ? adminEmails.filter(Boolean)
      : [adminEmails].filter(Boolean);

    if (recipients.length === 0) {
      throw new Error('Admin email recipient is missing');
    }

    const variables = this.getOrderVariables(user, order);
    const html = await this.loadTemplate('admin-order-notification', variables);

    return this.sendEmail({
      to: recipients,
      subject: `New Kursimeyz Order #${variables.shortOrderId}`,
      html,
    });
  }
}

module.exports = new EmailService();
