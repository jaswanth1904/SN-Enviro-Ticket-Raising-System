import nodemailer from 'nodemailer';
import path from 'path';

let transporter: nodemailer.Transporter | null = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const transportOptions: any = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    secure: process.env.SMTP_PORT === '465' || process.env.SMTP_PORT === undefined, // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
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
      body { font-family: 'Inter', 'Segoe UI', Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0; color: #1f2937; }
      .email-container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e5e7eb; }
      .header { background-color: #ffffff; border-bottom: 3px solid #2563eb; padding: 30px; text-align: center; color: #1e40af; }
      .header img { max-height: 50px; margin-bottom: 15px; }
      .header h1 { margin: 0; font-size: 24px; font-weight: 700; color: #1e3a8a; letter-spacing: -0.5px; }
      .content { padding: 40px; color: #374151; line-height: 1.7; font-size: 15px; }
      .content p { margin: 0 0 15px 0; }
      .footer { background-color: #f9fafb; padding: 25px; text-align: center; color: #6b7280; font-size: 13px; border-top: 1px solid #e5e7eb; }
      .info-box { background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #3b82f6; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
      .info-box p { margin: 8px 0; color: #1e293b; font-size: 14px; }
      .accent-blue { color: #2563eb; font-weight: 600; }
      .greeting { font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 20px; }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="header">
        <img src="https://jaswanth1904-snenviroticket.vercel.app/logo.jpeg" alt="SN Enviro Logo" />
        <h1>SN Enviro Ticket System</h1>
      </div>
      <div class="content">
        ${htmlContent}
      </div>
      <div class="footer">
        <p>This is an automated notification from the SN Enviro Ticket System.</p>
        <p>Please do not reply directly to this email.</p>
        <p>© 2026 SN Enviro. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
`;

export const sendEmail = async (to: string, subject: string, htmlContent: string) => {
  try {
    const isProd = process.env.NODE_ENV === 'production';
    if (isProd) {
      // Proxy through Vercel to bypass Render's strict SMTP firewall (Free Tier Port 465 Block)
      const response = await fetch('https://jaswanth1904-snenviroticket.vercel.app/api/sendEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to,
          subject,
          htmlContent: renderTemplate(htmlContent),
          smtpUser: process.env.SMTP_USER,
          smtpPass: process.env.SMTP_PASS,
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Vercel proxy failed');
      console.log('✅ Message sent successfully via Vercel: %s', data.messageId);
      return data;
    }

    const mailOptions = {
      from: `"SN Enviro Ticket System" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      html: renderTemplate(htmlContent)
    };
    const info = await getTransporter().sendMail(mailOptions);
    console.log('✅ Message sent successfully: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw new Error('Email dispatch failed');
  }
};

export const sendRegistrationAcknowledgement = async (
  to: string, 
  ticketId: string, 
  subject: string, 
  description: string,
  remoteSoftware?: string,
  remoteId?: string,
  remotePassword?: string
) => {
  let remoteBlock = '';
  if (remoteSoftware && remoteSoftware !== 'None') {
    remoteBlock = `
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #e2e8f0; border-left: 4px solid #10b981;">
        <h3 style="margin-top: 0; color: #065f46; font-size: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; font-weight: 700;">Remote Access Details</h3>
        <p style="margin: 6px 0; color: #334155; font-size: 14px;"><b>Software:</b> ${remoteSoftware}</p>
        <p style="margin: 6px 0; color: #334155; font-size: 14px;"><b>User ID / Name:</b> ${remoteId || 'N/A'}</p>
        <p style="margin: 6px 0; color: #334155; font-size: 14px;"><b>Password:</b> ${remotePassword || 'N/A'}</p>
      </div>
    `;
  }

  const content = `
    <p style="font-size: 16px; color: #4b5563; margin-bottom: 20px;">Dear Valued Customer,</p>
    <p>Thank you for reaching out. Your support ticket has been received and assigned to our team.</p>
    
    <div class="info-box">
      <p><b>Ticket ID:</b> ${ticketId}</p>
      <p><b>Subject:</b> ${subject}</p>
    </div>

    ${remoteBlock}

    <p>We are actively working to resolve your issue as quickly as possible. You will be notified of any updates.</p>
    <br/>
    <p>Best regards,</p>
    <p><b class="accent-blue">SN Enviro Ticket System</b></p>
  `;
  return sendEmail(to, `Support Ticket Received: ${ticketId}`, content);
};

export const sendAssignmentNotification = async (
  to: string, 
  ticketId: string, 
  subject: string, 
  category: string, 
  description: string, 
  stationDetails: string,
  remoteSoftware?: string,
  remoteId?: string,
  remotePassword?: string
) => {
  let remoteBlock = '';
  if (remoteSoftware && remoteSoftware !== 'None') {
    remoteBlock = `
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #e2e8f0; border-left: 4px solid #10b981;">
        <h3 style="margin-top: 0; color: #065f46; font-size: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; font-weight: 700;">Remote Access Details</h3>
        <p style="margin: 6px 0; color: #334155; font-size: 14px;"><b>Software:</b> ${remoteSoftware}</p>
        <p style="margin: 6px 0; color: #334155; font-size: 14px;"><b>User ID / Name:</b> ${remoteId || 'N/A'}</p>
        <p style="margin: 6px 0; color: #334155; font-size: 14px;"><b>Password:</b> ${remotePassword || 'N/A'}</p>
      </div>
    `;
  }

  const content = `
    <p style="font-size: 16px; color: #4b5563; margin-bottom: 20px;">Dear Engineer,</p>
    <p>A new support ticket has been assigned to you for immediate resolution. Please review the complete details of the issue below.</p>
    
    <div class="info-box">
      <p><b>Ticket ID:</b> ${ticketId}</p>
      <p><b>Subject:</b> ${subject}</p>
      <p><b>Category:</b> ${category}</p>
      <p><b>Plant / Station:</b> ${stationDetails}</p>
    </div>
    
    ${remoteBlock}
    
    <div style="background-color: #ffffff; padding: 25px; border: 1px solid #e5e7eb; border-radius: 8px; margin: 25px 0;">
      <h3 style="margin-top: 0; color: #1e3a8a; font-size: 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">Issue Description</h3>
      <p style="color: #4b5563; margin: 15px 0 0 0; font-size: 14px; white-space: pre-wrap; line-height: 1.6;">${description}</p>
    </div>
    
    <p>Please begin troubleshooting this issue at the plant. Once resolved, contact your Service Manager or Admin to officially close the ticket.</p>
    <br/>
    <p>Best regards,</p>
    <p><b class="accent-blue">SN Enviro Ticket System</b></p>
  `;
  return sendEmail(to, `Action Required: Ticket Assigned (${ticketId})`, content);
};

export const sendResolutionNotice = async (to: string, ticketId: string) => {
  const content = `
    <p style="font-size: 16px; color: #4b5563; margin-bottom: 20px;">Dear Valued Customer,</p>
    <p>We are pleased to inform you that your support ticket has been successfully resolved by our engineering team.</p>
    
    <div class="info-box">
      <p><b>Ticket ID:</b> ${ticketId}</p>
    </div>
    
    <p>We hope the service met your expectations. If the problem persists, please contact the Service Manager.</p>
    <br/>
    <p>Best regards,</p>
    <p><b class="accent-blue">SN Enviro Ticket System</b></p>
  `;
  return sendEmail(to, `Ticket Resolved: ${ticketId}`, content);
};
