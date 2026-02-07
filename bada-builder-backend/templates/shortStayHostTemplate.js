/**
 * Premium Host Reservation Notification Template
 * "Beautiful, subtle, rich premium look"
 */

export const generateShortStayHostEmail = (data) => {
    const {
        booking_id,
        property_title,
        property_image,
        check_in,
        check_out,
        total_price,
        guests,
        guest_name,
        guest_email,
        guest_phone
    } = data;

    const appName = process.env.APP_NAME || 'Bada Builder';

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Reservation Confirmed</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&display=swap');
            body { margin: 0; padding: 0; font-family: 'Outfit', 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8f9fa; color: #1a1a1a; -webkit-font-smoothing: antialiased; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
            .header { background: #1a1a1a; padding: 24px 30px; text-align: center; }
            .logo { font-size: 20px; font-weight: 500; color: #fff; letter-spacing: 0.5px; }
            .notification-badge { background: #dcfce7; color: #166534; padding: 8px 16px; border-radius: 100px; font-size: 13px; font-weight: 600; display: inline-block; margin-bottom: 20px; }
            .content { padding: 40px 32px; }
            .property-card { display: flex; align-items: center; margin-bottom: 30px; }
            .property-thumb { width: 80px; height: 80px; border-radius: 8px; object-fit: cover; margin-right: 16px; background: #eee; }
            .property-details h3 { margin: 0 0 6px 0; font-size: 16px; font-weight: 600; }
            .property-details p { margin: 0; color: #666; font-size: 14px; }
            
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .info-item { background: #f8f9fa; padding: 16px; border-radius: 12px; }
            .label { font-size: 11px; text-transform: uppercase; color: #888; font-weight: 600; margin-bottom: 6px; }
            .value { font-size: 15px; font-weight: 500; color: #000; }
            
            .guest-section { border-top: 1px solid #eee; border-bottom: 1px solid #eee; padding: 24px 0; margin-bottom: 30px; }
            .guest-row { display: flex; justify-content: space-between; margin-bottom: 12px; }
            .guest-key { color: #666; }
            .guest-val { font-weight: 500; text-align: right; }

            .btn { display: block; width: 100%; text-align: center; background-color: #2563eb; color: #fff; text-decoration: none; padding: 16px 0; border-radius: 10px; font-weight: 500; font-size: 15px; }
            .footer { background-color: #f8f9fa; padding: 30px; text-align: center; color: #888; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">${appName} Hosting</div>
            </div>

            <div class="content">
                <div style="text-align: center;">
                    <div class="notification-badge">New Booking Confirmed</div>
                    <h1 style="font-size: 24px; font-weight: 500; margin: 0 0 40px 0; color: #000;">You have a new reservation!</h1>
                </div>

                <div class="property-card">
                    ${property_image ? `<img src="${property_image}" alt="Property" class="property-thumb" />` : ''}
                    <div class="property-details">
                        <h3>${property_title}</h3>
                        <p>Booking #${booking_id}</p>
                    </div>
                </div>

                <div class="info-grid">
                    <div class="info-item">
                        <div class="label">Check-in</div>
                        <div class="value">${formatDate(check_in)}</div>
                    </div>
                    <div class="info-item">
                        <div class="label">Checkout</div>
                        <div class="value">${formatDate(check_out)}</div>
                    </div>
                </div>

                <div class="guest-section">
                    <div class="label" style="margin-bottom: 16px;">GUEST DETAILS</div>
                    <div class="guest-row">
                        <span class="guest-key">Booked by</span>
                        <span class="guest-val">${guest_name}</span>
                    </div>
                    <div class="guest-row">
                        <span class="guest-key">Guests</span>
                        <span class="guest-val">${guests.adults} Adults${guests.children ? `, ${guests.children} Children` : ''}</span>
                    </div>
                     <div class="guest-row">
                        <span class="guest-key">Phone</span>
                        <span class="guest-val">${guest_phone || 'Not provided'}</span>
                    </div>
                    ${guest_email ? `
                    <div class="guest-row">
                        <span class="guest-key">Email</span>
                        <span class="guest-val">${guest_email}</span>
                    </div>` : ''}
                    
                    ${data.guest_details && data.guest_details.length > 0 ? `
                    <div style="margin-top: 24px; border-top: 1px dashed #eee; padding-top: 16px;">
                        <div class="label" style="margin-bottom: 12px;">ADDITIONAL TRAVELLER DETAILS</div>
                        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                            <thead>
                                <tr style="background: #f1f1f1; text-align: left;">
                                    <th style="padding: 8px; border-radius: 4px 0 0 4px;">Name</th>
                                    <th style="padding: 8px;">Contact</th>
                                    <th style="padding: 8px; border-radius: 0 4px 4px 0;">Location</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.guest_details.map(g => `
                                <tr style="border-bottom: 1px solid #f0f0f0;">
                                    <td style="padding: 8px; font-weight: 500;">${g.name}</td>
                                    <td style="padding: 8px; color: #555;">${g.phone}<br>${g.email}</td>
                                    <td style="padding: 8px; color: #555;">${g.state}, ${g.country}</td>
                                </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    ` : ''}
                </div>

                <div style="background: #ecfdf5; padding: 20px; border-radius: 12px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #065f46; font-weight: 500;">Total Payout</span>
                    <span style="color: #059669; font-size: 18px; font-weight: 600;">₹${total_price.toLocaleString()}</span>
                </div>

                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/hosting" class="btn">View Reservation</a>
            </div>

            <div class="footer">
                <p>Keep up the great work, Host!</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

export default generateShortStayHostEmail;
