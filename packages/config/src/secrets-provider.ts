export interface ISecretsProvider {
  getSecret(key: string, fallback?: string): Promise<string>;
  getSecretSync(key: string, fallback?: string): string;
}

export class EnvSecretsProvider implements ISecretsProvider {
  public async getSecret(key: string, fallback?: string): Promise<string> {
    return this.getSecretSync(key, fallback);
  }

  public getSecretSync(key: string, fallback?: string): string {
    const val = process.env[key];
    if (val !== undefined && val !== '') {
      return val;
    }
    if (fallback !== undefined) {
      return fallback;
    }
    throw new Error(`[SecretsProvider] Missing required secret key: ${key}`);
  }
}
