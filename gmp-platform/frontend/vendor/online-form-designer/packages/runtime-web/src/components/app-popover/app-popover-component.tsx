/* eslint-disable vue/no-setup-props-destructure */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  arrow,
  computePosition,
  autoUpdate,
  flip,
  offset,
  shift,
  ComputePositionConfig,
} from '@floating-ui/dom';
import { defineComponent, onUnmounted, PropType, reactive, ref, VNode } from 'vue';
import { isNumber } from 'lodash-es';
import { IModalData, IPopoverOptions, useNamespace, Modal } from '../../utils/local-runtime';
import { DndProvider } from 'vue3-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { onClickOutside } from '@vueuse/core';
import { OverlayPopoverContainer } from '../../utils/overlay-popover-container/overlay-popover-container';
import './app-popover-component.scss';
import { ConfigProvider } from 'ant-design-vue';

// 飘窗组件配置
export type FloatingUIConfig = Partial<ComputePositionConfig>;

/**
 * 计算飘窗显示
 *
 * @author chitanda
 * @date 2022-11-08 21:11:18
 * @param {HTMLElement} element
 * @param {HTMLElement} el
 * @param {HTMLElement} arrEl
 * @param {IPopoverOptions<FloatingUIConfig>} opts
 * @return {*}  {Promise<void>}
 */
async function computePos(
  element: HTMLElement,
  el: HTMLElement,
  arrEl: HTMLElement,
  opts: IPopoverOptions<FloatingUIConfig>,
): Promise<void> {
  const middlewareArr = [offset(opts.offsetOpts || 6), flip(), shift()];
  if (!opts.noArrow) {
    middlewareArr.push(arrow({ element: arrEl! }));
  }

  const config: FloatingUIConfig = {
    placement: opts.placement,
    strategy: 'absolute',
    middleware: middlewareArr,
  };

  if (opts.options) {
    Object.assign(config, opts.options);
  }

  const options = await computePosition(element, el, config);
  {
    const { x, y, placement, middlewareData } = options;
    const { style } = el;
    style.left = `${x}px`;
    style.top = `${y}px`;

    if (!opts.noArrow) {
      // 箭头位置
      const { x: arrowX, y: arrowY } = middlewareData.arrow!;

      const staticSide: string = (
        {
          top: 'bottom',
          right: 'left',
          bottom: 'top',
          left: 'right',
        } as IData
      )[placement.split('-')[0]];

      Object.assign(arrEl.style, {
        left: arrowX != null ? `${arrowX}px` : '',
        top: arrowY != null ? `${arrowY}px` : '',
        right: '',
        bottom: '',
        [staticSide]: '-4px',
      });
    }
  }
}

const AppPopoverComponent = defineComponent({
  props: {
    opts: {
      type: Object as PropType<IPopoverOptions<FloatingUIConfig>>,
      default: () => ({}),
    },
  },
  setup(props, ctx) {
    // 样式命名空间
    const ns = useNamespace('popover');
    // 是否显示
    const isShow = ref(false);
    // 跟 dom 元素
    const el = ref<HTMLDivElement>();
    // arrow dom 元素
    const arrEl = ref<HTMLDivElement>();

    // 处理自定义样式
    const customStyle = reactive<IData>({});
    const { width, height, maxHeight } = props.opts;
    if (width) {
      if (isNumber(width)) {
        customStyle.width = `${width}px`;
      } else {
        customStyle.width = width;
      }
    }
    if (height) {
      if (isNumber(height)) {
        customStyle.height = `${height}px`;
      } else {
        customStyle.height = height;
      }
    }

    if (maxHeight) {
      if (isNumber(maxHeight)) {
        customStyle.maxHeight = `${maxHeight}px`;
      } else {
        customStyle.maxHeight = maxHeight;
      }
    }

    const modal = new Modal({
      dismiss: (data: IModalData) => {
        ctx.emit('dismiss', data);
      },
    });

    // 点击容器关闭飘窗
    function dismiss(data?: IModalData) {
      return modal.dismiss(data);
    }

    // 清除自动更新方法
    let cleanUpAutoUpdate = () => {};

    onUnmounted(() => {
      cleanUpAutoUpdate();
    });

    onClickOutside(el, () => {
      dismiss({ ok: false });
    });

    /**
     * 飘窗显示并计算位置
     *
     * @author chitanda
     * @date 2022-11-09 12:11:04
     * @param {HTMLElement} target
     * @return {*}  {Promise<void>}
     */
    async function present(target: HTMLElement): Promise<void> {
      isShow.value = true;
      const updatePosition = () => {
        return computePos(target, el.value!, arrEl.value!, props.opts);
      };
      cleanUpAutoUpdate = autoUpdate(target, el.value!, updatePosition);
    }

    const onMaskClick = () => {
      if (props.opts.autoClose === true) {
        dismiss();
      }
    };

    const locale = (window as any).___GCT___.locale;

    const { getAntdLocale } = locale;

    return {
      ns,
      el,
      arrEl,
      isShow,
      modal,
      onMaskClick,
      present,
      dismiss,
      customStyle,
      getAntdLocale,
    };
  },
  render() {
    const slot = this.$slots.default?.();
    if (slot && slot.length > 0) {
      (slot[0].props as any).modal = this.modal;
    }
    const content = (
      <div
        class={[this.ns.b(), this.ns.is('show', this.isShow), this.opts.className]}
        ref="el"
        style={this.customStyle}
        onClick={(e: Event) => {
          e.stopPropagation();
        }}
      >
        {!this.opts.noArrow && <div class={[this.ns.e('arrow')]} ref="arrEl"></div>}
        {slot}
      </div>
    );

    if (this.opts.autoClose === true) {
      return (
        <div
          class={[this.ns.e('overlay')]}
          onClick={() => {
            this.onMaskClick();
          }}
        >
          {content}
        </div>
      );
    }
    return (
      <ConfigProvider locale={this.getAntdLocale}>
        <DndProvider backend={HTML5Backend}>{content}</DndProvider>
      </ConfigProvider>
    );
  },
});

/**
 * 创建飘窗
 *
 * @author chitanda
 * @date 2022-12-29 15:12:59
 * @export
 * @param {() => VNode} render
 * @param {IPopoverOptions<FloatingUIConfig>} [opts]
 * @return {*}  {OverlayPopoverContainer}
 */
export function createPopover(
  render: () => VNode,
  opts?: IPopoverOptions<FloatingUIConfig>,
): OverlayPopoverContainer {
  return new OverlayPopoverContainer(AppPopoverComponent, render as any, opts);
}
