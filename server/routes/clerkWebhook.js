import express from 'express';
import { Webhook } from 'svix';
import { createOrUpdateUserFromClerk } from '../data/users.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Clerk webhook must be mounted BEFORE the Clerk middleware to avoid authentication checks
// This is already done in app.js - the webhook is mounted before parseUserToken middleware

// Clerk webhook endpoint to sync users
// This endpoint receives webhooks from Clerk when users are created/updated/deleted
router.post('/clerk-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      console.error('CLERK_WEBHOOK_SECRET is not set');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    // Get the Svix headers for verification
    const svix_id = req.headers['svix-id'];
    const svix_timestamp = req.headers['svix-timestamp'];
    const svix_signature = req.headers['svix-signature'];

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return res.status(400).json({ error: 'Missing svix headers' });
    }

    // Get the body as string (it's already raw JSON from express.raw())
    const payload = req.body.toString('utf8');
    const body = JSON.parse(payload);

    // Create a new Svix instance with your webhook secret
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt;

    // Verify the payload with the headers
    try {
      evt = wh.verify(payload, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      });
    } catch (err) {
      console.error('Webhook verification failed:', err);
      return res.status(400).json({ error: 'Webhook verification failed' });
    }

    // Handle the webhook
    const eventType = evt.type;

    if (eventType === 'user.created' || eventType === 'user.updated') {
      try {
        await createOrUpdateUserFromClerk(evt.data);
        console.log(`User ${eventType}: ${evt.data.id} - ${evt.data.email_addresses?.[0]?.email_address}`);
      } catch (error) {
        console.error(`Error processing ${eventType}:`, error);
        // Don't fail the webhook - log the error but return success
        // This prevents Clerk from retrying indefinitely
      }
    } else if (eventType === 'user.deleted') {
      // Optionally handle user deletion
      // For now, we'll just mark the user as deleted or do nothing
      console.log(`User deleted: ${evt.data.id}`);
      // Note: You may want to soft-delete or actually delete the user
      // For safety, we'll keep the user in the database for now
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;

