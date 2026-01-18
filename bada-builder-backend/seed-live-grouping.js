/**
 * Seed live grouping properties data
 */

import pool from './config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function seedLiveGrouping() {
  try {
    console.log('🌱 Seeding live grouping properties...\n');

    const sampleData = [
      {
        title: 'Luxury Apartments in Gurgaon',
        developer: 'DLF Limited',
        location: 'Sector 54, Gurgaon',
        original_price: '₹1.2 Cr',
        group_price: '₹95 Lakh',
        discount: '21%',
        savings: '₹25 Lakh',
        type: 'Apartment',
        total_slots: 50,
        filled_slots: 32,
        time_left: '15 days',
        min_buyers: 30,
        benefits: ['Prime Location', 'Ready to Move', 'Group Discount'],
        status: 'Active',
        area: '1200 sq ft',
        possession: 'Ready to Move',
        rera_number: 'RERA-GGM-123-2023',
        facilities: ['Swimming Pool', 'Gym', 'Parking', 'Security'],
        description: 'Premium luxury apartments with modern amenities in the heart of Gurgaon.',
        advantages: {
          "location": "Prime location with excellent connectivity",
          "amenities": "World-class facilities and amenities",
          "investment": "High appreciation potential"
        },
        group_details: {
          "min_commitment": "₹5 Lakh",
          "booking_amount": "₹1 Lakh",
          "payment_terms": "Flexible payment options"
        },
        images: [
          'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'
        ],
        image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'
      },
      {
        title: 'Modern Villas in Noida',
        developer: 'Godrej Properties',
        location: 'Sector 150, Noida',
        original_price: '₹2.5 Cr',
        group_price: '₹2.1 Cr',
        discount: '16%',
        savings: '₹40 Lakh',
        type: 'Villa',
        total_slots: 25,
        filled_slots: 18,
        time_left: '8 days',
        min_buyers: 20,
        benefits: ['Gated Community', 'Premium Location', 'Group Savings'],
        status: 'Active',
        area: '2500 sq ft',
        possession: 'Under Construction',
        rera_number: 'RERA-UP-456-2023',
        facilities: ['Club House', 'Garden', 'Kids Play Area', '24/7 Security'],
        description: 'Spacious modern villas in a premium gated community with excellent amenities.',
        advantages: {
          "space": "Spacious villas with private gardens",
          "community": "Exclusive gated community living",
          "future": "Excellent growth potential"
        },
        group_details: {
          "min_commitment": "₹10 Lakh",
          "booking_amount": "₹2 Lakh",
          "payment_terms": "Construction linked payment"
        },
        images: [
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'
        ],
        image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'
      },
      {
        title: 'Commercial Spaces in Delhi',
        developer: 'Unitech Limited',
        location: 'Connaught Place, Delhi',
        original_price: '₹80 Lakh',
        group_price: '₹68 Lakh',
        discount: '15%',
        savings: '₹12 Lakh',
        type: 'Commercial',
        total_slots: 40,
        filled_slots: 35,
        time_left: '3 days',
        min_buyers: 25,
        benefits: ['Prime Commercial Location', 'High ROI', 'Group Discount'],
        status: 'Active',
        area: '500 sq ft',
        possession: 'Ready to Move',
        rera_number: 'RERA-DL-789-2023',
        facilities: ['Elevator', 'Power Backup', 'Parking', 'Security'],
        description: 'Premium commercial spaces in the heart of Delhi with excellent footfall.',
        advantages: {
          "location": "Prime commercial hub location",
          "returns": "High rental and appreciation returns",
          "connectivity": "Excellent metro and road connectivity"
        },
        group_details: {
          "min_commitment": "₹3 Lakh",
          "booking_amount": "₹50,000",
          "payment_terms": "Immediate possession"
        },
        images: [
          'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
          'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'
        ],
        image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800'
      }
    ];

    for (const property of sampleData) {
      const result = await pool.query(`
        INSERT INTO live_grouping_properties (
          title, developer, location, original_price, group_price, discount, savings,
          type, total_slots, filled_slots, time_left, min_buyers, benefits, status,
          area, possession, rera_number, facilities, description, advantages,
          group_details, images, image, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        ) RETURNING id, title
      `, [
        property.title, property.developer, property.location, property.original_price,
        property.group_price, property.discount, property.savings, property.type,
        property.total_slots, property.filled_slots, property.time_left, property.min_buyers,
        property.benefits, property.status, property.area, property.possession,
        property.rera_number, property.facilities, property.description,
        JSON.stringify(property.advantages), JSON.stringify(property.group_details),
        property.images, property.image
      ]);

      console.log(`✅ Added: ${result.rows[0].title} (ID: ${result.rows[0].id})`);
    }

    console.log('\n🎉 Live grouping properties seeded successfully!');

  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await pool.end();
  }
}

seedLiveGrouping();