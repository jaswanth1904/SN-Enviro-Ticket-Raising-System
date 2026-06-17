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
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; }
        .email-container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e1e5ea; }
        .header { background-color: #2563eb; padding: 30px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 1px; }
        .content { padding: 40px; color: #334155; line-height: 1.6; font-size: 16px; }
        .content h2 { color: #1e293b; margin-top: 0; font-size: 20px; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; }
        .footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 13px; border-top: 1px solid #e1e5ea; }
        .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px; }
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
          <a href="http://localhost:5173/dashboard" class="button">View Dashboard</a>
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
