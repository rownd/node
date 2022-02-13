import { validateToken } from './lib/core';
import expressLib from './express';

const defaultConfig: TConfig = {
  api_url: 'https://api.rownd.io',
};

export function instance(config?: TConfig) {
  config = { ...defaultConfig, ...config };

  return {
    validateToken,
    express: expressLib(config),
  }
}

const defaultInstance = instance();
export default defaultInstance;
export { defaultInstance as rownd };