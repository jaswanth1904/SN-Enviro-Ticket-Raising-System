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
      body { font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0B0F19; margin: 0; padding: 0; color: #ffffff; }
      .email-container { max-width: 600px; margin: 40px auto; background-color: #111827; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.5); border: 1px solid #1f2937; }
      .header { background-color: #0B0F19; border-bottom: 1px solid #22d3ee; padding: 30px; text-align: center; color: #ffffff; }
      .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 2px; color: #22d3ee; }
      .content { padding: 40px; color: #e2e8f0; line-height: 1.6; font-size: 16px; }
      .content h2 { color: #ffffff; margin-top: 0; font-size: 20px; border-bottom: 1px solid #1f2937; padding-bottom: 10px; }
      .footer { background-color: #0B0F19; padding: 20px; text-align: center; color: #94a3b8; font-size: 13px; border-top: 1px solid #1f2937; }
      .button { display: inline-block; padding: 12px 24px; background-color: #22d3ee; color: #0B0F19 !important; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px; }
      .accent-amber { color: #f59e0b; }
      .accent-emerald { color: #10b981; }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="header">
        <img src="cid:companylogo" alt="SN Enviro Systems Logo" style="max-height: 80px; margin-bottom: 15px; border-radius: 4px;" />
        <h1>SN ENVIRO SYSTEMS</h1>
      </div>
      <div class="content">
        ${htmlContent}
      </div>
      <div class="footer">
        <p>This is an automated notification from the SN Enviro Ticket Management System.</p>
        <p>© 2026 SN Enviro Systems. All rights reserved.</p>
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
    <p>Thank you for contacting us. Your support ticket has been successfully received and assigned to our team for review.</p>
    
    <div style="background-color: #1f2937; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b;">
      <p style="margin: 0 0 10px 0;"><b>Ticket ID:</b> <span class="accent-amber">${ticketId}</span></p>
      <p style="margin: 0;"><b>Subject:</b> ${subject}</p>
    </div>

    <p>We are currently investigating the issue and will work to resolve it as soon as possible. Please allow us approximately 24–48 business hours to complete our assessment and provide an update or resolution.</p>
    <p>We appreciate your patience and understanding. If you have any additional information related to this request, please feel free to reply to this email.</p>
    <br/>
    <p>Kind Regards,</p>
    <p><b class="accent-emerald">Support Team</b><br/>SN Enviro Systems</p>
  `;
  return sendEmail(to, `Support Ticket Received: ${ticketId}`, content);
};

export const sendAssignmentNotification = async (to: string, ticketId: string, subject: string) => {
  const content = `
    <h2>New Ticket Assignment</h2>
    <p>You have been instantly assigned to a new telemetry or hardware fault ticket.</p>
    <p><b>Ticket ID:</b> <span class="accent-emerald">${ticketId}</span></p>
    <p><b>Subject:</b> ${subject}</p>
    <br/>
    <p>Please click the button below to deep link to the station profile and begin triage.</p>
    <a href="${process.env.DASHBOARD_URL || 'http://localhost:5173'}/tickets" class="button">Access Telemetry Dashboard</a>
  `;
  return sendEmail(to, `Action Required - Ticket Assigned: ${ticketId}`, content);
};

export const sendResolutionNotice = async (to: string, ticketId: string) => {
  const content = `
    <h2>Ticket Resolved</h2>
    <p>Ticket <b>${ticketId}</b> has been successfully resolved.</p>
    <br/>
    <p class="accent-emerald" style="font-weight: 600;">The telemetry anomaly has been successfully addressed and verified. Thank you for your patience and partnership.</p>
  `;
  return sendEmail(to, `Ticket Resolved: ${ticketId}`, content);
};
