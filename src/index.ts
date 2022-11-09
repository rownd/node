import { CLAIM_USER_ID, CLAIM_IS_VERIFIED_USER } from './lib/core';
import { IRowndClient, TConfig } from './types';
import { RowndInstance } from './lib/rownd';

const claims = {
  CLAIM_USER_ID,
  CLAIM_IS_VERIFIED_USER,
};

function createInstance(config?: TConfig): IRowndClient {
  return new RowndInstance(config);
}

export { createInstance, claims };
