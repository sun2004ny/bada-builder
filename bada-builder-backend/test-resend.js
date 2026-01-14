/**
 * Test Resend Email Service
 */

import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

console.log('🧪 Testing Resend Email Service...\n');

const resend = new Resend(process.env.RESEND_API_KEY);

console.log('Configuration:');
console.log('  API Key:', process.env.RESEND_API_KEY ? '***' + process.env.RESEND_API_KEY.slice(-6) : 'NOT SET');
console.log('  From:', process.env.RESEND_FROM || 'onboarding@resend.dev');
console.log('');

console.log('📧 Sending test email...\n');

resend.emails.send({
  from: process.env.RESEND_FROM || 'Bada Builder <onboarding@resend.dev>',
  to: 'sunny260604@gmail.com',
  subject: 'Test Email from Bada Builder',
  html: '<p>Congrats! Your <strong>Resend email service</strong> is working perfectly! 🎉</p>'
})
.then((data) => {
  console.log('✅ Email sent successfully!');
  console.log('   Message ID:', data.id);
  console.log('');
  console.log('🎉 Resend is configured correctly!');
  console.log('   Check your inbox: sunny260604@gmail.com');
  process.exit(0);
})
.catch((error) => {
  console.log('❌ Email sending failed:');
  console.log('   Error:', error.message);
  console.log('');
  console.log('🔧 Troubleshooting:');
  console.log('   1. Check your API key at: https://resend.com/api-keys');
  console.log('   2. Make sure RESEND_API_KEY is set in .env');
  console.log('   3. Verify your Resend account is active');
  process.exit(1);
});
