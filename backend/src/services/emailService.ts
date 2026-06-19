import nodemailer from 'nodemailer';

// Configure standard transport using Ethereal or provided SMTP later
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER || 'test@ethereal.email',
    pass: process.env.SMTP_PASS || 'password123',
  },
});

export const sendEmail = async (to: string, subject: string, htmlContent: string) => {
  // Wrap the content in a professional HTML template
  const professionalHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0B0F19; margin: 0; padding: 0; color: #ffffff; }
        .email-container { max-width: 600px; margin: 40px auto; background-color: #111827; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.5); border: 1px solid #1f2937; }
        .header { background-color: #0B0F19; border-bottom: 1px solid #22d3ee; padding: 30px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 2px; color: #22d3ee; }
        .content { padding: 40px; color: #e2e8f0; line-height: 1.6; font-size: 16px; }
        .content h2 { color: #ffffff; margin-top: 0; font-size: 20px; border-bottom: 1px solid #1f2937; padding-bottom: 10px; }
        .footer { background-color: #0B0F19; padding: 20px; text-align: center; color: #94a3b8; font-size: 13px; border-top: 1px solid #1f2937; }
        .button { display: inline-block; padding: 12px 24px; background-color: #22d3ee; color: #0B0F19 !important; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>SN ENVIRO SYSTEMS</h1>
        </div>
        <div class="content">
          ${htmlContent}
          <br/>
          <a href="http://localhost:5173/dashboard" class="button">Access Telemetry Dashboard</a>
        </div>
        <div class="footer">
          <p>This is an automated notification from the SN Enviro Ticket Management System.</p>
          <p>© 2026 SN Enviro Systems. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: '"SN Enviro Support" <noreply@snenviro.com>',
      to,
      subject,
      html: professionalHtml,
    });
    console.log('✅ Message sent successfully: %s', info.messageId);
    
    // For ethereal test accounts, you can view the email at this URL:
    if (process.env.SMTP_HOST === 'smtp.ethereal.email') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    
    return info;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw new Error('Email dispatch failed');
  }
};
