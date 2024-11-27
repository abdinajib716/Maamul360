require('dotenv').config({ path: '.env.local' });
const nodemailer = require('nodemailer');
const crypto = require('crypto');

async function testEmail() {
  console.log('🔄 Testing email configuration...');
  
  // Check required environment variables
  const requiredVars = [
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASSWORD',
    'SMTP_FROM_EMAIL',
    'SMTP_FROM_NAME',
    'NEXT_PUBLIC_APP_URL'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars.join(', '));
    process.exit(1);
  }

  // Log environment variables (masked)
  console.log('\n📧 Email Configuration:');
  console.log('SMTP_HOST:', process.env.SMTP_HOST);
  console.log('SMTP_PORT:', process.env.SMTP_PORT);
  console.log('SMTP_USER:', process.env.SMTP_USER);
  console.log('SMTP_PASSWORD:', '*'.repeat(8));
  console.log('SMTP_FROM_EMAIL:', process.env.SMTP_FROM_EMAIL);
  console.log('SMTP_FROM_NAME:', process.env.SMTP_FROM_NAME);
  console.log('APP_URL:', process.env.NEXT_PUBLIC_APP_URL);

  try {
    // Create transporter
    console.log('\n🔧 Creating SMTP transporter...');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      debug: true, // Enable debug logs
      logger: true // Log to console
    });

    // Verify connection configuration
    console.log('\n🔍 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!');

    // Generate test verification token
    const testToken = crypto.randomUUID();
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/verify-email?token=${encodeURIComponent(testToken)}`;

    // Create test email with verification link
    const emailTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #111827; margin-bottom: 10px;">Maamul360 Email Test</h1>
          <p style="color: #4b5563; font-size: 16px;">This is a test email to verify your email configuration.</p>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          <p style="margin-bottom: 20px;">Test verification link:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #0070f3; color: white; padding: 14px 28px; 
                      text-decoration: none; border-radius: 6px; display: inline-block;
                      font-size: 16px; font-weight: 500; letter-spacing: 0.5px;">
              Test Verification Link
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            Token: ${testToken}<br>
            Generated at: ${new Date().toISOString()}
          </p>
        </div>
      </div>
    `;

    // Try to send a test email
    console.log('\n📨 Sending test email...');
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to: process.env.SMTP_USER,
      subject: 'Maamul360 Email Configuration Test',
      text: `Email configuration test. Verification URL: ${verificationUrl}`,
      html: emailTemplate,
    });

    console.log('\n✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('\n📋 Test Summary:');
    console.log('- SMTP Connection: ✅');
    console.log('- Email Delivery: ✅');
    console.log('- Verification URL:', verificationUrl);
    console.log('\n⚠️ Next Steps:');
    console.log('1. Check your inbox (and spam folder) for the test email');
    console.log('2. Click the verification link to test the verification flow');
    console.log('3. Verify that the verification page loads correctly');
    
  } catch (error) {
    console.error('\n❌ Email test failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.code === 'EAUTH') {
      console.error('\n🔑 Authentication Error Tips:');
      console.log('1. Verify your Gmail app password is correct');
      console.log('2. Ensure 2FA is enabled on your Gmail account');
      console.log('3. Try generating a new app password');
    }
    
    if (error.code === 'ESOCKET') {
      console.error('\n🌐 Connection Error Tips:');
      console.log('1. Check your internet connection');
      console.log('2. Verify SMTP_HOST and SMTP_PORT are correct');
      console.log('3. Ensure your firewall isn\'t blocking the connection');
    }

    if (error.response) {
      console.error('\nSMTP Response:', error.response);
    }

    process.exit(1);
  }
}

testEmail();
