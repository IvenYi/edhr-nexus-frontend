import { inject } from 'vue';
import { PROVIDE_KEY } from '../constants';
import { ITablePopoverHooks } from '../interface';

/**
 * 获取当前作用域下表格 Popover 相关的 Hooks 实例
 *
 * @export
 * @return {*}  {ITablePopoverHooks}
 */
export function usePopoverHooks(): ITablePopoverHooks {
  const hooks = inject<ITablePopoverHooks>(PROVIDE_KEY.POPOVER_HOOKS);
  if (!hooks) {
    throw new Error('无法获取 Popover Hooks，请确保在 Popover 组件内使用');
  }
  return hooks;
}
