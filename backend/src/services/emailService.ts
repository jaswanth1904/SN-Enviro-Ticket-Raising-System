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
    <p>Dear Customer,</p>
    <p>Thank you for contacting SN Enviro. We have successfully received your support ticket, and our team is already reviewing it.</p>
    
    <div class="info-box">
      <p><b>Ticket ID:</b> ${ticketId}</p>
      <p><b>Subject:</b> ${subject}</p>
    </div>

    <p>We will work to resolve this as quickly as possible. If you need any urgent updates, please feel free to reply to this email or reach out to the Service Manager.</p>
    <br/>
    <p>Best Regards,</p>
    <p><b class="accent-blue">Support Team</b><br/>SN Enviro</p>
  `;
  return sendEmail(to, `Support Ticket Received: ${ticketId}`, content);
};

export const sendAssignmentNotification = async (to: string, ticketId: string, subject: string) => {
  const content = `
    <p>Dear Engineer,</p>
    <p>You have been assigned to a new support ticket that requires your attention. Please review the details below and log in to the portal for further actions.</p>
    
    <div class="info-box">
      <p><b>Ticket ID:</b> ${ticketId}</p>
      <p><b>Subject:</b> ${subject}</p>
    </div>
    
    <p>If you need any additional resources or have questions, please contact the Service Manager immediately.</p>
    <br/>
    <p>Best Regards,</p>
    <p><b class="accent-blue">Support Team</b><br/>SN Enviro</p>
  `;
  return sendEmail(to, `Action Required - Ticket Assigned: ${ticketId}`, content);
};

export const sendResolutionNotice = async (to: string, ticketId: string) => {
  const content = `
    <p>Dear Customer,</p>
    <p>We are pleased to inform you that your support ticket has been resolved successfully by our engineering team.</p>
    
    <div class="info-box">
      <p><b>Ticket ID:</b> ${ticketId}</p>
    </div>
    
    <p>If you face any issues or if the problem persists, please reply to this email or contact the Service Manager.</p>
    <br/>
    <p>Best Regards,</p>
    <p><b class="accent-blue">Support Team</b><br/>SN Enviro</p>
  `;
  return sendEmail(to, `Ticket Resolved: ${ticketId}`, content);
};
