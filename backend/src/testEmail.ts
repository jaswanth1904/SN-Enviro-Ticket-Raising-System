import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const testSMTP = async () => {
  console.log('Testing SMTP Connection...');
  console.log('Host:', process.env.SMTP_HOST);
  console.log('Port:', process.env.SMTP_PORT);
  console.log('User:', process.env.SMTP_USER);

  const port = parseInt(process.env.SMTP_PORT || '465');
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.verify();
    console.log('✅ SMTP Connection Successful! Your credentials are correct.');

    console.log('Sending test email to aj19.jaswanth@gmail.com...');
    const info = await transporter.sendMail({
      from: `"SN Enviro Test" <${process.env.SMTP_USER}>`,
      to: 'aj19.jaswanth@gmail.com',
      subject: 'Test Email from SN Enviro System',
      text: 'This is a plain text test email to verify SMTP delivery works fine.',
      html: '<h1>SMTP test successful!</h1><p>If you see this, the SN Enviro ticket email system is working.</p>',
    });
    console.log('✅ Test email sent! Message ID:', info.messageId);
  } catch (error) {
    console.error('❌ SMTP Connection or Send Failed:', (error as Error).message);
    console.log('Error details:', error);
  }
};

testSMTP();
