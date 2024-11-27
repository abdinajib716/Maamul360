require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('🔄 Testing email configuration...');
  
  // Log environment variables (masked)
  console.log('\n📧 Email Configuration:');
  console.log('SMTP_HOST:', process.env.SMTP_HOST);
  console.log('SMTP_PORT:', process.env.SMTP_PORT);
  console.log('SMTP_USER:', process.env.SMTP_USER);
  console.log('SMTP_PASSWORD:', '*'.repeat(8));
  console.log('SMTP_FROM_EMAIL:', process.env.SMTP_FROM_EMAIL);
  console.log('SMTP_FROM_NAME:', process.env.SMTP_FROM_NAME);

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Verify connection configuration
    console.log('\n🔍 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!');

    // Try to send a test email
    console.log('\n📨 Sending test email...');
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to: process.env.SMTP_USER,
      subject: 'Maamul360 Email Test',
      text: 'If you receive this email, your email configuration is working correctly.',
      html: '<h1>Maamul360 Email Test</h1><p>If you receive this email, your email configuration is working correctly.</p>',
    });

    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    
  } catch (error) {
    console.error('\n❌ Email test failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.response) {
      console.error('SMTP Response:', error.response);
    }
    process.exit(1);
  }
}

testEmail();
