export const generatePhotographerAdminNotificationEmail = (data) => {
    const appName = process.env.APP_NAME || 'Bada Builder';
    const role = data.role || 'Photographer';

    // Helper to format boolean
    const formatBool = (val) => val ? '<span style="color: #16a34a; font-weight: 600;">Yes</span>' : '<span style="color: #ef4444; font-weight: 600;">No</span>';

    // Helper to format links
    const formatLink = (url) => url ? `<a href="${url}" target="_blank" style="color: #2563eb; text-decoration: none;">View Link</a>` : '<span style="color: #94a3b8;">Not Provided</span>';

    // Helper to format titles
    const getRoleTitle = (role) => {
        if (role === 'Real Estate Agent') return 'New Real Estate Partner Application';
        if (role === 'Influencer') return 'New Influencer Collaboration Application';
        return 'New Photographer Application';
    };

    return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <!-- Header -->
        <div style="background-color: #0f172a; padding: 20px; text-align: center;">
            <h2 style="color: #ffffff; margin: 0; font-size: 20px;">${getRoleTitle(role)}</h2>
        </div>

        <!-- Content -->
        <div style="padding: 24px;">
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <!-- Personal Info -->
                    <tr style="background-color: #f8fafc;"><td colspan="2" style="padding: 12px; border: 1px solid #e2e8f0; font-weight: 700; color: #334155;">Personal Information</td></tr>
                    <tr>
                        <td style="padding: 12px; border: 1px solid #e2e8f0; color: #64748b; width: 40%;">Full Name</td>
                        <td style="padding: 12px; border: 1px solid #e2e8f0; color: #1e293b; font-weight: 600;">${data.full_name || data.name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; border: 1px solid #e2e8f0; color: #64748b;">Email</td>
                        <td style="padding: 12px; border: 1px solid #e2e8f0; color: #1e293b;">${data.email}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; border: 1px solid #e2e8f0; color: #64748b;">Phone</td>
                        <td style="padding: 12px; border: 1px solid #e2e8f0; color: #1e293b;">${data.phone}</td>
                    </tr>
                    ${data.city ? `
                    <tr>
                        <td style="padding: 12px; border: 1px solid #e2e8f0; color: #64748b;">City</td>
                        <td style="padding: 12px; border: 1px solid #e2e8f0; color: #1e293b;">${data.city}</td>
                    </tr>` : ''}

                    <!-- Professional Info -->
                    <tr style="background-color: #f8fafc;"><td colspan="2" style="padding: 12px; border: 1px solid #e2e8f0; font-weight: 700; color: #334155;">Professional Details</td></tr>
                    ${role === 'Real Estate Agent' ? `
                    <tr>
                        <td style="padding: 12px; border: 1px solid #e2e8f0; color: #64748b;">Agency Name</td>
                        <td style="padding: 12px; border: 1px solid #e2e8f0; color: #1e293b;">${data.agency_name || data.agencyName || '-'}</td>
                    </tr>
                    ` : ''}
                    ${role === 'Influencer' ? `
                    <tr>
                        <td style="padding: 12px; border: 1px solid #e2e8f0; color: #64748b;">Followers Count</td>
                        <td style="padding: 12px; border: 1px solid #e2e8f0; color: #1e293b;">${data.followers ? data.followers.toLocaleString() : '-'}</td>
                    </tr>
                    ` : ''}
                    ${data.experience !== undefined ? `
                    <tr>
                        <td style="padding: 12px; border: 1px solid #e2e8f0; color: #64748b;">Experience</td>
                        <td style="padding: 12px; border: 1px solid #e2e8f0; color: #1e293b;">${data.experience} Years</td>
                    </tr>` : ''}
                    ${data.photography_type ? `
                    <tr>
                        <td style="padding: 12px; border: 1px solid #e2e8f0; color: #64748b;">Photography Type</td>
                        <td style="padding: 12px; border: 1px solid #e2e8f0; color: #1e293b;">${data.photography_type}</td>
                    </tr>` : ''}
                    
                    <!-- Links & Portfolio -->
                    <tr style="background-color: #f8fafc;"><td colspan="2" style="padding: 12px; border: 1px solid #e2e8f0; font-weight: 700; color: #334155;">Links & Documents</td></tr>
                    ${data.drive_link ? `
                    <tr>
                        <td style="padding: 12px; border: 1px solid #e2e8f0; color: #64748b;">Portfolio Link</td>
                        <td style="padding: 12px; border: 1px solid #e2e8f0;">${formatLink(data.drive_link)}</td>
                    </tr>` : ''}
                    ${data.pdf_url || data.pdfUrl ? `
                    <tr>
                        <td style="padding: 12px; border: 1px solid #e2e8f0; color: #64748b;">Attached Document (PDF)</td>
                        <td style="padding: 12px; border: 1px solid #e2e8f0;">${formatLink(data.pdf_url || data.pdfUrl)}</td>
                    </tr>` : ''}
                    ${data.meta_link || data.metaLink ? `
                    <tr>
                        <td style="padding: 12px; border: 1px solid #e2e8f0; color: #64748b;">Meta / Social Profile</td>
                        <td style="padding: 12px; border: 1px solid #e2e8f0;">${formatLink(data.meta_link || data.metaLink)}</td>
                    </tr>` : ''}
                    ${data.instagram ? `
                    <tr>
                        <td style="padding: 12px; border: 1px solid #e2e8f0; color: #64748b;">Instagram</td>
                        <td style="padding: 12px; border: 1px solid #e2e8f0; color: #1e293b;">${data.instagram}</td>
                    </tr>` : ''}
                    ${data.website ? `
                    <tr>
                        <td style="padding: 12px; border: 1px solid #e2e8f0; color: #64748b;">Website</td>
                        <td style="padding: 12px; border: 1px solid #e2e8f0;">${formatLink(data.website)}</td>
                    </tr>` : ''}

                    <!-- Equipment & Availability (Photographer Only) -->
                    ${role === 'Photographer' ? `
                    <tr style="background-color: #f8fafc;"><td colspan="2" style="padding: 12px; border: 1px solid #e2e8f0; font-weight: 700; color: #334155;">Equipment & Availability</td></tr>
                    <tr>
                        <td style="padding: 12px; border: 1px solid #e2e8f0; color: #64748b;">Owns DSLR?</td>
                        <td style="padding: 12px; border: 1px solid #e2e8f0;">${formatBool(data.has_dslr)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; border: 1px solid #e2e8f0; color: #64748b;">Owns Drone?</td>
                        <td style="padding: 12px; border: 1px solid #e2e8f0;">${formatBool(data.has_drone)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; border: 1px solid #e2e8f0; color: #64748b;">Outstation Available?</td>
                        <td style="padding: 12px; border: 1px solid #e2e8f0;">${formatBool(data.outstation_available)}</td>
                    </tr>
                    ` : ''}

                    <!-- Bio -->
                    ${data.bio ? `
                    <tr style="background-color: #f8fafc;"><td colspan="2" style="padding: 12px; border: 1px solid #e2e8f0; font-weight: 700; color: #334155;">Bio</td></tr>
                    <tr>
                        <td colspan="2" style="padding: 12px; border: 1px solid #e2e8f0; color: #475569; font-style: italic;">
                            "${data.bio}"
                        </td>
                    </tr>` : ''}
                </table>
            </div>
            
            <div style="margin-top: 20px; font-size: 12px; color: #94a3b8; text-align: right;">
                Submission Timestamp: ${new Date().toISOString()}<br>
                System Auto-Generated Email
            </div>
        </div>
    </div>
    `;
};
