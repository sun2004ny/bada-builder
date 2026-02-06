import express from 'express';
import pool from '../config/database.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { uploadMultipleImages } from '../services/cloudinary.js';
import { sendShortStayTravelerEmail, sendShortStayHostEmail } from '../services/shortStayEmailService.js';

const router = express.Router();

// --- 1. Create New Short Stay Listing ---
router.post('/', authenticate, upload.array('images', 30), async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      title, description, category,
      location, pricing, rules, policies,
      amenities, specific_details
    } = req.body;

    // Handle Image Uploads
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      const buffers = req.files.map(file => file.buffer);
      imageUrls = await uploadMultipleImages(buffers, 'short_stay');
    }

    // Insert into DB
    const result = await client.query(
      `INSERT INTO short_stay_properties (
        user_id, title, description, category,
        location, pricing, rules, policies,
        amenities, specific_details, images,
        cover_image
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        req.user.id,
        title,
        description,
        category,
        typeof location === 'string' ? JSON.parse(location) : location,
        typeof pricing === 'string' ? JSON.parse(pricing) : pricing,
        typeof rules === 'string' ? JSON.parse(rules) : rules,
        typeof policies === 'string' ? JSON.parse(policies) : policies,
        typeof amenities === 'string' ? JSON.parse(amenities) : amenities, // Should be array of strings
        typeof specific_details === 'string' ? JSON.parse(specific_details) : specific_details,
        imageUrls,
        imageUrls.length > 0 ? imageUrls[0] : null // Set first image as cover by default
      ]
    );

    res.status(201).json({ 
      message: 'Property listed successfully', 
      property: result.rows[0] 
    });

  } catch (error) {
    console.error('Create Short Stay Error:', error);
    res.status(500).json({ error: 'Failed to list property' });
  } finally {
    client.release();
  }
});

// Helper to calculate guest pricing (Host Price + 5%)
const calculateGuestPricing = (pricing) => {
  if (!pricing) return null;
  const markup = 1.05;
  const guestPricing = { ...pricing };

  if (guestPricing.perNight) guestPricing.perNight = Math.ceil(Number(guestPricing.perNight) * markup);
  if (guestPricing.weekly) guestPricing.weekly = Math.ceil(Number(guestPricing.weekly) * markup);
  if (guestPricing.monthly) guestPricing.monthly = Math.ceil(Number(guestPricing.monthly) * markup);
  if (guestPricing.cleaning) guestPricing.cleaning = Math.ceil(Number(guestPricing.cleaning) * markup);
  if (guestPricing.security) guestPricing.security = Math.ceil(Number(guestPricing.security) * markup);
  
  return guestPricing;
};

// --- 2. Get All Listings (Search & Filters) ---
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { 
      location, checkIn, checkOut, guests, 
      type, minPrice, maxPrice, limit = 50, offset = 0 
    } = req.query;

    let query = `
      SELECT p.*,
      EXISTS(SELECT 1 FROM short_stay_favorites f WHERE f.property_id = p.id AND f.user_id = $1) as is_favorite
      FROM short_stay_properties p
      WHERE status = 'active'
    `;
    const params = [req.user ? req.user.id : null];
    let paramCount = 2;

    // --- Filters ---
    if (type) {
      query += ` AND category = $${paramCount++}`;
      params.push(type);
    }
    
    if (location) {
      // Search in city, state, or address
      query += ` AND (
        (location->>'city') ILIKE $${paramCount} OR 
        (location->>'state') ILIKE $${paramCount} OR
        (location->>'address') ILIKE $${paramCount}
      )`;
      params.push(`%${location}%`);
      paramCount++;
    }

    // Price Filter (Adjusted for 5% Markup)
    // User filters by Guest Price (e.g., Max 1000). Host Price should be <= 1000 / 1.05
    if (minPrice) {
      query += ` AND (pricing->>'perNight')::numeric >= $${paramCount++}`;
      params.push(Math.floor(Number(minPrice) / 1.05));
    }
    if (maxPrice) {
      query += ` AND (pricing->>'perNight')::numeric <= $${paramCount++}`;
      params.push(Math.ceil(Number(maxPrice) / 1.05));
    }
    
    // Guest Capacity Filter
    if (guests) {
      query += ` AND (specific_details->>'maxGuests')::int >= $${paramCount++}`;
      params.push(guests);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);
    
    const propertiesWithGuestPricing = result.rows.map(p => ({
      ...p,
      guest_pricing: calculateGuestPricing(p.pricing)
    }));

    res.json({ 
      properties: propertiesWithGuestPricing,
      count: result.rows.length
    });

  } catch (error) {
    console.error('Fetch Short Stay Error:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// --- 1.1 Analytics: Revenue Summary ---
router.get('/analytics/revenue-summary', authenticate, async (req, res) => {
    try {
        const hostId = req.user.id;
        
        // Helper queries for different periods
        const queryRevenue = async (interval) => {
            const timeFilter = interval 
                ? `AND check_in >= NOW() - INTERVAL '${interval}'` 
                : ''; // All time if no interval
                
            const result = await pool.query(
                `SELECT COALESCE(SUM(total_price), 0) as total 
                 FROM short_stay_reservations 
                 WHERE host_id = $1 AND status = 'confirmed' ${timeFilter}`,
                [hostId]
            );
            return Number(result.rows[0].total);
        };

        const [
            totalRevenue,
            revenue30Days,
            revenue90Days,
            revenue180Days,
            revenue365Days,
            revenueYTD
        ] = await Promise.all([
            queryRevenue(null),
            queryRevenue('30 days'),
            queryRevenue('90 days'),
            queryRevenue('180 days'),
            queryRevenue('1 year'),
            pool.query(
                `SELECT COALESCE(SUM(total_price), 0) as total 
                 FROM short_stay_reservations 
                 WHERE host_id = $1 AND status = 'confirmed' 
                 AND check_in >= DATE_TRUNC('year', CURRENT_DATE)`,
                [hostId]
            ).then(r => Number(r.rows[0].total))
        ]);

        const totalBookings = await pool.query(
            `SELECT COUNT(*) as count 
             FROM short_stay_reservations 
             WHERE host_id = $1 AND status = 'confirmed'`,
            [hostId]
        );

        res.json({
            totalRevenue,
            revenue30Days,
            revenue90Days,
            revenue180Days,
            revenue365Days,
            revenueYTD,
            totalBookings: Number(totalBookings.rows[0].count)
        });

    } catch (error) {
        console.error('Analytics Summary Error:', error);
        res.status(500).json({ error: 'Failed to fetch revenue summary' });
    }
});

// --- 1.2 Analytics: Monthly Chart Data ---
router.get('/analytics/monthly-chart', authenticate, async (req, res) => {
    try {
        // Get last 12 months revenue grouped by month
        const result = await pool.query(
            `SELECT TO_CHAR(check_in, 'Mon') as month,
                    EXTRACT(MONTH FROM check_in) as month_num,
                    EXTRACT(YEAR FROM check_in) as year_num,
                    COALESCE(SUM(total_price), 0) as revenue
             FROM short_stay_reservations
             WHERE host_id = $1 
               AND status = 'confirmed'
               AND check_in >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '11 months'
             GROUP BY year_num, month_num, month
             ORDER BY year_num, month_num`,
            [req.user.id]
        );

        res.json({ chartData: result.rows });
    } catch (error) {
        console.error('Analytics Chart Error:', error);
        res.status(500).json({ error: 'Failed to fetch chart data' });
    }
});

// --- 1.3 Analytics: Property Performance ---
router.get('/analytics/property-performance', authenticate, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT p.id, p.title, p.images,
                    COUNT(r.id) as total_bookings,
                    COALESCE(SUM(r.total_price), 0) as total_revenue
             FROM short_stay_properties p
             LEFT JOIN short_stay_reservations r 
                ON p.id = r.property_id 
                AND r.status = 'confirmed'
             WHERE p.user_id = $1
             GROUP BY p.id
             ORDER BY total_revenue DESC`,
            [req.user.id]
        );

        res.json({ properties: result.rows });
    } catch (error) {
        console.error('Analytics Property Error:', error);
        res.status(500).json({ error: 'Failed to fetch property performance' });
    }
});

// --- 2.1 Get Traveler Reservations (GET /reservations/traveler) ---
router.get('/reservations/traveler', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, 
       p.title as property_title, p.images, p.location as property_address,
       h.name as host_name, h.email as host_email, h.phone as host_phone, h.profile_photo as host_photo
       FROM short_stay_reservations r
       JOIN short_stay_properties p ON r.property_id = p.id
       LEFT JOIN users h ON r.host_id = h.id
       WHERE r.user_id = $1
       ORDER BY r.check_in ASC`,
       [req.user.id]
    );

    res.json({ reservations: result.rows });
  } catch (error) {
    console.error('Error fetching traveler reservations:', error);
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
});

// --- 2.2 Get Host Reservations (GET /reservations/host) ---
router.get('/reservations/host', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, 
       p.title as property_title, p.images,
       u.name as guest_name, u.email as guest_email, u.phone as guest_phone, u.profile_photo as guest_photo
       FROM short_stay_reservations r
       JOIN short_stay_properties p ON r.property_id = p.id
       JOIN users u ON r.user_id = u.id
       WHERE r.host_id = $1
       ORDER BY r.check_in ASC`,
       [req.user.id]
    );

    res.json({ reservations: result.rows });
  } catch (error) {
    console.error('Fetch Host Reservations Error:', error);
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
});

// --- 2.3 Get Property Availability (GET /availability/:id) ---
router.get('/availability/:id', optionalAuth, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT check_in, check_out 
             FROM short_stay_reservations 
             WHERE property_id = $1 AND status = 'confirmed' 
             AND check_out >= CURRENT_DATE`, // Only future/current bookings
            [req.params.id]
        );
        res.json({ bookedDates: result.rows });
    } catch (error) {
        console.error('Fetch Availability Error:', error);
        res.status(500).json({ error: 'Failed to fetch availability' });
    }
});

// --- 3. Get Single Property Details ---
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, 
       u.name as host_name, u.email as host_email, u.phone as host_phone, u.profile_photo as host_photo, u.bio as host_bio, u.created_at as host_joined_at,
       EXISTS(SELECT 1 FROM short_stay_favorites f WHERE f.property_id = p.id AND f.user_id = $2) as is_favorite
       FROM short_stay_properties p
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.id = $1`,
      [req.params.id, req.user ? req.user.id : null]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    const property = result.rows[0];
    property.guest_pricing = calculateGuestPricing(property.pricing);

    res.json({ property });

  } catch (error) {
    console.error('Fetch Property Details Error:', error);
    res.status(500).json({ error: 'Failed to fetch property details' });
  }
});

// --- 4. Get My Listings (Owner) ---
router.get('/user/my-listings', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM short_stay_properties WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
     const propertiesWithGuestPricing = result.rows.map(p => ({
      ...p,
      guest_pricing: calculateGuestPricing(p.pricing)
    }));
    res.json({ properties: propertiesWithGuestPricing });
  } catch (error) {
    console.error('Fetch My Listings Error:', error);
    res.status(500).json({ error: 'Failed to fetch your listings' });
  }
});

// --- 5. Validating Owner Middleware ---
const validateOwner = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT user_id FROM short_stay_properties WHERE id = $1',
      [req.params.id]
    );
    
    if (result.rows.length === 0) return res.status(404).json({ error: 'Property not found' });
    if (String(result.rows[0].user_id) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Unauthorized action' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: 'Authorization check failed' });
  }
};

// --- 6. Update Property (Owner Only) ---
router.put('/:id', authenticate, validateOwner, upload.array('images', 30), async (req, res) => {
  const client = await pool.connect();
  try {
     const {
      title, description, category,
      location, pricing, rules, policies,
      amenities, specific_details, existing_images
    } = req.body;

    let finalImages = [];
    if (existing_images) {
        try {
            const parsed = typeof existing_images === 'string' ? JSON.parse(existing_images) : existing_images;
            finalImages = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
            console.error('Error parsing existing_images:', e);
            finalImages = [];
        }
    }
    
    if (req.files && req.files.length > 0) {
      const buffers = req.files.map(file => file.buffer);
      const newUrls = await uploadMultipleImages(buffers, 'short_stay');
      finalImages = [...finalImages, ...newUrls];
    }

    const result = await client.query(
      `UPDATE short_stay_properties SET 
        title = $1, description = $2, category = $3,
        location = $4, pricing = $5, rules = $6, policies = $7,
        amenities = $8, specific_details = $9, images = $10,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $11 RETURNING *`,
      [
        title, description, category,
        typeof location === 'string' ? JSON.parse(location) : location,
        typeof pricing === 'string' ? JSON.parse(pricing) : pricing,
        typeof rules === 'string' ? JSON.parse(rules) : rules,
        typeof policies === 'string' ? JSON.parse(policies) : policies,
        typeof amenities === 'string' ? JSON.parse(amenities) : amenities,
        typeof specific_details === 'string' ? JSON.parse(specific_details) : specific_details,
        finalImages,
        req.params.id
      ]
    );

    res.json({ message: 'Property updated', property: result.rows[0] });

  } catch (error) {
    console.error('Update Property Error:', error);
    res.status(500).json({ error: 'Failed to update property' });
  } finally {
    client.release();
  }
});

// --- 7. Delete Property (Owner Only) ---
router.delete('/:id', authenticate, validateOwner, async (req, res) => {
  try {
    await pool.query('DELETE FROM short_stay_properties WHERE id = $1', [req.params.id]);
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Delete Property Error:', error);
    res.status(500).json({ error: 'Failed to delete property' });
  }
});

// --- 8. Toggle Favorite ---
router.post('/favorites/toggle', authenticate, async (req, res) => {
  try {
    const { propertyId } = req.body;
    
    const check = await pool.query(
      'SELECT id FROM short_stay_favorites WHERE user_id = $1 AND property_id = $2',
      [req.user.id, propertyId]
    );

    if (check.rows.length > 0) {
      await pool.query(
        'DELETE FROM short_stay_favorites WHERE user_id = $1 AND property_id = $2',
        [req.user.id, propertyId]
      );
      res.json({ isFavorite: false });
    } else {
      await pool.query(
        'INSERT INTO short_stay_favorites (user_id, property_id) VALUES ($1, $2)',
        [req.user.id, propertyId]
      );
      res.json({ isFavorite: true });
    }
  } catch (error) {
    console.error('Favorite Toggle Error:', error);
    res.status(500).json({ error: 'Action failed' });
  }
});

// --- 9. Get User Favorites ---
router.get('/user/favorites', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.* 
       FROM short_stay_properties p
       JOIN short_stay_favorites f ON p.id = f.property_id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );
     const propertiesWithGuestPricing = result.rows.map(p => ({
      ...p,
      guest_pricing: calculateGuestPricing(p.pricing)
    }));
    res.json({ favorites: propertiesWithGuestPricing });
  } catch (error) {
    console.error('Fetch Favorites Error:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// --- 10. Create Reservation (POST /reserve) ---
router.post('/reserve', authenticate, async (req, res) => {
  const client = await pool.connect();
  try {
    const { propertyId, checkIn, checkOut, guests, totalPrice, paymentId, hostId } = req.body;

    // 1. Double Booking Check (Concurrency Safe)
    await client.query('BEGIN');
    
    const availabilityCheck = await client.query(
      `SELECT id FROM short_stay_reservations 
       WHERE property_id = $1 
       AND status = 'confirmed'
       AND (
         (check_in <= $2 AND check_out > $2) OR
         (check_in < $3 AND check_out >= $3) OR
         ($2 <= check_in AND $3 >= check_out)
       )
       FOR UPDATE`, 
      [propertyId, checkIn, checkOut] // Overlap logic
    );

    if (availabilityCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Property is not available for these dates' });
    }

    // 2. Create Reservation
    const result = await client.query(
      `INSERT INTO short_stay_reservations 
       (property_id, user_id, host_id, check_in, check_out, guests, total_price, payment_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [propertyId, req.user.id, hostId, checkIn, checkOut, typeof guests === 'string' ? JSON.parse(guests) : guests, totalPrice, paymentId]
    );

    await client.query('COMMIT');

    res.status(201).json({ 
      message: 'Reservation confirmed', 
      reservation: result.rows[0] 
    });

    // 3. Send Email Notifications (Async, non-blocking)
    (async () => {
        try {
            // Fetch Host Details
            const hostResult = await pool.query('SELECT name, email, phone FROM users WHERE id = $1', [hostId]);
            const host = hostResult.rows[0];

            // Fetch Property Details (for address/image if not fully in body)
            const propResult = await pool.query('SELECT title, images, location FROM short_stay_properties WHERE id = $1', [propertyId]);
            const property = propResult.rows[0];
            
            const bookingData = {
                booking_id: result.rows[0].id,
                property_title: property.title,
                property_image: property.images && property.images.length > 0 ? property.images[0] : '',
                property_address: property.location,
                check_in: checkIn,
                check_out: checkOut,
                total_price: totalPrice,
                guests: typeof guests === 'string' ? JSON.parse(guests) : guests,
                
                // Traveler info
                guest_name: req.user.name,
                guest_email: req.user.email,
                guest_phone: req.user.phone,

                // Host info
                host_name: host ? host.name : 'Host',
                host_email: host ? host.email : '',
                host_contact: host ? host.phone : ''
            };

            // Send emails sequentially as requested
            // Failures are caught inside the service functions so they don't block each other
            await sendShortStayTravelerEmail(bookingData);
            await sendShortStayHostEmail(bookingData);
            
        } catch (emailErr) {
            console.error('Failed to send short stay emails:', emailErr);
            // Don't fail the request, just log
        }
    })();

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create Reservation Error:', error);
    res.status(500).json({ error: 'Failed to confirm reservation' });
  } finally {
    client.release();
  }
});



export default router;
