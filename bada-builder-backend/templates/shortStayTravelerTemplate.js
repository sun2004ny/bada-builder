/**
 * Premium Traveler Booking Confirmation Template
 * "Beautiful, subtle, rich premium look"
 */

export const generateShortStayTravelerEmail = (data) => {
    const {
        booking_id,
        property_title,
        property_image,
        check_in,
        check_out,
        total_price,
        guests,
        host_name,
        host_contact,
        property_address
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
        <title>Reservation Confirmed</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&display=swap');
            body { margin: 0; padding: 0; font-family: 'Outfit', 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8f9fa; color: #1a1a1a; -webkit-font-smoothing: antialiased; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
            .header { background: #ffffff; padding: 30px; text-align: center; border-bottom: 1px solid #f0f0f0; }
            .logo { font-size: 24px; font-weight: 600; color: #000; letter-spacing: -0.5px; }
            .hero-image { width: 100%; height: 240px; object-fit: cover; background-color: #f0f0f0; }
            .content { padding: 40px 32px; }
            .columns { display: table; width: 100%; table-layout: fixed; border-spacing: 0; }
            .column { display: table-cell; vertical-align: top; width: 50%; padding-bottom: 24px; }
            .label { font-size: 11px; text-transform: uppercase; color: #888; font-weight: 500; letter-spacing: 1px; margin-bottom: 6px; }
            .value { font-size: 16px; color: #000; font-weight: 500; line-height: 1.4; }
            .section-title { font-size: 18px; font-weight: 600; color: #000; margin: 0 0 20px 0; padding-bottom: 12px; border-bottom: 1px solid #eee; }
            .highlight-card { background: #f8f9fa; border-radius: 12px; padding: 24px; margin-bottom: 30px; border: 1px solid #eee; }
            .footer { background-color: #1a1a1a; padding: 30px; text-align: center; color: #666; font-size: 12px; }
            .footer p { margin: 5px 0; }
            .btn { display: inline-block; background-color: #000; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 500; font-size: 14px; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">${appName}</div>
            </div>
            
            ${property_image ? `<img src="${property_image}" alt="${property_title}" class="hero-image" />` : ''}

            <div class="content">
                <h1 style="font-size: 28px; font-weight: 300; margin: 0 0 10px 0; color: #000;">You're going to ${property_address.split(',')[0]}!</h1>
                <p style="color: #666; margin: 0 0 30px 0; font-size: 15px;">Confirmation code: <strong>#${booking_id}</strong></p>

                <div class="highlight-card">
                    <div class="columns">
                        <div class="column">
                            <div class="label">Check-in</div>
                            <div class="value">${formatDate(check_in)}</div>
                            <div style="font-size: 13px; color: #666; margin-top: 4px;">After 2:00 PM</div>
                        </div>
                        <div class="column">
                            <div class="label">Checkout</div>
                            <div class="value">${formatDate(check_out)}</div>
                            <div style="font-size: 13px; color: #666; margin-top: 4px;">Before 11:00 AM</div>
                        </div>
                    </div>
                    <div style="border-top: 1px solid #e5e5e5; margin: 10px 0 20px 0;"></div>
                    <div class="label">Address</div>
                    <div class="value" style="color: #333;">${property_address}</div>
                </div>

                <div class="section-title">Reservation Details</div>
                
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                    <tr>
                        <td style="padding-bottom: 12px; color: #666;">Guests</td>
                        <td style="text-align: right; padding-bottom: 12px; font-weight: 500;">
                            ${guests.adults} Adults${guests.children ? `, ${guests.children} Children` : ''}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding-bottom: 12px; color: #666;">Total Paid</td>
                        <td style="text-align: right; padding-bottom: 12px; font-weight: 600; color: #000;">₹${total_price.toLocaleString()}</td>
                    </tr>
                </table>

                <div class="section-title">Your Host</div>
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div>
                        <div style="font-size: 16px; font-weight: 600;">${host_name}</div>
                        <div style="color: #666; font-size: 14px; margin-top: 4px;">Phone: ${host_contact}</div>
                    </div>
                </div>

                <center>
                    <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/short-stay" class="btn">Manage Reservation</a>
                </center>
            </div>

            <div class="footer">
                <p>Sent with ♥ by ${appName}</p>
                <p>Need help? Contact support@badabuilder.com</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

export default generateShortStayTravelerEmail;
