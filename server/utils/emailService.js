const fs = require('fs').promises;
const path = require('path');
const { createTransporter } = require('./nodemailer');

class EmailService {
  constructor() {
    this.transporter = createTransporter();
    this.templatesDir = path.join(__dirname, '../emails');
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
}

module.exports = new EmailService();
