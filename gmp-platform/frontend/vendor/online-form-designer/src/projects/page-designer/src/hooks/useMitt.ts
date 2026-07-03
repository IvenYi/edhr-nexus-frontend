import { mitt } from '/@/utils/mitt';
/**事件总线 */
const eventBus = mitt();

export function useMitt() {
  return { mitt: eventBus };
}
