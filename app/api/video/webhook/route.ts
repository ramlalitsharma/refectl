import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import crypto from 'crypto';

/**
 * Mux webhook handler for video processing events
 * Handles: video.asset.ready, video.asset.errored, etc.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('mux-signature');

    // Verify webhook signature (if MUX_WEBHOOK_SECRET is set)
    if (process.env.MUX_WEBHOOK_SECRET && signature) {
      const hmac = crypto.createHmac('sha256', process.env.MUX_WEBHOOK_SECRET);
      const digest = hmac.update(body).digest('hex');
      
      if (signature !== digest) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const event = JSON.parse(body);

    // Handle different event types
    if (event.type === 'video.asset.ready') {
      const { data } = event;
      const assetId = data.id;
      const playbackId = data.playback_ids?.[0]?.id;

      if (assetId && playbackId) {
        const db = await getDatabase();
        
        // Update video record in database
        await db.collection('videos').updateOne(
          { muxUploadId: data.passthrough || assetId },
          {
            $set: {
              muxAssetId: assetId,
              playbackId: playbackId,
              status: 'ready',
              duration: data.duration,
              updatedAt: new Date(),
            },
          },
          { upsert: true }
        );
      }
    } else if (event.type === 'video.asset.errored') {
      const { data } = event;
      const db = await getDatabase();
      
      await db.collection('videos').updateOne(
        { muxAssetId: data.id },
        {
          $set: {
            status: 'errored',
            error: data.errors?.message || 'Processing failed',
            updatedAt: new Date(),
          },
        }
      );
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Mux webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed', message: error.message },
      { status: 500 }
    );
  }
}

