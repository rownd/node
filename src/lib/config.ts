import { TConfig } from '../types';

const defaultConfig: TConfig = {
  api_url: 'https://api.rownd.io',
  app_key: process.env.ROWND_APP_KEY,
  app_secret: process.env.ROWND_APP_SECRET,
  timeout: parseInt(process.env.ROWND_TIMEOUT || '10000', 10),
};

export function createConfig(opts: Partial<TConfig> = {}): TConfig {
  return {
    ...defaultConfig,
    ...opts,
  };
}
