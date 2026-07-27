import { PaginationParams, ValidationErrorItem } from '@sentinel-ai/types';
import { ValidationResult, FileValidationOptions } from './types';

// Email Validation
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim());
}

// Password Validation
export function validatePasswordStrength(password: string): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];

  if (!password || typeof password !== 'string') {
    return { isValid: false, issues: ['Password must be a non-empty string'] };
  }

  if (password.length < 8) {
    issues.push('Password must be at least 8 characters long');
  }
  if (password.length > 128) {
    issues.push('Password must not exceed 128 characters');
  }
  if (!/[A-Z]/.test(password)) {
    issues.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    issues.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    issues.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    issues.push('Password must contain at least one special character');
  }

  return {
    isValid: issues.length === 0,
    issues
  };
}

// UUID v4 Validation
const UUID_REGEX =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

export function isValidUUID(uuid: string): boolean {
  if (!uuid || typeof uuid !== 'string') return false;
  return UUID_REGEX.test(uuid.trim());
}

// Authentication Validation
export function validateAuthCredentials(
  email?: string,
  password?: string
): ValidationResult<{ email: string; password: string }> {
  const errors: ValidationErrorItem[] = [];

  if (!email || !isValidEmail(email)) {
    errors.push({ field: 'email', issue: 'Valid email address is required' });
  }

  if (!password) {
    errors.push({ field: 'password', issue: 'Password is required' });
  } else {
    const passwordCheck = validatePasswordStrength(password);
    if (!passwordCheck.isValid) {
      errors.push({ field: 'password', issue: passwordCheck.issues.join('; ') });
    }
  }

  return {
    isValid: errors.length === 0,
    data: errors.length === 0 ? { email: email!.trim(), password: password! } : undefined,
    errors
  };
}

// Pagination Query Validation
export function validatePaginationParams(query: any): ValidationResult<PaginationParams> {
  const errors: ValidationErrorItem[] = [];

  let page = 1;
  if (query?.page !== undefined) {
    const parsedPage = parseInt(String(query.page), 10);
    if (isNaN(parsedPage) || parsedPage < 1) {
      errors.push({ field: 'page', issue: 'Page parameter must be a positive integer >= 1' });
    } else {
      page = parsedPage;
    }
  }

  let limit = 20;
  if (query?.limit !== undefined) {
    const parsedLimit = parseInt(String(query.limit), 10);
    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
      errors.push({
        field: 'limit',
        issue: 'Limit parameter must be an integer between 1 and 100'
      });
    } else {
      limit = parsedLimit;
    }
  }

  const sortOrder = query?.sortOrder === 'desc' ? 'desc' : 'asc';
  const sortBy = typeof query?.sortBy === 'string' ? query.sortBy.trim() : undefined;

  return {
    isValid: errors.length === 0,
    data: errors.length === 0 ? { page, limit, sortBy, sortOrder } : undefined,
    errors
  };
}

// Query String Validation
export function validateQueryString(
  value?: any,
  maxLength: number = 255
): ValidationResult<string> {
  const errors: ValidationErrorItem[] = [];

  if (value === undefined || value === null) {
    return { isValid: true, data: '', errors: [] };
  }

  const strValue = String(value).trim();
  if (strValue.length > maxLength) {
    errors.push({
      field: 'query',
      issue: `Query string exceeds maximum length of ${maxLength} characters`
    });
  }

  // Prevent script injection tags
  if (/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(strValue)) {
    errors.push({
      field: 'query',
      issue: 'Malicious HTML/Script injection detected in query string'
    });
  }

  return {
    isValid: errors.length === 0,
    data: strValue,
    errors
  };
}

// File Metadata Validation
export function validateFile(
  file: { name: string; sizeBytes: number; mimeType: string },
  options: FileValidationOptions
): ValidationResult<boolean> {
  const errors: ValidationErrorItem[] = [];

  if (!file) {
    errors.push({ field: 'file', issue: 'File object is required' });
    return { isValid: false, errors };
  }

  if (file.sizeBytes > options.maxSizeBytes) {
    const maxMb = (options.maxSizeBytes / (1024 * 1024)).toFixed(1);
    errors.push({
      field: 'sizeBytes',
      issue: `File size exceeds maximum allowed limit of ${maxMb}MB`
    });
  }

  if (!options.allowedMimeTypes.includes(file.mimeType)) {
    errors.push({
      field: 'mimeType',
      issue: `File type "${file.mimeType}" is not allowed. Allowed types: ${options.allowedMimeTypes.join(', ')}`
    });
  }

  return {
    isValid: errors.length === 0,
    data: errors.length === 0,
    errors
  };
}
