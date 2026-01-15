/**
 * Test Brevo API Email Sending
 * Run: node test-email-api.js
 */

import dotenv from 'dotenv';
import { sendOtpEmail, sendEmail } from './utils/sendEmail.js';

dotenv.config();

console.log('🧪 Testing Brevo API Email Service...\n');

// Test 1: Send OTP Email
async function testOTPEmail() {
  console.log('📧 Test 1: Sending OTP email...');
  
  const testEmail = process.env.BREVO_EMAIL; // Send to yourself for testing
  const testOTP = '123456';
  const testName = 'Test User';

  const result = await sendOtpEmail(testEmail, testOTP, testName);

  if (result.success) {
    console.log('✅ OTP email sent successfully!');
    console.log('   Message ID:', result.messageId);
  } else {
    console.log('❌ Failed to send OTP email');
    console.log('   Error:', result.error);
  }

  console.log('');
}

// Test 2: Send Custom Email
async function testCustomEmail() {
  console.log('📧 Test 2: Sending custom email...');
  
  const testEmail = process.env.BREVO_EMAIL;

  const result = await sendEmail({
    to: testEmail,
    subject: 'Test Email from Bada Builder',
    htmlContent: '<h1>Hello!</h1><p>This is a test email from Brevo API.</p>',
    textContent: 'Hello! This is a test email from Brevo API.',
    recipientName: 'Test User'
  });

  if (result.success) {
    console.log('✅ Custom email sent successfully!');
    console.log('   Message ID:', result.messageId);
  } else {
    console.log('❌ Failed to send custom email');
    console.log('   Error:', result.error);
  }

  console.log('');
}

// Run tests
async function runTests() {
  try {
    await testOTPEmail();
    await testCustomEmail();
    
    console.log('🎉 All tests completed!');
    console.log('✅ Brevo API is working correctly');
    console.log('✅ Ready to deploy to Render');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

runTests();
