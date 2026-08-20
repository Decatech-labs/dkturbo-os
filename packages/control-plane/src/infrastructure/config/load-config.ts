import { parseConfig, type Config } from './config.js';

export const loadConfig = (): Config => {
  return parseConfig(process.env);
};
