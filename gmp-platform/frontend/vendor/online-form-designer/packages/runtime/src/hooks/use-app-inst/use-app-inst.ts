import { App, inject } from 'vue';
import { APP_INST } from '../../constants';
/**
 * 获取当前绘制界面Vue应用实例
 *
 * @export
 * @returns {*}  {App}
 */
export function useAppInst(): App {
  return inject(APP_INST) as App;
}
