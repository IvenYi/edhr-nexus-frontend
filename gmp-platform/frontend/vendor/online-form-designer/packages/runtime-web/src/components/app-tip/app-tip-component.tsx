/* eslint-disable vue/no-setup-props-destructure */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineComponent, PropType, VNode } from 'vue';
import { IModalData, useNamespace, Modal, ITipOptions } from '../../utils/local-runtime';
import { ConfigProvider } from 'ant-design-vue';
import { OverlayPopoverContainer } from '../../utils/overlay-popover-container/overlay-popover-container';
import './app-tip-component.scss';

const AppTipComponent = defineComponent({
  props: {
    opts: {
      type: Object as PropType<ITipOptions>,
      default: () => ({}),
    },
  },
  setup(props, ctx) {
    // 样式命名空间
    const ns = useNamespace('app-tip-component');

    const modal = new Modal({
      dismiss: (data: IModalData) => {
        ctx.emit('dismiss', data);
      },
    });

    // 点击容器关闭飘窗
    function dismiss(data?: IModalData) {
      return modal.dismiss(data);
    }

    /**
     * 飘窗显示并计算位置
     *
     * @author chitanda
     * @date 2022-11-09 12:11:04
     * @param {HTMLElement} target
     * @return {*}  {Promise<void>}
     */
    async function present(_target: HTMLElement): Promise<void> {}

    const onMaskClick = () => {
      dismiss();
    };

    const locale = (window as any).___GCT___.locale;

    const { getAntdLocale } = locale;

    return {
      ns,
      modal,
      onMaskClick,
      present,
      dismiss,
      getAntdLocale,
    };
  },
  render() {
    const slot = this.$slots.default?.();
    if (slot && slot.length > 0) {
      (slot[0].props as any).modal = this.modal;
    }
    console.log('xx');
    return (
      <ConfigProvider locale={this.getAntdLocale}>
        <a-tooltip visible={true}>111</a-tooltip>
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
 * @param {ITipOptions} [opts]
 * @return {*}  {OverlayPopoverContainer}
 */
export function createTip(render: () => VNode, opts?: ITipOptions): OverlayPopoverContainer {
  return new OverlayPopoverContainer(AppTipComponent, render as any, opts);
}
