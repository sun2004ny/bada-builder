/**
 * Test Brevo OTP Email Sending
 * Run this to verify Brevo SMTP is working before deploying
 */

import dotenv from 'dotenv';
import { sendOtpEmail } from './services/email-brevo-final.js';

dotenv.config();

console.log('🧪 Testing Brevo OTP Email Service...\n');

// Test configuration
const testEmail = 'sunny260604@gmail.com'; // Your Gmail for testing
const testOTP = '123456';
const testName = 'Test User';

console.log('Test Configuration:');
console.log('  To:', testEmail);
console.log('  OTP:', testOTP);
console.log('  Name:', testName);
console.log('');

console.log('📧 Sending test OTP email via Brevo...\n');

sendOtpEmail(testEmail, testOTP, testName)
  .then((result) => {
    if (result.success) {
      console.log('✅ TEST PASSED!');
      console.log('   Email sent successfully');
      console.log('   Message ID:', result.messageId);
      console.log('');
      console.log('🎉 Brevo OTP email service is working!');
      console.log(`   Check your inbox: ${testEmail}`);
      console.log('   Look for an email with OTP: 123456');
      console.log('');
      console.log('✅ Ready to deploy!');
      process.exit(0);
    } else {
      console.log('❌ TEST FAILED!');
      console.log('   Error:', result.error);
      console.log('   Code:', result.code);
      console.log('');
      console.log('🔧 Troubleshooting:');
      console.log('   1. Check Brevo credentials in .env');
      console.log('   2. Verify BREVO_EMAIL is a verified sender in Brevo dashboard');
      console.log('   3. Check Brevo account status');
      console.log('   4. Make sure SMTP password is correct');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.log('❌ TEST FAILED WITH EXCEPTION!');
    console.log('   Error:', error.message);
    console.log('   Stack:', error.stack);
    process.exit(1);
  });
