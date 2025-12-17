// Enhanced input validation utilities

import { sanitizeString, escapeRegex, isValidEmail as isValidEmailUtil } from './security';

export function validateEmail(email: string): boolean {
  return isValidEmailUtil(email);
}

export function validateSlug(slug: string): boolean {
  const re = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return re.test(slug) && slug.length >= 3 && slug.length <= 50;
}

export function validateTitle(title: string): { valid: boolean; error?: string } {
  if (!title || title.trim().length === 0) {
    return { valid: false, error: 'Title is required' };
  }
  if (title.length < 3) {
    return { valid: false, error: 'Title must be at least 3 characters' };
  }
  if (title.length > 200) {
    return { valid: false, error: 'Title must be less than 200 characters' };
  }
  // Check for potentially dangerous content
  if (/<script|javascript:|on\w+\s*=/i.test(title)) {
    return { valid: false, error: 'Title contains invalid characters' };
  }
  return { valid: true };
}

export function validateContent(content: string, minLength = 10): { valid: boolean; error?: string } {
  if (!content || content.trim().length === 0) {
    return { valid: false, error: 'Content is required' };
  }
  if (content.trim().length < minLength) {
    return { valid: false, error: `Content must be at least ${minLength} characters` };
  }
  if (content.length > 50000) {
    return { valid: false, error: 'Content must be less than 50,000 characters' };
  }
  return { valid: true };
}

export function sanitizeInput(input: string, maxLength = 1000): string {
  return sanitizeString(input, maxLength);
}

/**
 * Escape regex pattern to prevent ReDoS attacks
 */
export function escapeRegexPattern(pattern: string): string {
  return escapeRegex(pattern);
}

export function validateRating(rating: number): { valid: boolean; error?: string } {
  if (typeof rating !== 'number' || isNaN(rating)) {
    return { valid: false, error: 'Rating must be a number' };
  }
  if (rating < 1 || rating > 5) {
    return { valid: false, error: 'Rating must be between 1 and 5' };
  }
  return { valid: true };
}

export function validateFile(file: File, options: {
  maxSize?: number;
  allowedTypes?: string[];
} = {}): { valid: boolean; error?: string } {
  const { maxSize = 10 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] } = options;

  if (!file) {
    return { valid: false, error: 'File is required' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: `File size must be less than ${maxSize / 1024 / 1024}MB` };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type must be one of: ${allowedTypes.join(', ')}` };
  }

  return { valid: true };
}

