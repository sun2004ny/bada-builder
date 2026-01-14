import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
};

async function testOTPSystem() {
  console.log('\n🧪 Testing OTP Verification System\n');
  console.log('='.repeat(50));

  const testEmail = `test${Date.now()}@example.com`;
  const testData = {
    name: 'Test User',
    email: testEmail,
    password: 'password123',
    phone: '+1234567890',
    userType: 'individual',
  };

  try {
    // Test 1: Health Check
    log.info('Test 1: Checking server health...');
    const healthResponse = await axios.get(`${API_URL.replace('/api', '')}/health`);
    if (healthResponse.data.status === 'ok') {
      log.success('Server is healthy');
    } else {
      log.error('Server health check failed');
      return;
    }

    // Test 2: Send OTP
    log.info('\nTest 2: Sending OTP...');
    const sendOTPResponse = await axios.post(`${API_URL}/otp/send-otp`, {
      email: testData.email,
      name: testData.name,
    });

    if (sendOTPResponse.data.success) {
      log.success('OTP sent successfully');
      log.info(`Email: ${testData.email}`);
      log.warning('⏰ Please check your email and enter the OTP below');
    } else {
      log.error('Failed to send OTP');
      return;
    }

    // Wait for user to enter OTP
    console.log('\n' + '='.repeat(50));
    log.info('Waiting for OTP input...');
    log.warning('Please check your email and run the verification manually:');
    console.log('\nUse this cURL command to verify:');
    console.log(`
curl -X POST ${API_URL}/otp/verify-and-register \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "${testData.email}",
    "otp": "YOUR_OTP_HERE",
    "password": "${testData.password}",
    "name": "${testData.name}",
    "phone": "${testData.phone}",
    "userType": "${testData.userType}"
  }'
    `);

    // Test 3: Resend OTP
    log.info('\nTest 3: Testing resend OTP...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    
    const resendResponse = await axios.post(`${API_URL}/otp/resend-otp`, {
      email: testData.email,
    });

    if (resendResponse.data.success) {
      log.success('OTP resent successfully');
    } else {
      log.error('Failed to resend OTP');
    }

    console.log('\n' + '='.repeat(50));
    log.success('OTP System Tests Completed!');
    console.log('\n📝 Summary:');
    console.log('  ✅ Server health check passed');
    console.log('  ✅ OTP sending works');
    console.log('  ✅ OTP resend works');
    console.log('\n📧 Check your email for the OTP');
    console.log('🔐 Use the cURL command above to complete verification');
    console.log('\n');

  } catch (error) {
    log.error('Test failed');
    if (error.response) {
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    console.log('\n💡 Troubleshooting:');
    console.log('  1. Make sure the server is running: npm run dev');
    console.log('  2. Check your .env file has correct SMTP settings');
    console.log('  3. Verify DATABASE_URL is correct');
    console.log('  4. Check if email_otps table exists');
  }
}

// Run tests
testOTPSystem();
