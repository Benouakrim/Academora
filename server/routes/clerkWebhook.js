import express from 'express';
import { Webhook } from 'svix';
import { createOrUpdateUserFromClerk } from '../data/users.js';
import pool from '../database/pool.js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load .env from project root if launched from /server directory
const rootEnvPath = path.resolve(process.cwd(), '../.env');
if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
} else {
  dotenv.config();
}

const router = express.Router();

// Clerk webhook must be mounted BEFORE the Clerk middleware to avoid authentication checks
// This is already done in app.js - the webhook is mounted before parseUserToken middleware

// Clerk webhook endpoint to sync users
// This endpoint receives webhooks from Clerk when users are created/updated/deleted
// NOTE: express.raw() middleware is applied in app.js for this specific route
router.post('/clerk-webhook', async (req, res) => {
  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      console.error('[Clerk Webhook] ✗ CLERK_WEBHOOK_SECRET is not set in environment');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    // Debug: basic header and secret info (do not print full secret)
    console.log('[Clerk Webhook Debug] Incoming request');
    console.log('[Clerk Webhook Debug] Secret length:', WEBHOOK_SECRET.length, 'startsWith:', WEBHOOK_SECRET.slice(0, 6));
    console.log('[Clerk Webhook Debug] Raw headers subset:', {
      'svix-id': req.headers['svix-id'],
      'svix-timestamp': req.headers['svix-timestamp'],
      'svix-signature': req.headers['svix-signature'],
      'content-type': req.headers['content-type']
    });

    // Get the Svix headers for verification
    const svix_id = req.headers['svix-id'];
    const svix_timestamp = req.headers['svix-timestamp'];
    const svix_signature = req.headers['svix-signature'];

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error('[Clerk Webhook] ✗ Missing Svix headers');
      return res.status(400).json({ error: 'Missing svix headers' });
    }

    // Get the body as string (req.body is a Buffer from express.raw())
    const payloadBuffer = req.body;
    if (!Buffer.isBuffer(payloadBuffer)) {
      console.error('[Clerk Webhook Debug] Body is not a Buffer. Type:', typeof payloadBuffer);
      return res.status(400).json({ error: 'Invalid raw body' });
    }
    const payload = payloadBuffer.toString('utf8');
    console.log('[Clerk Webhook Debug] Payload length:', payload.length);

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
      console.log('[Clerk Webhook Debug] Verification succeeded. Event type:', evt?.type);
    } catch (err) {
      console.error('[Clerk Webhook] ✗ Webhook verification failed:', err.message);
      // Extra diagnostic: show first 60 chars of payload hash for mismatch investigation
      const crypto = await import('crypto');
      const hash = crypto.createHash('sha256').update(payload).digest('hex').slice(0, 32);
      console.log('[Clerk Webhook Debug] Payload sha256 (truncated):', hash);
      return res.status(400).json({ error: 'Webhook verification failed' });
    }

    // Handle the webhook
    const eventType = evt.type;
    console.log(`[Clerk Webhook] Received event: ${eventType} for user ${evt.data.id}`);

    if (eventType === 'user.created' || eventType === 'user.updated') {
      try {
        const user = await createOrUpdateUserFromClerk(evt.data);
        console.log(`[Clerk Webhook] ✓ Successfully processed ${eventType}:`, {
          clerkId: evt.data.id,
          email: evt.data.email_addresses?.[0]?.email_address,
          dbUserId: user.id,
          username: user.username
        });
      } catch (error) {
        console.error(`[Clerk Webhook] ✗ Error processing ${eventType}:`, {
          clerkId: evt.data.id,
          email: evt.data.email_addresses?.[0]?.email_address,
          error: error.message,
          code: error.code,
          stack: error.stack
        });
        // Don't fail the webhook - log the error but return success
        // This prevents Clerk from retrying indefinitely on permanent errors
      }
    } else if (eventType === 'user.deleted') {
      try {
        const clerkId = evt.data.id;
        console.log(`[Clerk Webhook] Processing user deletion for: ${clerkId}`);
        
        // Soft delete: Set status to 'deleted' to preserve relational integrity
        const result = await pool.query(
          `UPDATE users 
           SET status = 'deleted', updated_at = CURRENT_TIMESTAMP
           WHERE clerk_id = $1
           RETURNING id, email, clerk_id as "clerkId"`,
          [clerkId]
        );
        
        if (result.rows.length > 0) {
          console.log(`[Clerk Webhook] ✓ Soft-deleted user:`, {
            clerkId: result.rows[0].clerkId,
            email: result.rows[0].email,
            dbUserId: result.rows[0].id
          });
        } else {
          console.log(`[Clerk Webhook] ⚠ User not found for deletion: ${clerkId}`);
        }
      } catch (error) {
        console.error(`[Clerk Webhook] ✗ Error processing user.deleted:`, {
          clerkId: evt.data.id,
          error: error.message,
          stack: error.stack
        });
      }
    } else {
      console.log(`[Clerk Webhook] Ignoring event type: ${eventType}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;

