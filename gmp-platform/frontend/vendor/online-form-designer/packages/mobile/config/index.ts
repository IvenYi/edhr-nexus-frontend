import { getStartConfig } from './start';
import { getPortalConfig } from './portal';
import { getEdhrConfig } from './edhr';
import { getIpadConfig } from './ipad';

const configMap = {
  start: getStartConfig,
  edhr: getEdhrConfig,
  portal: getPortalConfig,
  ipad: getIpadConfig,
};
export const getOptionsByModul = (type) => {
  return configMap[type] || getPortalConfig;
};
