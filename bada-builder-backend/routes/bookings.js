import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { createOrder, verifyPayment } from '../services/razorpay.js';
import { sendEmail } from '../utils/sendEmail.js'; // Brevo API - for OTP/auth only
import { sendBookingConfirmationEmail, sendAdminBookingNotification } from '../services/bookingEmailService.js'; // SMTP - for bookings

const router = express.Router();

// Create booking
// Create booking
router.post(
  '/',
  authenticate,
  [
    body('property_id').optional({ nullable: true }).isInt(),
    body('visit_date').notEmpty(),
    body('visit_time').notEmpty(),
    body('person1_name').trim().notEmpty(),
    body('number_of_people').isInt({ min: 1, max: 3 }),
  ],
  async (req, res) => {
    try {
      console.log('📦 Booking Request Body:', req.body); // DEBUG LOG
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        property_id,
        visit_date,
        visit_time,
        number_of_people,
        person1_name,
        person2_name,
        person3_name,
        pickup_address,
        location_from_map,
        latitude,
        longitude,
        payment_method = 'postvisit',
        property_title, // Allow frontend to send title for generic visits
      } = req.body;

      let bookingPropertyTitle = property_title || 'General Site Visit';
      let bookingPropertyLocation = 'Not Specified';
      let bookingPropertyId = null;

      // Normalize property_id
      let finalPropertyId = property_id;
      if (finalPropertyId === 'null' || finalPropertyId === 'undefined' || finalPropertyId === 'unknown') {
        finalPropertyId = null;
      }

      // If property_id is provided, verify it exists and get details
      if (finalPropertyId) {
        const propertyResult = await pool.query('SELECT * FROM properties WHERE id = $1', [finalPropertyId]);
        if (propertyResult.rows.length > 0) {
          const property = propertyResult.rows[0];
          bookingPropertyTitle = property.title;
          bookingPropertyLocation = property.location;
          bookingPropertyId = property.id;
        } else {
          // If ID provided but not found, fail or treat as generic? 
          // Failing is safer to avoid data inconsistency if client intended valid property
          return res.status(404).json({ error: `Property not found (ID: ${finalPropertyId})` });
        }
      }

      // Get user email
      const userResult = await pool.query('SELECT email FROM users WHERE id = $1', [req.user.id]);
      const userEmail = userResult.rows[0].email;

      // Create booking
      const bookingResult = await pool.query(
        `INSERT INTO bookings (
          property_id, property_title, property_location, user_id, user_email,
          visit_date, visit_time, number_of_people, person1_name, person2_name,
          person3_name, pickup_address, location_from_map, pickup_latitude, 
          pickup_longitude, payment_method
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING *`,
        [
          bookingPropertyId,
          bookingPropertyTitle,
          bookingPropertyLocation,
          req.user.id,
          userEmail,
          visit_date,
          visit_time,
          number_of_people,
          person1_name,
          person2_name || null,
          person3_name || null,
          pickup_address || null,
          location_from_map || null,
          latitude ? parseFloat(latitude) : null,
          longitude ? parseFloat(longitude) : null,
          payment_method,
        ]
      );

      const booking = bookingResult.rows[0];

      // If previsit payment, create Razorpay order
      if (payment_method === 'razorpay_previsit') {
        try {
          const order = await createOrder(300, 'INR', `booking_${booking.id}`);

          res.status(201).json({
            booking,
            payment: {
              orderId: order.id,
              amount: 300,
              currency: 'INR',
            },
          });
        } catch (error) {
          console.error('Razorpay order creation failed:', error);
          res.status(201).json({
            booking,
            payment: null,
            error: 'Payment order creation failed',
          });
        }
      } else {
        // Post-visit payment - send confirmation email via SMTP
        sendBookingConfirmationEmail({
          booking_id: booking.id,
          property_name: booking.property_title,
          visit_date: booking.visit_date,
          visit_time: booking.visit_time,
          amount: 0, // Post-visit, no upfront payment
          user_email: userEmail,
          user_phone: req.user.phone || 'Not provided',
          person1_name: booking.person1_name,
          person2_name: booking.person2_name,
          person3_name: booking.person3_name
        }).catch(err => {
          console.error('❌ [Booking] Email sending failed (non-critical):', err.message);
        });

        // 2. Send Admin Notification
        sendAdminBookingNotification({
          booking_id: booking.id,
          property_name: booking.property_title,
          property_location: bookingPropertyLocation,
          visit_date: booking.visit_date,
          visit_time: booking.visit_time,
          amount: 0,
          payment_method: 'Post-Visit (Pay at Site)',
          user_email: userEmail,
          user_phone: req.user.phone || 'Not provided',
          person1_name: booking.person1_name,
          person2_name: booking.person2_name,
          person3_name: booking.person3_name,
          pickup_address: pickup_address
        }).catch(err => console.error('Error sending admin email:', err));

        res.status(201).json({ booking });
      }
    } catch (error) {
      console.error('Create booking error:', error);
      res.status(500).json({ error: 'Failed to create booking' });
    }
  }
);

// Verify payment and update booking
router.post('/verify-payment', authenticate, async (req, res) => {
  try {
    const { booking_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Verify payment
    const isValid = verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    if (!isValid) {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    // Update booking
    const result = await pool.query(
      `UPDATE bookings SET
        payment_status = 'completed',
        razorpay_payment_id = $1,
        payment_amount = $2,
        payment_currency = 'INR',
        payment_timestamp = CURRENT_TIMESTAMP,
        status = 'confirmed',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 AND user_id = $4
      RETURNING *`,
      [razorpay_payment_id, 300, booking_id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = result.rows[0];

    // Send booking confirmation email via SMTP (to user + admin BCC)
    // This runs asynchronously and won't block the response
    sendBookingConfirmationEmail({
      booking_id: booking.id,
      property_name: booking.property_title,
      visit_date: booking.visit_date,
      visit_time: booking.visit_time,
      amount: booking.payment_amount || 300,
      user_email: booking.user_email,
      user_phone: req.user.phone || 'Not provided',
      person1_name: booking.person1_name,
      person2_name: booking.person2_name,
      person3_name: booking.person3_name
    }).catch(err => {
      // Log error but don't fail the request
      console.error('❌ [Booking] Email sending failed (non-critical):', err.message);
    });

    // Send Admin Notification
    sendAdminBookingNotification({
      booking_id: booking.id,
      property_name: booking.property_title,
      property_location: 'Not available in payment context', // Ideally fetch or store this
      visit_date: booking.visit_date,
      visit_time: booking.visit_time,
      amount: booking.payment_amount || 300,
      payment_method: 'Online Payment (Razorpay)',
      user_email: booking.user_email,
      user_phone: req.user.phone || 'Not provided',
      person1_name: booking.person1_name,
      person2_name: booking.person2_name,
      person3_name: booking.person3_name,
      pickup_address: booking.pickup_address
    }).catch(err => console.error('Error sending admin email:', err));

    res.json({ booking, message: 'Payment verified successfully' });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

// Get user's bookings
router.get('/my-bookings', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, p.image_url as property_image
       FROM bookings b
       LEFT JOIN properties p ON b.property_id = p.id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );

    res.json({ bookings: result.rows });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get single booking
router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, p.image_url as property_image
       FROM bookings b
       LEFT JOIN properties p ON b.property_id = p.id
       WHERE b.id = $1 AND b.user_id = $2`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ booking: result.rows[0] });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

export default router;
