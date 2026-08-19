const fs = require('fs').promises;
const path = require('path');
const { orderLabel } = require('../utils/orderNumber');
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

  buildOrderItemsHtml(order) {
    return (order.items || []).map((item) => {
      const productName = item.product?.name || 'Product';
      const quantity = Number(item.quantity || 0);
      const price = Number(item.price || item.product?.price || 0);

      return `
        <tr>
          <td>${this.escapeHtml(productName)}</td>
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
      shippingPrice: this.formatCurrency(order.shippingPrice),
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
