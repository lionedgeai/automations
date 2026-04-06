/**
 * Resend Email Provider
 * Sends real emails via Resend API for campaign delivery.
 */

const { Resend } = require('resend');
const { logAIEvent } = require('../ai/logger');

let _resend = null;

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!_resend) {
    _resend = new Resend(apiKey);
  }
  return _resend;
}

function resetResendClient() {
  _resend = null;
}

function getFromAddress() {
  return process.env.RESEND_FROM || 'NVISION Eye Centers <onboarding@resend.dev>';
}

function buildEmailHtml(patientName, subject, body, procedureInterest) {
  const procedure = procedureInterest || 'eye care';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f0f4f8; font-family: Montserrat, 'Helvetica Neue', Helvetica, Arial, sans-serif; }
    .wrapper { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; }
    .header { background: #006eb6; padding: 28px 40px; text-align: center; }
    .header img { width: 60px; height: 60px; border-radius: 50%; background: #fff; padding: 3px; margin-bottom: 8px; }
    .header h1 { color: #ffffff; font-size: 24px; margin: 0 0 2px 0; letter-spacing: 2px; font-weight: 700; }
    .header p { color: #a0d2f0; font-size: 13px; margin: 0; font-weight: 400; }
    .accent-bar { height: 4px; background: linear-gradient(90deg, #006eb6 0%, #eeae18 50%, #006eb6 100%); }
    .content { padding: 36px 40px; color: #343434; line-height: 1.7; font-size: 15px; }
    .content p { margin: 0 0 14px 0; }
    .greeting { font-size: 17px; color: #006eb6; font-weight: 600; margin-bottom: 18px; }
    .cta-wrapper { text-align: center; margin: 28px 0; }
    .cta { display: inline-block; background: #eeae18; color: #1a1a1a !important; text-decoration: none; padding: 14px 36px; border-radius: 6px; font-weight: 700; font-size: 15px; letter-spacing: 0.3px; }
    .footer { background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0; }
    .footer p { color: #94a3b8; font-size: 11px; margin: 4px 0; }
    .footer a { color: #006eb6; text-decoration: underline; }
    .footer .tagline { color: #006eb6; font-weight: 600; font-size: 12px; }
    .badge { display: inline-block; background: #e8f4fd; color: #006eb6; padding: 4px 14px; border-radius: 999px; font-size: 11px; font-weight: 600; margin-bottom: 14px; letter-spacing: 0.5px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <img src="https://www.nvisioncenters.com/wp-content/uploads/Nvision-Circle-Logo.png" alt="NVISION" />
      <h1>NVISION</h1>
      <p>Eye Centers &mdash; The Eye Doctors' #1 Choice&reg;</p>
    </div>
    <div class="accent-bar"></div>
    <div class="content">
      <span class="badge">${procedure.toUpperCase()}</span>
      <div class="greeting">Hi ${patientName},</div>
      ${body.split('\n').filter(l => l.trim()).map(p => `<p>${p}</p>`).join('\n      ')}
      <div class="cta-wrapper">
        <a href="https://www.nvisioncenters.com/schedule-exam/" class="cta">Schedule Your Consultation &#8594;</a>
      </div>
    </div>
    <div class="footer">
      <p class="tagline">The Eye Doctors' #1 Choice&reg;</p>
      <p><strong>NVISION Eye Centers</strong> &mdash; 135+ locations nationwide</p>
      <p style="margin-top: 10px;">
        <a href="#">Unsubscribe</a> &middot; <a href="#">Privacy Policy</a> &middot; <a href="https://www.nvisioncenters.com">Visit Website</a>
      </p>
      <p>&copy; ${new Date().getFullYear()} NVISION Eye Centers. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}

async function sendEmail({ to, patientName, subject, body, procedureInterest, campaignId, recipientId }) {
  const client = getResendClient();
  if (!client) {
    throw new Error('Resend API key not configured. Set it in Settings → Email Delivery.');
  }

  const html = buildEmailHtml(patientName, subject, body, procedureInterest);
  const from = getFromAddress();

  logAIEvent({
    provider: 'resend',
    operation: 'sendEmail',
    status: 'start',
    detail: `Sending to ${to} — "${subject}"`,
    output: { to, subject, campaignId, recipientId },
  });

  try {
    const result = await client.emails.send({
      from,
      to: [to],
      subject,
      html,
    });

    if (result.error) {
      throw new Error(result.error.message || JSON.stringify(result.error));
    }

    logAIEvent({
      provider: 'resend',
      operation: 'sendEmail',
      status: 'success',
      detail: `Delivered to ${to} — ID: ${result.data?.id}`,
      output: { emailId: result.data?.id, to, subject },
    });

    return { success: true, emailId: result.data?.id };
  } catch (err) {
    logAIEvent({
      provider: 'resend',
      operation: 'sendEmail',
      status: 'error',
      detail: `Failed for ${to}: ${err.message}`,
      output: { to, error: err.message },
    });
    throw err;
  }
}

async function testConnection() {
  const client = getResendClient();
  if (!client) {
    return { success: false, message: 'No Resend API key configured' };
  }
  try {
    const result = await client.emails.send({
      from: getFromAddress(),
      to: ['delivered@resend.dev'],
      subject: 'NVISION Test',
      html: '<p>Connection test</p>',
    });
    if (result.error) {
      return { success: false, message: result.error.message };
    }
    return { success: true, message: `Resend connected — test email ID: ${result.data?.id}` };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

module.exports = { sendEmail, testConnection, resetResendClient, getResendClient, getFromAddress, buildEmailHtml };
