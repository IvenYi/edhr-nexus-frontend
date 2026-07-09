import { defineComponent, h, PropType, reactive, ref, VNode, provide } from 'vue';
import { ConfigProvider } from 'ant-design-vue';
import {
  IAppFullScreenContainerOptions,
  IModal,
  IModalData,
  IOverlayContainer,
  useNamespace,
  Modal,
} from '../../utils/local-runtime';
import { DndProvider } from 'vue3-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { OverlayContainer } from '../../utils/overlay-container/overlay-container';
import './app-full-screen-container.scss';

export const AppFullScreenContainer = defineComponent({
  name: 'AppFullScreenContainer',
  props: {
    opts: {
      type: Object as PropType<IAppFullScreenContainerOptions>,
      default: () => ({}),
    },
  },
  setup(props, ctx) {
    const ns = useNamespace('app-full-screen-container');
    const isShow = ref(false);

    // 处理自定义样式
    const customStyle = reactive<IData>({});

    // 合并options
    const options = ref<IAppFullScreenContainerOptions>({});
    if (props.opts) {
      Object.assign(options.value, props.opts);
    }

    let data: IData | null = null;

    const modal: IModal = new Modal({
      dismiss: (result: IData) => {
        isShow.value = false;
        data = result;
        ctx.emit('dismiss', data);
      },
    });

    provide('modal', modal);

    const dismiss = (_data?: IModalData) => {
      return modal.dismiss(_data);
    };

    const present = () => {
      isShow.value = true;
    };

    const ok = async () => {
      if (modal.ok) {
        const result = await modal.ok();
        if (result && result.ok) {
          dismiss(result);
        }
      } else {
        console.warn('打开模态未实现ok方法');
      }
    };

    const cancel = (): Promise<boolean> => {
      if (modal.cancel) {
        return modal.cancel();
      }
      return dismiss();
    };

    const locale = (window as any).___GCT___.locale;

    const { getAntdLocale } = locale;

    return {
      ns,
      getAntdLocale,
      isShow,
      options,
      customStyle,
      modal,
      present,
      dismiss,
      ok,
      cancel,
    } as any;
  },
  render() {
    const slot = this.$slots.default?.();
    if (slot && slot.length > 0) {
      (slot[0].props as any).modal = this.modal;
    }
    return (
      <ConfigProvider locale={this.getAntdLocale}>
        <DndProvider backend={HTML5Backend}>
          {h(
            'div',
            {
              class: [
                this.ns.b(),
                this.ns.is('is-hidden', this.isShow !== true),
                this.options.containerClass,
              ],
              // onOk: this.ok,
              // onCancel: this.cancel,
              ...this.options,
            },
            [slot],
          )}
        </DndProvider>
      </ConfigProvider>
    );
  },
});

/**
 * 创建全屏容器
 *
 * @author zhanghanrui
 * @date 2024-07-04 15:07:25
 * @export
 * @param {() => VNode} render
 * @param {IAppFullScreenContainerOptions} [opts]
 * @return {*}  {IOverlayContainer}
 */
export function createAppFullScreenContainer(
  render: () => VNode,
  opts?: IAppFullScreenContainerOptions,
): IOverlayContainer {
  return new OverlayContainer(AppFullScreenContainer, render, opts);
}
