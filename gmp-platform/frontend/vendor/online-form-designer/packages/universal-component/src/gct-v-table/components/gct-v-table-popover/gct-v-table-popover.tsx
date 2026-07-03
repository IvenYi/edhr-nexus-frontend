import { useNamespace, useOverlayScrollbars } from '@gct/runtime';
import { computePosition, flip, shift, offset, autoUpdate } from '@floating-ui/dom';
// import { onClickOutside } from '@vueuse/core';
import { SyncSeriesHook } from 'qx-util';
import { ITablePopoverHooks } from '../../interface';
import { PROVIDE_KEY } from '../../constants';

import {
  createApp,
  defineComponent,
  h,
  onMounted,
  onUnmounted,
  PropType,
  provide,
  ref,
  type Component,
} from 'vue';
import type { GctVTablePopoverProps } from '../../interface';
import './gct-v-table-popover.scss';
import { suppressNextEvent } from '../../utils';

export const GctVTablePopover = defineComponent({
  name: 'GctVTablePopover',
  props: {
    x: {
      type: Number as PropType<GctVTablePopoverProps['x']>,
      default: 0,
    },
    y: {
      type: Number as PropType<GctVTablePopoverProps['y']>,
      default: 0,
    },
    maxWidth: {
      type: Number as PropType<GctVTablePopoverProps['maxWidth']>,
      default: 400,
    },
    maxHeight: {
      type: Number as PropType<GctVTablePopoverProps['maxHeight']>,
      default: 360,
    },
    dismiss: {
      type: Function,
      default: () => {},
    },
  },
  setup(props, { slots }) {
    const ns = useNamespace('v-table-popover');
    const popoverRef = ref<HTMLElement>();

    // 创建虚拟定位元素（用于 floating-ui 计算位置）
    const createVirtualElement = () => {
      return {
        getBoundingClientRect() {
          return {
            width: 0,
            height: 0,
            x: props.x,
            y: props.y,
            top: props.y,
            left: props.x,
            right: props.x,
            bottom: props.y,
          };
        },
      };
    };

    // OverlayScrollbars 实例
    useOverlayScrollbars(popoverRef, { overflow: { x: 'hidden' } });

    const style = ref({
      top: `${props.y}px`,
      left: `${props.x}px`,
      maxWidth: `${props.maxWidth ?? 400}px`,
      maxHeight: `${props.maxHeight ?? 360}px`,
    });

    // 用于清理 autoUpdate
    let cleanup: (() => void) | null = null;

    // 使用 floating-ui 进行定位
    const updatePosition = async () => {
      if (!popoverRef.value) return;

      const virtualElement = createVirtualElement();

      const { x, y } = await computePosition(virtualElement, popoverRef.value, {
        placement: 'bottom-start',
        middleware: [
          offset(8), // 8px 偏移
          flip(), // 自动翻转以适应视口
          shift({ padding: 16 }), // 16px 安全边距
        ],
      });

      style.value = {
        top: `${y}px`,
        left: `${x}px`,
        maxWidth: `${props.maxWidth ?? 400}px`,
        maxHeight: `${props.maxHeight ?? 360}px`,
      };
    };

    // onClickOutside(
    //   popoverRef,
    //   (e: PointerEvent) => {
    //     props.dismiss();
    //   },
    //   { capture: true },
    // );

    onMounted(() => {
      if (popoverRef.value) {
        // 使用 autoUpdate 自动更新位置（处理滚动、resize 等）
        const virtualElement = createVirtualElement();
        cleanup = autoUpdate(virtualElement, popoverRef.value, updatePosition);
      }

      document.addEventListener('mousedown', handleMouseDown);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('wheel', handleWheel);
      document.addEventListener('touchstart', handleTouchStart);
    });

    onUnmounted(() => {
      if (cleanup) {
        cleanup();
        cleanup = null;
      }

      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('touchstart', handleTouchStart);
    });

    // 使用完整的点击检测（mousedown + mouseup）来避免长按时误触发
    const mouseDownOutside = ref(false);
    const mouseDownTarget = ref<EventTarget | null>(null);

    const handleMouseDown = (event: MouseEvent): void => {
      const target = event.target as Node;
      // 检查 mousedown 是否发生在 popover 外部
      if (popoverRef.value && !popoverRef.value.contains(target)) {
        mouseDownOutside.value = true;
        mouseDownTarget.value = event.target;
      } else {
        mouseDownOutside.value = false;
        mouseDownTarget.value = null;
      }
    };

    const handleMouseUp = (event: MouseEvent): void => {
      const target = event.target as Node;
      // 只有当 mousedown 和 mouseup 都发生在 popover 外部时才触发 dismiss
      if (mouseDownOutside.value && popoverRef.value && !popoverRef.value.contains(target)) {
        props.dismiss();
      }
      // 重置状态
      mouseDownOutside.value = false;
      mouseDownTarget.value = null;
    };

    const handleWheel = (event: WheelEvent): void => {
      const target = event.target as Node;
      // 检查滚轮事件是否发生在 popover 外部，如果是则关闭
      if (popoverRef.value && !popoverRef.value.contains(target)) {
        props.dismiss();
      }
    };

    const handleTouchStart = (event: TouchEvent): void => {
      const target = event.target as Node;
      // 检查 touchstart 是否发生在 popover 外部，如果是则直接关闭
      if (popoverRef.value && !popoverRef.value.contains(target)) {
        props.dismiss();
      }
    };

    function onStopPropagation(event: MouseEvent): void {
      event.stopPropagation();
    }

    function onStopEvent(event: Event): void {
      event.stopPropagation();
      suppressNextEvent();
      props.dismiss();
    }

    return () => {
      return (
        <div class={ns.b('wrapper')}>
          <div class={ns.be('wrapper', 'mask')} onPointerdown={onStopEvent} />
          <div
            ref={popoverRef}
            onMousedown={onStopPropagation}
            onMouseup={onStopPropagation}
            class={ns.b()}
            style={style.value}
          >
            {slots.default?.()}
          </div>
        </div>
      );
    };
  },
});

/**
 * Popover 实例接口
 */
export interface PopoverInstance {
  /**
   * 关闭弹窗
   * @param data 可选的返回数据,将通过 onWillDismiss 返回
   */
  dismiss(data?: any): void;
  /**
   * 弹窗关闭回调，用于获取弹窗结果，或者告诉调用方弹窗已关闭
   *
   * @template T
   * @return {*}  {Promise<T>}
   */
  onWillDismiss<T>(): Promise<T>;
}

/**
 * 全局 Popover 实例
 */
let currentPopoverInstance: PopoverInstance | null = null;

/**
 * 打开 Popover 弹窗（全局单例）
 *
 * @export
 * @param {Component} component 需要在 Popover 中渲染的 Vue 组件
 * @param {Record<string, any>} [componentProps] 传递给组件的 props
 * @param {Partial<GctVTablePopoverProps>} [popoverProps] Popover 配置属性
 * @returns {PopoverInstance}
 */
export function openPopover<T>(
  component: Component,
  componentProps?: Record<string, any>,
  popoverProps?: Partial<GctVTablePopoverProps>,
): PopoverInstance {
  // 如果已经存在实例，先销毁
  if (currentPopoverInstance) {
    currentPopoverInstance.dismiss();
    currentPopoverInstance = null;
  }

  const hooks: ITablePopoverHooks = {
    beforeDismiss: new SyncSeriesHook<null, { close: boolean }>(),
  };

  // 创建容器
  const container = document.createElement('div');
  document.body.appendChild(container);

  // 创建 Promise 用于 onWillDismiss
  let dismissResolve: ((value?: T) => void) | null = null;
  const dismissPromise = new Promise((resolve) => {
    dismissResolve = resolve;
  });

  // 创建 dismiss 函数
  const dismiss = (data?: T): void => {
    const _context = hooks.beforeDismiss.callSync({ close: true }, null);
    if (_context.close !== true) {
      return;
    }
    app.unmount();
    document.body.removeChild(container);
    // 触发 onWillDismiss 回调
    if (dismissResolve) {
      dismissResolve(data);
    }
    // 清空全局实例引用
    if (currentPopoverInstance === instance) {
      currentPopoverInstance = null;
    }
  };

  // 创建 Vue 应用实例
  const app = createApp({
    setup() {
      provide(PROVIDE_KEY.POPOVER_HOOKS, hooks);

      onUnmounted(() => {
        hooks.beforeDismiss.clear();
      });

      return () => {
        return h(
          GctVTablePopover,
          {
            ...popoverProps,
            dismiss,
          },
          {
            default: () => h(component, componentProps),
          },
        );
      };
    },
  });

  // 挂载应用
  app.mount(container);

  // 创建实例对象
  const instance: PopoverInstance = {
    dismiss,
    onWillDismiss<T>(): Promise<T> {
      return dismissPromise as Promise<T>;
    },
  };

  // 保存到全局实例
  currentPopoverInstance = instance;

  // 返回实例
  return instance;
}
