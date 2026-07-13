const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,
});

const sendContactEmail = async ({ fullName, email, phone, company, service, message, templateSource }) => {
  const html = `
    <h2>New Contact Inquiry</h2>
    <table style="border-collapse:collapse;width:100%">
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Name</td><td style="padding:8px;border:1px solid #ddd">${fullName}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Email</td><td style="padding:8px;border:1px solid #ddd">${email}</td></tr>
      ${phone ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Phone</td><td style="padding:8px;border:1px solid #ddd">${phone}</td></tr>` : ''}
      ${company ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Company</td><td style="padding:8px;border:1px solid #ddd">${company}</td></tr>` : ''}
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Service</td><td style="padding:8px;border:1px solid #ddd">${service}</td></tr>
      ${templateSource ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Template</td><td style="padding:8px;border:1px solid #ddd">${templateSource}</td></tr>` : ''}
    </table>
    <h3>Message:</h3>
    <p style="background:#f5f5f5;padding:15px;border-radius:5px">${message}</p>
  `;

  return transporter.sendMail({
    from: `"${process.env.CLIENT_NAME || 'Gridnest'}" <${process.env.SMTP_USER}>`,
    to: process.env.EMAIL_TO || process.env.SMTP_USER,
    subject: `${service ? `[${service}] ` : ''}New inquiry from ${fullName}`,
    html,
  });
};

const sendBookingEmail = async ({ guestName, email, phone, roomName, checkIn, checkOut, adults, children, specialRequests }) => {
  const html = `
    <h2>New Booking Request</h2>
    <table style="border-collapse:collapse;width:100%">
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Guest</td><td style="padding:8px;border:1px solid #ddd">${guestName}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Email</td><td style="padding:8px;border:1px solid #ddd">${email}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Phone</td><td style="padding:8px;border:1px solid #ddd">${phone}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Room</td><td style="padding:8px;border:1px solid #ddd">${roomName || 'Not specified'}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Check In</td><td style="padding:8px;border:1px solid #ddd">${new Date(checkIn).toLocaleDateString()}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Check Out</td><td style="padding:8px;border:1px solid #ddd">${new Date(checkOut).toLocaleDateString()}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Guests</td><td style="padding:8px;border:1px solid #ddd">${adults} Adults, ${children} Children</td></tr>
      ${specialRequests ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Requests</td><td style="padding:8px;border:1px solid #ddd">${specialRequests}</td></tr>` : ''}
    </table>
  `;

  return transporter.sendMail({
    from: `"${process.env.CLIENT_NAME || 'Gridnest'}" <${process.env.SMTP_USER}>`,
    to: process.env.EMAIL_TO || process.env.SMTP_USER,
    subject: `New Booking - ${guestName} - ${roomName || 'Website'}`,
    html,
  });
};

const sendWelcomeEmail = async (email, name) => {
  return transporter.sendMail({
    from: `"${process.env.CLIENT_NAME || 'Gridnest'}" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Welcome to ${process.env.CLIENT_NAME || 'Gridnest'}!`,
    html: `<h2>Welcome, ${name}!</h2><p>Thank you for subscribing. We'll keep you updated.</p>`,
  });
};

const sendSubscriptionNotification = async (email) => {
  return transporter.sendMail({
    from: `"${process.env.CLIENT_NAME || 'Gridnest'}" <${process.env.SMTP_USER}>`,
    to: process.env.EMAIL_TO || process.env.SMTP_USER,
    subject: 'New Newsletter Subscriber',
    html: `<p>New subscriber: <strong>${email}</strong></p>`,
  });
};

const sendEmail = async ({ to, subject, html }) => {
  return transporter.sendMail({
    from: `"${process.env.CLIENT_NAME || 'Gridnest'}" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
};

module.exports = {
  sendEmail,
  sendContactEmail,
  sendBookingEmail,
  sendWelcomeEmail,
  sendSubscriptionNotification,
};
