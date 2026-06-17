import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const testSMTP = async () => {
  console.log('Testing SMTP Connection...');
  console.log('Host:', process.env.SMTP_HOST);
  console.log('Port:', process.env.SMTP_PORT);
  console.log('User:', process.env.SMTP_USER);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.verify();
    console.log('✅ SMTP Connection Successful! Your credentials are correct.');
  } catch (error) {
    console.error('❌ SMTP Connection Failed:', (error as Error).message);
    console.log('Make sure you have generated a Google App Password and have 2-Step Verification enabled.');
  }
};

testSMTP();
