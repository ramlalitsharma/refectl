// Security utilities for input validation and sanitization

import { NextRequest } from 'next/server';

/**
 * Sanitize string input to prevent XSS and injection attacks
 */
export function sanitizeString(input: string, maxLength = 10000): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    .slice(0, maxLength)
    // Remove script tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove other potentially dangerous tags
    .replace(/<(iframe|object|embed|applet|meta|link|base|style)\b[^>]*>|<\/(iframe|object|embed|applet|meta|link|base|style)>/gi, '')
    // Remove event handlers
    .replace(/\bon\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]*)/gi, '')
    // Remove javascript: and other dangerous pseudo-protocols
    .replace(/(javascript|vbscript|data):/gi, '')
    // Remove potentially dangerous characters
    .replace(/[<>]/g, '');
}

/**
 * Escape regex special characters to prevent ReDoS attacks
 */
export function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Validate and sanitize MongoDB query parameters
 * Deeply sanitizes objects and prevents top-level $ operators
 */
export function sanitizeMongoQuery(query: any): any {
  if (typeof query !== 'object' || query === null) {
    return {};
  }

  const sanitized: any = {};

  for (const [key, value] of Object.entries(query)) {
    // V-004 FIX: Block all $ prefixed keys at ANY level to prevent operator injection
    if (key.startsWith('$')) {
      console.warn(`Blocked potential NoSQL injection key: ${key}`);
      continue;
    }

    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'number') {
      if (isFinite(value)) {
        sanitized[key] = value;
      }
    } else if (value instanceof Date) {
      sanitized[key] = value;
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item =>
        (typeof item === 'object' && item !== null) ? sanitizeMongoQuery(item) :
          (typeof item === 'string' ? sanitizeString(item) : item)
      );
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeMongoQuery(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Validate ObjectId format
 */
export function isValidObjectId(id: string): boolean {
  if (typeof id !== 'string' || id.length !== 24) {
    return false;
  }
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Get client IP address from request
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip'); // Cloudflare

  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return 'unknown';
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}

/**
 * Rate limit key generator
 */
export function generateRateLimitKey(
  prefix: string,
  identifier: string,
  additional?: string
): string {
  return `${prefix}:${identifier}${additional ? `:${additional}` : ''}`;
}

/**
 * Validate file type from MIME type
 */
export function isValidFileType(
  mimeType: string,
  allowedTypes: string[]
): boolean {
  return allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      return mimeType.startsWith(type.slice(0, -2));
    }
    return mimeType === type;
  });
}

/**
 * Validate file size
 */
export function isValidFileSize(size: number, maxSize: number): boolean {
  return size > 0 && size <= maxSize;
}

/**
 * Sanitize filename to prevent path traversal
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.\./g, '_')
    .slice(0, 255);
}
