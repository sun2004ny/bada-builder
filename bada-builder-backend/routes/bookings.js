import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { createOrder, verifyPayment } from '../services/razorpay.js';
import { sendSiteVisitConfirmation } from '../services/email.js';

const router = express.Router();

// Create booking
router.post(
  '/',
  authenticate,
  [
    body('property_id').isInt(),
    body('visit_date').notEmpty(),
    body('visit_time').notEmpty(),
    body('person1_name').trim().notEmpty(),
    body('number_of_people').isInt({ min: 1, max: 3 }),
  ],
  async (req, res) => {
    try {
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
        payment_method = 'postvisit',
      } = req.body;

      // Get property details
      const propertyResult = await pool.query('SELECT * FROM properties WHERE id = $1', [property_id]);
      if (propertyResult.rows.length === 0) {
        return res.status(404).json({ error: 'Property not found' });
      }

      const property = propertyResult.rows[0];

      // Get user email
      const userResult = await pool.query('SELECT email FROM users WHERE id = $1', [req.user.id]);
      const userEmail = userResult.rows[0].email;

      // Create booking
      const bookingResult = await pool.query(
        `INSERT INTO bookings (
          property_id, property_title, property_location, user_id, user_email,
          visit_date, visit_time, number_of_people, person1_name, person2_name,
          person3_name, pickup_address, payment_method
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *`,
        [
          property_id,
          property.title,
          property.location,
          req.user.id,
          userEmail,
          visit_date,
          visit_time,
          number_of_people,
          person1_name,
          person2_name || null,
          person3_name || null,
          pickup_address || null,
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
        // Send confirmation email
        sendSiteVisitConfirmation(userEmail, booking).catch(err => 
          console.error('Confirmation email failed:', err)
        );

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

    // Send confirmation email
    sendSiteVisitConfirmation(booking.user_email, booking).catch(err =>
      console.error('Confirmation email failed:', err)
    );

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
