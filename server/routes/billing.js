import express from 'express';
import Stripe from 'stripe';
import { parseUserToken, requireUser } from '../middleware/auth.js';
import prisma from '../database/prisma.js';

const router = express.Router();

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecret ? new Stripe(stripeSecret) : null;

if (!stripeSecret) {
  console.warn('Stripe not configured (STRIPE_SECRET_KEY missing). Billing routes will return 503.');
}

async function getPlanIdByKey(planKey) {
  try {
    const plan = await prisma.plan.findUnique({
      where: { key: planKey },
      select: { id: true }
    });
    return plan?.id || null;
  } catch (error) {
    console.error('Error fetching plan by key:', error);
    return null;
  }
}

// Create checkout session for a plan
router.post('/checkout', parseUserToken, requireUser, async (req, res) => {
  try {
    if (!stripe) return res.status(503).json({ error: 'Billing not configured' });
    const { plan } = req.body || {};
    const map = {
      free: process.env.STRIPE_PRICE_FREE,
      pro: process.env.STRIPE_PRICE_PRO,
      team: process.env.STRIPE_PRICE_TEAM,
    };
    const price = map[plan];
    if (!price) return res.status(400).json({ error: 'Unknown plan' });

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price, quantity: 1 }],
      success_url: `${(process.env.FRONTEND_URL || '').replace(/\/$/, '')}/pricing?success=true`,
      cancel_url: `${(process.env.FRONTEND_URL || '').replace(/\/$/, '')}/pricing?canceled=true`,
      client_reference_id: String(req.user.id),
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Stripe webhook to update subscription status and plan_id
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    if (!stripe) return res.status(503).end();
    const sig = req.headers['stripe-signature'];
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    let event = req.body;

    if (secret) {
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, secret);
      } catch (err) {
        console.error('Stripe signature verification failed', err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.client_reference_id;
      const priceId = session?.lines?.data?.[0]?.price?.id || session?.subscription_details?.metadata?.price_id;

      // Map priceId to plan key
      let planKey = null;
      if (priceId === process.env.STRIPE_PRICE_PRO) planKey = 'pro';
      if (priceId === process.env.STRIPE_PRICE_TEAM) planKey = 'team';

      if (userId && planKey) {
        const planId = await getPlanIdByKey(planKey);
        if (planId) {
          try {
            await prisma.user.update({
              where: { id: userId },
              data: {
                plan_id: planId,
                subscription_status: 'active'
              }
            });
          } catch (error) {
            console.error('Failed to update user plan', error);
          }
        }
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Stripe webhook handler error', err);
    res.status(500).end();
  }
});

export default router;
