const nodemailer = require('nodemailer');
const User = require('../models/User');

const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST,
  port:   parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const send = async (to, subject, html) => {
  try {
    await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html });
  } catch (err) {
    console.error('Email send error:', err.message);
  }
};

const baseTemplate = (content) => `
<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0a0a0a;font-family:sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:32px 16px;">
  <div style="background:#111;border:1px solid #222;border-radius:16px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#1a4731,#0d3d4f);padding:32px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:28px;letter-spacing:-0.5px;">Golf Charity Platform</h1>
      <p style="color:#9ca3af;margin:8px 0 0;font-size:14px;">Compete. Give. Win.</p>
    </div>
    <div style="padding:32px;color:#e5e7eb;">${content}</div>
    <div style="padding:16px 32px;border-top:1px solid #222;text-align:center;">
      <p style="color:#4b5563;font-size:12px;margin:0;">Golf Charity Subscription Platform · Unsubscribe</p>
    </div>
  </div>
</div></body></html>`;

// Send draw results to all active subscribers
exports.sendDrawResults = async (draw) => {
  try {
    const users = await User.find({ 'subscription.status': 'active' }).select('email firstName');
    const numbers = draw.drawNumbers.join(' · ');

    for (const user of users) {
      const isWinner = draw.winners.some(w => w.userId.toString() === user._id.toString());
      const content = isWinner
        ? `<h2 style="color:#34d399;margin-top:0;">🎉 You won!</h2>
           <p>Hi ${user.firstName}, you matched this month's draw. Check your dashboard to upload your verification proof.</p>
           <p style="font-size:24px;letter-spacing:8px;text-align:center;color:#fff;font-weight:700;">${numbers}</p>
           <a href="${process.env.CLIENT_URL}/dashboard" style="display:inline-block;background:#34d399;color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:16px;">Claim Prize →</a>`
        : `<h2 style="color:#fff;margin-top:0;">This month's draw results</h2>
           <p>Hi ${user.firstName}, the draw for ${draw.month}/${draw.year} has been published.</p>
           <p style="font-size:24px;letter-spacing:8px;text-align:center;color:#fff;font-weight:700;">${numbers}</p>
           <p style="color:#9ca3af;">Better luck next month! Keep entering your scores to participate.</p>`;

      await send(user.email, isWinner ? '🏆 You matched the draw!' : `Draw results for ${draw.month}/${draw.year}`, baseTemplate(content));
    }
  } catch (err) {
    console.error('sendDrawResults error:', err.message);
  }
};

// Welcome email on registration
exports.sendWelcome = async (user) => {
  const content = `
    <h2 style="color:#fff;margin-top:0;">Welcome, ${user.firstName}!</h2>
    <p>You've joined the Golf Charity Platform. Here's what to do next:</p>
    <ol style="color:#d1d5db;line-height:2;">
      <li>Choose a subscription plan</li>
      <li>Enter your latest 5 Stableford scores</li>
      <li>Select a charity to support</li>
      <li>Participate in monthly prize draws</li>
    </ol>
    <a href="${process.env.CLIENT_URL}/pricing" style="display:inline-block;background:#34d399;color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:16px;">Get Started →</a>`;
  await send(user.email, 'Welcome to Golf Charity Platform', baseTemplate(content));
};

// Subscription confirmation
exports.sendSubscriptionConfirmation = async (user, plan) => {
  const content = `
    <h2 style="color:#fff;margin-top:0;">Subscription confirmed!</h2>
    <p>Hi ${user.firstName}, your <strong style="color:#34d399;">${plan}</strong> plan is now active.</p>
    <p style="color:#9ca3af;">A portion of your subscription automatically goes to your chosen charity every month.</p>
    <a href="${process.env.CLIENT_URL}/dashboard" style="display:inline-block;background:#34d399;color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:16px;">Go to Dashboard →</a>`;
  await send(user.email, 'Subscription Active — Golf Charity Platform', baseTemplate(content));
};
