import type { Fn } from '@vueuse/shared';
import { isIOS, noop } from '@vueuse/shared';
import {
  ConfigurableWindow,
  defaultWindow,
  MaybeElementRef,
  unrefElement,
  useEventListener,
} from '@vueuse/core';
import { onUnmounted } from 'vue';

/** 修复IOS Bug start */
let _iOSWorkaround = false;
/**
 * 修复IOS的Safari不触发点击事件bug
 * Fixes: https://github.com/vueuse/vueuse/issues/1520
 * How it works: https://stackoverflow.com/a/39712411
 * @author lxm
 * @date 2024-08-20 02:11:39
 */
function fixIOS() {
  if (isIOS && !_iOSWorkaround) {
    _iOSWorkaround = true;
    Array.from(window.document.body.children).forEach((el) => el.addEventListener('click', noop));
    window.document.documentElement.addEventListener('click', noop);
  }
}
/** 修复IOS Bug end */

/**
 * 事件是否发生在单个元素内部
 * @param {EventTarget} el 元素
 * @param {MouseEvent} event 事件
 * @return {*}  {boolean}
 */
export function isInsideEvent(el: EventTarget, event: MouseEvent) {
  return el === event.target || event.composedPath().includes(el);
}

/**
 *
 * 事件是否发生在元素集合里的某个元素的内部
 * @param {((MaybeElementRef | string)[])} list 元素集合可以是选择器或者ref的元素或者元素
 * @param {MouseEvent} event 事件
 * @return {*}  {boolean}
 */
export function isInsideArrEvent(list: (MaybeElementRef | string)[], event: MouseEvent) {
  return list.some((target) => {
    if (typeof target === 'string') {
      return Array.from(window.document.querySelectorAll(target)).some((el) =>
        isInsideEvent(el, event),
      );
    } else {
      const el = unrefElement(target);
      return el && isInsideEvent(el, event);
    }
  });
}

export interface OnClickOutsideOptions extends ConfigurableWindow {
  /**
   * 在外部但是要当成内部元素的集合
   */
  outsideIgnore?: (MaybeElementRef | string)[];
  /**
   * 在内部但是要当成外部元素的集合
   */
  insideIgnore?: (MaybeElementRef | string)[];
  /**
   * 外部点击回调
   */
  onOutside: OnClickOutsideHandler;
  /**
   * 内部点击回调
   */
  onInside?: OnClickOutsideHandler;
}

export type OnClickOutsideHandler = (evt: PointerEvent) => void;

/**
 * 监听点击是否在外部
 *
 * @author lxm
 * @date 2024-08-20 04:07:03
 * @export
 * @param {MaybeElementRef} target 目标元素
 * @param {T} options 额外选项
 * @return {*}
 */
export function onClickOutside<T extends OnClickOutsideOptions>(
  target: MaybeElementRef,
  options: T,
) {
  const {
    window = defaultWindow,
    outsideIgnore = [],
    insideIgnore = [],
    onOutside,
    onInside,
  } = options;

  if (!window) return noop;
  fixIOS();

  let pointerdownOutside = true;

  const shouldOutsideIgnore = (event: PointerEvent) => {
    return isInsideArrEvent(outsideIgnore, event);
  };
  const shouldInsideIgnore = (event: PointerEvent) => {
    return isInsideArrEvent(insideIgnore, event);
  };

  const isOutside = (event: PointerEvent) => {
    const el = unrefElement(target);
    if (!el) {
      throw new Error('target元素不存在');
    }
    // 判断是否在target内部, 额外多判断一次是否在各自的排除列表里
    return isInsideEvent(el, event) ? shouldInsideIgnore(event) : !shouldOutsideIgnore(event);
  };

  const clickListener = (event: PointerEvent) => {
    const clickOutside = isOutside(event);
    // 非脚本触发的时候,如果前后两次判断不一致,说明鼠标点击和松开的时候分别处于外面和里面,结果互斥,回调都不触发
    if (event.detail !== 0 && clickOutside !== pointerdownOutside) {
      return;
    }
    if (clickOutside) {
      onOutside(event);
    } else if (onInside) {
      onInside(event);
    }
  };

  const cleanup = [
    useEventListener(window, 'click', clickListener, { passive: true, capture: true }),
    useEventListener(
      window,
      'pointerdown',
      (e) => {
        try {
          pointerdownOutside = isOutside(e);
        } catch (error) {
          console.error(error);
        }
      },
      { passive: true },
    ),
  ] as Fn[];

  const stop = () => cleanup.forEach((fn) => fn());

  return stop;
}

/**
 * setup里使用,卸载的时候自动删除监听
 * @author lxm
 * @date 2024-08-20 04:13:14
 * @export
 * @param {MaybeElementRef} target
 * @param {OnClickOutsideOptions} options
 */
export function useClickOutside(target: MaybeElementRef, options: OnClickOutsideOptions) {
  const stop = onClickOutside(target, options);
  onUnmounted(() => {
    stop();
  });
}
