# Kursimeyz Email System

A complete email system built with Nodemailer for sending transactional emails in the Kursimeyz application.

## 📁 Structure

```
server/
├── utils/
│   ├── nodemailer.js          # Nodemailer transporter configuration
│   ├── emailService.js        # Main email service class
│   ├── emailTest.js           # Email testing utilities
│   └── emailExamples.js       # Usage examples
└── emails/
    ├── welcome.html           # Welcome email template
    ├── password-reset.html    # Password reset template
    ├── course-enrollment.html # Course enrollment template
    └── README.md             # This file
```

## ⚙️ Setup

### 1. Environment Variables

Make sure you have these environment variables in your `.env` file:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

**Important:** For Gmail, use an App Password instead of your regular password:
1. Go to Google Account settings
2. Enable 2-Step Verification
3. Generate an App Password for "Mail"
4. Use that App Password in `EMAIL_PASS`

### 2. Dependencies

Install required packages:

```bash
npm install nodemailer dotenv
```

## 📧 Available Email Templates

### 1. Welcome Email (`welcome.html`)
- **Purpose:** Sent when a new user registers
- **Variables:** `{{name}}`, `{{loginUrl}}`

### 2. Password Reset (`password-reset.html`)
- **Purpose:** Password reset requests
- **Variables:** `{{name}}`, `{{resetUrl}}`, `{{expiryTime}}`

### 3. Course Enrollment (`course-enrollment.html`)
- **Purpose:** Confirm course enrollment
- **Variables:** `{{name}}`, `{{courseTitle}}`, `{{instructorName}}`, `{{courseDuration}}`, `{{courseLevel}}`, `{{courseUrl}}`

## 🚀 Usage

### Basic Usage

```javascript
const emailService = require('./utils/emailService');

// Send welcome email
await emailService.sendWelcomeEmail(
  'user@example.com',
  'John Doe',
  'https://kursimeyz.com/login'
);

// Send password reset
await emailService.sendPasswordResetEmail(
  'user@example.com',
  'John Doe',
  'https://kursimeyz.com/reset-password?token=abc123',
  2 // expires in 2 hours
);

// Send course enrollment confirmation
await emailService.sendCourseEnrollmentEmail(
  'user@example.com',
  'John Doe',
  {
    title: 'JavaScript Fundamentals',
    instructor: 'John Smith',
    duration: '6 weeks',
    level: 'Beginner',
    url: 'https://kursimeyz.com/course/js-fundamentals'
  }
);
```

### Custom Templates

```javascript
// Send email with custom template
await emailService.sendCustomEmail(
  'user@example.com',
  'Custom Subject',
  'custom-template',
  {
    name: 'John Doe',
    customVariable: 'value'
  }
);
```

### Bulk Emails

```javascript
const recipients = [
  {
    email: 'user1@example.com',
    variables: { name: 'User One' }
  },
  {
    email: 'user2@example.com',
    variables: { name: 'User Two' }
  }
];

const results = await emailService.sendBulkEmails(
  recipients,
  'Bulk Email Subject',
  'bulk-template',
  { globalVariable: 'value' }
);
```

## 🧪 Testing

Run the email test suite:

```bash
node server/utils/emailTest.js
```

This will test:
1. Transporter verification
2. Welcome email sending
3. Password reset email sending
4. Course enrollment email sending

## 📝 Creating New Templates

1. Create a new HTML file in `server/emails/` (e.g., `new-template.html`)
2. Use `{{variableName}}` syntax for dynamic content
3. Use the template with `emailService.sendCustomEmail()`

### Template Example:

```html
<!DOCTYPE html>
<html>
<head>
    <title>{{subject}}</title>
</head>
<body>
    <h1>Hello {{name}}!</h1>
    <p>{{message}}</p>
    <a href="{{actionUrl}}">Take Action</a>
</body>
</html>
```

## 🔧 Configuration

### Gmail Configuration

The system is configured for Gmail by default. To use a different email service, modify `server/utils/nodemailer.js`:

```javascript
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'outlook', // or any other service
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};
```

### Custom SMTP Configuration

For custom SMTP servers:

```javascript
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: 'smtp.yourserver.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};
```

## 🛡️ Security Best Practices

1. **Never commit email credentials to version control**
2. **Use environment variables for all sensitive data**
3. **Use App Passwords for Gmail, not regular passwords**
4. **Implement rate limiting for email sending**
5. **Validate email addresses before sending**
6. **Use HTTPS for all links in emails**

## 📊 Error Handling

The email service includes comprehensive error handling:

```javascript
try {
  await emailService.sendWelcomeEmail(email, name, loginUrl);
  console.log('Email sent successfully');
} catch (error) {
  console.error('Email failed:', error.message);
  // Handle error appropriately
}
```

## 🔍 Monitoring

- Check console logs for email delivery status
- Monitor `messageId` for tracking emails
- Implement logging for production environments

## 📞 Support

For issues or questions:
1. Check the console logs for error messages
2. Verify environment variables are set correctly
3. Ensure email credentials are valid
4. Test with the provided test suite
