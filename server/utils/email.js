const { Resend } = require('resend');

if (!process.env.RESEND_API_KEY) {
  console.error('RESEND_API_KEY is not set - emails will not be sent');
}

const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');

const FROM_EMAIL = 'Gridnest <onboarding@resend.dev>';
const TO_EMAIL = process.env.EMAIL_TO || 'vishalsahu6392@gmail.com';

const sendContactEmail = async ({ fullName, email, phone, company, country, state, service, message, templateSource }) => {
  const html = `
    <h2>New Contact Inquiry</h2>
    <table style="border-collapse:collapse;width:100%">
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Name</td><td style="padding:8px;border:1px solid #ddd">${fullName}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Email</td><td style="padding:8px;border:1px solid #ddd">${email}</td></tr>
      ${phone ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Phone</td><td style="padding:8px;border:1px solid #ddd">${phone}</td></tr>` : ''}
      ${company ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Company</td><td style="padding:8px;border:1px solid #ddd">${company}</td></tr>` : ''}
      ${country ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Country</td><td style="padding:8px;border:1px solid #ddd">${country}</td></tr>` : ''}
      ${state ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">State</td><td style="padding:8px;border:1px solid #ddd">${state}</td></tr>` : ''}
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Service</td><td style="padding:8px;border:1px solid #ddd">${service}</td></tr>
      ${templateSource ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Template</td><td style="padding:8px;border:1px solid #ddd">${templateSource}</td></tr>` : ''}
    </table>
    <h3>Message:</h3>
    <p style="background:#f5f5f5;padding:15px;border-radius:5px">${message}</p>
    <hr/>
    <p style="color:#666;font-size:12px">Reply to: ${email}</p>
  `;

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: [TO_EMAIL],
    subject: `${service ? `[${service}] ` : ''}New inquiry from ${fullName}`,
    html,
    replyTo: email,
  });

  if (error) {
    console.error('Resend contact email error:', error.message);
    throw new Error(error.message);
  }
  return data;
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

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: [TO_EMAIL],
    subject: `New Booking - ${guestName} - ${roomName || 'Website'}`,
    html,
    replyTo: email,
  });

  if (error) {
    console.error('Resend booking email error:', error.message);
    throw new Error(error.message);
  }
  return data;
};

const sendWelcomeEmail = async (email, name) => {
  return resend.emails.send({
    from: FROM_EMAIL,
    to: [email],
    subject: `Welcome to ${process.env.CLIENT_NAME || 'Gridnest'}!`,
    html: `<h2>Welcome, ${name}!</h2><p>Thank you for subscribing. We'll keep you updated.</p>`,
  });
};

const sendSubscriptionNotification = async (email) => {
  return resend.emails.send({
    from: FROM_EMAIL,
    to: [TO_EMAIL],
    subject: 'New Newsletter Subscriber',
    html: `<p>New subscriber: <strong>${email}</strong></p>`,
  });
};

const sendEmail = async ({ to, subject, html }) => {
  return resend.emails.send({
    from: FROM_EMAIL,
    to: [to],
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
