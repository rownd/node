import * as os from 'os';
import { LIB_VERSION } from '../version';

export const DEFAULT_API_USER_AGENT = `Rownd SDK for Node.js/${LIB_VERSION} (Language: Node.js; Platform=${os.arch()}/${os.platform()} ${os.release()}};)`;