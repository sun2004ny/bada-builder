export const generatePhotographerUserConfirmationEmail = (data) => {
    const appName = process.env.APP_NAME || 'Bada Builder';
    const role = data.role || 'Photographer';

    const getRoleContext = (role) => {
        if (role === 'Real Estate Agent') return 'partner program';
        if (role === 'Influencer') return 'influencer collaboration';
        return 'creative network';
    };

    return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <!-- Header -->
        <div style="background-color: #0f172a; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 1px;">${appName}</h1>
            <p style="color: #94a3b8; margin: 5px 0 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">${role === 'Photographer' ? 'Creative Network' : (role === 'Influencer' ? 'Influencer Program' : 'Partner Program')}</p>
        </div>

        <!-- Content -->
        <div style="padding: 32px 24px;">
            <p style="color: #334155; font-size: 16px; margin-top: 0;">Dear <strong>${data.full_name || data.name}</strong>,</p>
            
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                We are pleased to inform you that your application to join our ${getRoleContext(role)} has been successfully received.
            </p>

            <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                Our team will review your portfolio and details to ensure they align with our professional standards. We typically complete reviews within 48-72 hours.
            </p>

            <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 16px; margin: 24px 0; border-radius: 4px;">
                <p style="margin: 0; color: #1e293b; font-size: 14px;"><strong>Submission Date:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p style="margin: 8px 0 0 0; color: #1e293b; font-size: 14px;"><strong>Status:</strong> Under Review</p>
                <p style="margin: 8px 0 0 0; color: #1e293b; font-size: 14px;"><strong>Role:</strong> ${role}</p>
            </div>

            <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                We will get back to you shortly with the next steps.
            </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f1f5f9; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 14px; margin: 0;">&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
            <p style="color: #94a3b8; font-size: 12px; margin: 8px 0 0 0;">
                This is an automated message. Please do not reply directly to this email.
            </p>
        </div>
    </div>
    `;
};
