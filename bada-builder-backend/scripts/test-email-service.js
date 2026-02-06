
import dotenv from 'dotenv';
import { sendShortStayTravelerEmail, sendShortStayHostEmail } from '../services/shortStayEmailService.js';

dotenv.config();

const testEmail = async () => {
    console.log('Testing Email Service (Brevo)...');
    console.log('Brevo Config:', {
        apiKey: process.env.BREVO_API_KEY ? '****' : 'MISSING',
        sender: process.env.BREVO_EMAIL || 'MISSING'
    });

    const mockBookingData = {
        booking_id: 9999,
        property_title: 'Test Luxury Villa',
        property_image: 'https://via.placeholder.com/600x400',
        property_address: '123 Test St, Test City',
        check_in: new Date().toISOString(),
        check_out: new Date(Date.now() + 86400000).toISOString(),
        total_price: 15000,
        guests: { adults: 2, children: 1 },
        
        // Use the BREVO_EMAIL as both sender and recipient for testing to avoid spamming real people 
        guest_name: 'Test Traveler',
        guest_email: process.env.BREVO_EMAIL, // Send to self for test
        guest_phone: '1234567890',

        host_name: 'Test Host',
        host_email: process.env.BREVO_EMAIL, // Send to self for test
        host_contact: '0987654321'
    };

    try {
        console.log('Sending Traveler Email...');
        await sendShortStayTravelerEmail(mockBookingData);

        console.log('Sending Host Email...');
        await sendShortStayHostEmail(mockBookingData);

        console.log('Test Complete!');
    } catch (error) {
        console.error('Test Failed:', error);
    }
};

testEmail();
