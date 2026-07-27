import { AppConfig } from './types';
import { validateAndLoadConfig } from './env-validator';

export * from './types';
export * from './secrets-provider';
export * from './feature-flags';
export * from './env-validator';

let cachedConfig: AppConfig | null = null;

export function loadConfig(): AppConfig {
  if (!cachedConfig) {
    cachedConfig = validateAndLoadConfig();
  }
  return cachedConfig;
}

export function getConfig(): AppConfig {
  if (!cachedConfig) {
    return loadConfig();
  }
  return cachedConfig;
}
