const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User    = require('../models/User');
const Payment = require('../models/Payment');

const PLANS = {
  monthly: { priceId: process.env.STRIPE_MONTHLY_PRICE_ID, amount: 1999 }, // £19.99
  yearly:  { priceId: process.env.STRIPE_YEARLY_PRICE_ID,  amount: 19900 }, // £199/yr
};

// @desc   Create Stripe checkout session
// @route  POST /api/payments/create-checkout
exports.createCheckout = async (req, res) => {
  const { plan } = req.body;
  if (!PLANS[plan]) return res.status(400).json({ success: false, message: 'Invalid plan' });

  try {
    let customerId = req.user.subscription.stripeCustomerId;

    // Create Stripe customer if not exists
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name:  `${req.user.firstName} ${req.user.lastName}`,
        metadata: { userId: req.user._id.toString() },
      });
      customerId = customer.id;
      await User.findByIdAndUpdate(req.user._id, { 'subscription.stripeCustomerId': customerId });
    }

    const session = await stripe.checkout.sessions.create({
      customer:    customerId,
      mode:        'subscription',
      payment_method_types: ['card'],
      line_items:  [{ price: PLANS[plan].priceId, quantity: 1 }],
      success_url: `${process.env.CLIENT_URL}/dashboard?subscribed=true`,
      cancel_url:  `${process.env.CLIENT_URL}/pricing?cancelled=true`,
      metadata:    { userId: req.user._id.toString(), plan },
      subscription_data: { metadata: { userId: req.user._id.toString(), plan } },
    });

    res.json({ success: true, url: session.url });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Create Stripe customer portal session
// @route  POST /api/payments/portal
exports.createPortal = async (req, res) => {
  try {
    const customerId = req.user.subscription.stripeCustomerId;
    if (!customerId) return res.status(400).json({ success: false, message: 'No subscription found' });

    const session = await stripe.billingPortal.sessions.create({
      customer:   customerId,
      return_url: `${process.env.CLIENT_URL}/dashboard/subscription`,
    });

    res.json({ success: true, url: session.url });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Stripe webhook handler
// @route  POST /api/payments/webhook
exports.webhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature failed:', err.message);
    return res.status(400).json({ message: `Webhook Error: ${err.message}` });
  }

  try {
    switch (event.type) {

      case 'checkout.session.completed': {
        const session  = event.data.object;
        const userId   = session.metadata.userId;
        const plan     = session.metadata.plan;
        const subId    = session.subscription;
        const sub      = await stripe.subscriptions.retrieve(subId);
        await User.findByIdAndUpdate(userId, {
          'subscription.stripeSubscriptionId': subId,
          'subscription.plan':   plan,
          'subscription.status': 'active',
          'subscription.currentPeriodEnd': new Date(sub.current_period_end * 1000),
        });
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice  = event.data.object;
        const customer = await stripe.customers.retrieve(invoice.customer);
        const user     = await User.findOne({ email: customer.email });
        if (user) {
          const sub = await stripe.subscriptions.retrieve(invoice.subscription);
          await User.findByIdAndUpdate(user._id, {
            'subscription.status': 'active',
            'subscription.currentPeriodEnd': new Date(sub.current_period_end * 1000),
          });
          await Payment.create({
            userId:         user._id,
            stripeInvoiceId:invoice.id,
            amount:         invoice.amount_paid,
            currency:       invoice.currency,
            plan:           user.subscription.plan,
            status:         'succeeded',
            periodStart:    new Date(invoice.period_start * 1000),
            periodEnd:      new Date(invoice.period_end   * 1000),
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice  = event.data.object;
        const customer = await stripe.customers.retrieve(invoice.customer);
        const user     = await User.findOne({ email: customer.email });
        if (user) await User.findByIdAndUpdate(user._id, { 'subscription.status': 'past_due' });
        break;
      }

      case 'customer.subscription.deleted': {
        const sub  = event.data.object;
        const user = await User.findOne({ 'subscription.stripeSubscriptionId': sub.id });
        if (user) await User.findByIdAndUpdate(user._id, { 'subscription.status': 'cancelled' });
        break;
      }

      case 'customer.subscription.updated': {
        const sub  = event.data.object;
        const user = await User.findOne({ 'subscription.stripeSubscriptionId': sub.id });
        if (user) {
          await User.findByIdAndUpdate(user._id, {
            'subscription.status':            sub.status === 'active' ? 'active' : sub.status,
            'subscription.cancelAtPeriodEnd': sub.cancel_at_period_end,
            'subscription.currentPeriodEnd':  new Date(sub.current_period_end * 1000),
          });
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook handling error:', err);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

// @desc   Get payment history for current user
// @route  GET /api/payments/history
exports.getHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
