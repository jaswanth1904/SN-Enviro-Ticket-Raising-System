import nodemailer from 'nodemailer';
import path from 'path';

let transporter: nodemailer.Transporter | null = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const isProd = process.env.NODE_ENV === 'production';
  const transportOptions: any = isProd
    ? {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '465', 10),
        secure: process.env.SMTP_PORT === '465' || process.env.SMTP_PORT === undefined, // true for 465, false for 587
        // Removed pool, maxConnections, and maxMessages to prevent idle connection ECONNRESET from Gmail
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      }
    : {
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        auth: {
          user: process.env.SMTP_USER || 'test@ethereal.email',
          pass: process.env.SMTP_PASS || 'password123',
        },
      };

  transporter = nodemailer.createTransport(transportOptions);
  return transporter;
};

const renderTemplate = (htmlContent: string) => `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; color: #333333; }
      .email-container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.05); border: 1px solid #e0e0e0; }
      .header { background-color: #ffffff; border-bottom: 2px solid #2563eb; padding: 25px; text-align: center; color: #1e40af; }
      .header h1 { margin: 0; font-size: 22px; font-weight: 700; color: #1e3a8a; }
      .content { padding: 35px; color: #4b5563; line-height: 1.6; font-size: 15px; }
      .content h2 { color: #1f2937; margin-top: 0; font-size: 18px; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
      .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; }
      .info-box { background-color: #f0fdf4; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #16a34a; }
      .info-box p { margin: 5px 0; color: #166534; }
      .accent-blue { color: #2563eb; font-weight: 600; }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="header">
        <img src="cid:companylogo" alt="SN Enviro Logo" style="max-height: 60px; margin-bottom: 10px;" />
        <h1>SN Enviro</h1>
      </div>
      <div class="content">
        ${htmlContent}
      </div>
      <div class="footer">
        <p>This is an automated notification from SN Enviro.</p>
        <p>© 2026 SN Enviro. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
`;

export const sendEmail = async (to: string, subject: string, htmlContent: string) => {
  try {
    const isProd = process.env.NODE_ENV === 'production';
    if (!isProd) {
      console.log(`[MOCK EMAIL] Sent to: ${to} | Subject: ${subject}`);
      return { messageId: 'mock-id-123' };
    }
    
    const mailOptions = {
      from: `"SN Enviro Systems" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      html: renderTemplate(htmlContent),
      attachments: [
        {
          filename: 'logo.jpeg',
          path: path.join(__dirname, '../../../frontend/public/logo.jpeg'),
          cid: 'companylogo'
        }
      ]
    };
    const info = await getTransporter().sendMail(mailOptions);
    console.log('✅ Message sent successfully: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw new Error('Email dispatch failed');
  }
};

export const sendRegistrationAcknowledgement = async (to: string, ticketId: string, subject: string, description: string) => {
  const content = `
    <p>Dear Valued Customer,</p>
    <p>Thank you for reaching out to the SN Enviro Service Team. We sincerely appreciate you taking the time to report this issue. Your support ticket has been successfully received, securely logged into our system, and assigned to our dedicated technical team for review.</p>
    
    <div class="info-box">
      <p><b>Ticket ID:</b> ${ticketId}</p>
      <p><b>Subject:</b> ${subject}</p>
    </div>

    <p>Our team is actively investigating the details of your request and will work diligently to ensure a prompt and effective resolution. We are committed to providing you with the highest level of service.</p>
    <p>If you have any further questions or require immediate assistance, please do not hesitate to reply directly to this email or contact the Service Manager.</p>
    <br/>
    <p>Thank you for your continued trust and partnership.</p>
    <br/>
    <p>Best Regards,</p>
    <p><b class="accent-blue">Support Team</b><br/>SN Enviro</p>
  `;
  return sendEmail(to, `Support Ticket Received: ${ticketId}`, content);
};

export const sendAssignmentNotification = async (to: string, ticketId: string, subject: string) => {
  const content = `
    <h2>Ticket Assignment Notification</h2>
    <p>Dear Engineer,</p>
    <p>This is an automated notification to inform you that you have been assigned to a new support ticket that requires your technical expertise.</p>
    
    <div class="info-box">
      <p><b>Ticket ID:</b> ${ticketId}</p>
      <p><b>Subject:</b> ${subject}</p>
    </div>
    
    <p>Please review the issue description in the dashboard and begin your initial assessment as soon as possible. Your prompt attention to this matter is highly appreciated to ensure we deliver timely support.</p>
    <br/>
    <p class="accent-blue">If you require any additional resources or clarification regarding this ticket, please contact the Service Manager immediately.</p>
  `;
  return sendEmail(to, `Action Required - Ticket Assigned: ${ticketId}`, content);
};

export const sendResolutionNotice = async (to: string, ticketId: string) => {
  const content = `
    <h2>Support Ticket Resolved</h2>
    <p>Dear Valued Customer,</p>
    <p>We are pleased to inform you that your recent support ticket has been successfully resolved by our technical team.</p>
    
    <div class="info-box">
      <p><b>Ticket ID:</b> ${ticketId}</p>
    </div>
    
    <p>The reported issue has been thoroughly addressed, and we have taken all necessary steps to ensure your systems continue to operate smoothly. We sincerely apologize for any inconvenience this may have caused and thank you for your patience while our team worked on the solution.</p>
    <p>If you experience any further difficulties or if the original issue persists, please reply to this email or contact the Service Manager. We are always here to help.</p>
    <br/>
    <p>Thank you for choosing SN Enviro.</p>
    <br/>
    <p>Best Regards,</p>
    <p><b class="accent-blue">Support Team</b><br/>SN Enviro</p>
  `;
  return sendEmail(to, `Ticket Resolved: ${ticketId}`, content);
};
