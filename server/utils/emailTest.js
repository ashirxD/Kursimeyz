const { verifyTransporter } = require('./nodemailer');
const emailService = require('./emailService');

const testEmailSetup = async () => {
  console.log('🔧 Testing email setup...\n');

  // Test transporter verification
  console.log('1. Verifying email transporter...');
  const isVerified = await verifyTransporter();
  
  if (!isVerified) {
    console.error('❌ Email transporter verification failed');
    return;
  }
  
  console.log('✅ Email transporter verified successfully\n');

  // Test welcome email
  console.log('2. Testing welcome email...');
  try {
    await emailService.sendWelcomeEmail(
      'test@example.com',
      'Test User',
      'https://kursimeyz.com/login'
    );
    console.log('✅ Welcome email test successful');
  } catch (error) {
    console.error('❌ Welcome email test failed:', error.message);
  }

  // Test password reset email
  console.log('3. Testing password reset email...');
  try {
    await emailService.sendPasswordResetEmail(
      'test@example.com',
      'Test User',
      'https://kursimeyz.com/reset-password?token=abc123',
      2
    );
    console.log('✅ Password reset email test successful');
  } catch (error) {
    console.error('❌ Password reset email test failed:', error.message);
  }

  // Test course enrollment email
  console.log('4. Testing course enrollment email...');
  try {
    await emailService.sendCourseEnrollmentEmail(
      'test@example.com',
      'Test User',
      {
        title: 'JavaScript Fundamentals',
        instructor: 'John Doe',
        duration: '6 weeks',
        level: 'Beginner',
        url: 'https://kursimeyz.com/course/js-fundamentals'
      }
    );
    console.log('✅ Course enrollment email test successful');
  } catch (error) {
    console.error('❌ Course enrollment email test failed:', error.message);
  }

  console.log('\n🎉 Email setup test completed!');
};

// Run test if this file is executed directly
if (require.main === module) {
  testEmailSetup().catch(console.error);
}

module.exports = { testEmailSetup };
