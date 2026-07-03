import { computed, ComputedRef, inject, onMounted, onUnmounted, shallowRef } from 'vue';
import type { EventBus } from 'wujie/esm/event';
import { IEditFormController } from '../interface';
import { FORM_CONTROLLER_INJECT_TAG } from '../constants';

export function useFormControllerInst(): IEditFormController {
  return inject<IEditFormController>(FORM_CONTROLLER_INJECT_TAG)!;
}

/**
 * 获取 WuJie 输入的 props
 *
 * @author chitanda
 * @date 2025-07-27 13:07:55
 * @export
 * @template T
 * @returns {*}  {ComputedRef<T>}
 */
export function useWuJieProps<T = IObject>(): ComputedRef<T> {
  return computed<T>(() => {
    return (window as any).$wujie?.props as T;
  });
}

/**
 * 获取 IFrame 通信的 props
 *
 * @author chitanda
 * @date 2025-09-22 09:09:22
 * @export
 * @template T
 * @returns {*}  {ComputedRef<T>}
 */
export function useIFrameProps<T = IObject>(): ComputedRef<T> {
  const props = shallowRef<T>({} as T);

  onMounted(() => {
    // 监听来自父窗口的消息
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'IFRAME_PROPS') {
        props.value = event.data.props;
      }
    };

    window.addEventListener('message', handleMessage);

    // 向父窗口发送准备就绪消息
    window.parent.postMessage({ type: 'IFRAME_READY' }, '*');

    onUnmounted(() => {
      window.removeEventListener('message', handleMessage);
    });
  });

  return computed(() => props.value);
}

/**
 * 获取 WuJie 的事件总线
 *
 * @author chitanda
 * @date 2025-07-27 13:07:33
 * @export
 * @returns {*}  {ComputedRef<EventBus>}
 */
export function useWuJieBus(): ComputedRef<EventBus> {
  return computed<EventBus>(() => {
    return (window as any).$wujie.bus;
  });
}

export { useOverlayScrollbars } from './use-overlay-scrollbars';
