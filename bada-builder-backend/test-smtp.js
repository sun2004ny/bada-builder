/**
 * SMTP Connection Test Script
 * Run this to verify your Brevo credentials are correct
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Testing SMTP Connection...\n');

console.log('Configuration:');
console.log('  Host:', process.env.SMTP_HOST);
console.log('  Port:', process.env.SMTP_PORT);
console.log('  User:', process.env.SMTP_USER);
console.log('  Pass:', process.env.SMTP_PASS ? '***' + process.env.SMTP_PASS.slice(-4) : 'NOT SET');
console.log('');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

console.log('📧 Attempting to verify connection...\n');

transporter.verify(function (error, success) {
  if (error) {
    console.log('❌ SMTP Connection FAILED:');
    console.log('   Error:', error.message);
    console.log('   Code:', error.code);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('   1. Check your Brevo credentials at: https://app.brevo.com/settings/keys/smtp');
    console.log('   2. Make sure you copied the Master Password (not your account password)');
    console.log('   3. Verify your Brevo account is active');
    console.log('   4. Check if SMTP_USER is your Brevo login email');
    process.exit(1);
  } else {
    console.log('✅ SMTP Connection SUCCESSFUL!');
    console.log('   Server is ready to send emails');
    console.log('');
    console.log('🎉 Your Brevo configuration is correct!');
    console.log('   You can now send OTP emails.');
    process.exit(0);
  }
});
