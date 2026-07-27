import { ValidationErrorItem } from '@sentinel-ai/types';

export interface ValidationResult<T = any> {
  isValid: boolean;
  data?: T;
  errors: ValidationErrorItem[];
}

export interface FileValidationOptions {
  allowedMimeTypes: string[];
  maxSizeBytes: number;
}
