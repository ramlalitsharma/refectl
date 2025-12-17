// POST /api/ai/chat
// Endpoint for AI Tutor Chat

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { AIService } from '@/lib/ai-service';
import { sanitizeString } from '@/lib/security';
import { createErrorResponse, createSuccessResponse } from '@/lib/error-handler';
import { rateLimit } from '@/lib/rate-limit';
import { getClientIP } from '@/lib/security';

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return createErrorResponse(
                new Error('Unauthorized'),
                'Unauthorized',
                401
            );
        }

        // Rate limiting for AI chat
        const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
        const rateLimitKey = `ai-chat:${userId}:${clientIP}`;
        const rateLimitResult = await rateLimit({
            windowMs: 60000, // 1 minute
            max: 20, // 20 requests per minute
            key: rateLimitKey,
            identifier: `User:${userId}`,
        });

        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                {
                    error: 'Too many requests. Please wait before sending another message.',
                    retryAfter: rateLimitResult.retryAfter,
                },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(rateLimitResult.retryAfter || 60),
                    },
                }
            );
        }

        const body = await request.json();
        const rawMessage = String(body?.message || '').trim();
        const history = Array.isArray(body?.history) ? body.history : [];

        if (!rawMessage) {
            return createErrorResponse(
                new Error('Message required'),
                'Message is required',
                400
            );
        }

        // Sanitize and validate message
        const message = sanitizeString(rawMessage, 2000);
        if (message.length < 1) {
            return createErrorResponse(
                new Error('Message too short'),
                'Message must contain at least 1 character',
                400
            );
        }

        // Validate history array length
        if (history.length > 50) {
            return createErrorResponse(
                new Error('History too long'),
                'Conversation history is too long',
                400
            );
        }

        // Sanitize history messages
        const sanitizedHistory = history
            .slice(0, 50)
            .map((item: any) => ({
                role: sanitizeString(String(item.role || 'user'), 20),
                content: sanitizeString(String(item.content || ''), 2000),
            }))
            .filter((item: any) => item.content.length > 0);

        const response = await AIService.chat(message, sanitizedHistory);

        return createSuccessResponse(
            { message: response },
            undefined,
            200
        );

    } catch (error: unknown) {
        return createErrorResponse(error, 'Failed to process chat message', 500);
    }
}
