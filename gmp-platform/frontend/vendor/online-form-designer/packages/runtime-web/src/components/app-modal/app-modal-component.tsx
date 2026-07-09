import {
  defineComponent,
  h,
  PropType,
  reactive,
  ref,
  resolveComponent,
  VNode,
  provide,
  watch,
} from 'vue';
import { ConfigProvider } from 'ant-design-vue';
import {
  IModal,
  IModalData,
  IModalOptions,
  IOverlayContainer,
  useNamespace,
  Modal,
} from '../../utils/local-runtime';
import { DndProvider } from 'vue3-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { OverlayContainer } from '../../utils/overlay-container/overlay-container';
import './app-modal-component.scss';
import DragPlaceholder from './drag-placeholder.vue';

export const AppModalComponent = defineComponent({
  props: {
    opts: {
      type: Object as PropType<IModalOptions>,
      default: () => ({}),
    },
  },
  setup(props, ctx) {
    const ns = useNamespace('modal');
    const isShow = ref(false);
    // 是否全屏
    const isFullScreen = ref(props.opts.defaultFullscreen ? true : false);

    const onFullScreen = () => {
      isFullScreen.value = !isFullScreen.value;
    };

    // 处理自定义样式
    const customStyle = reactive<IData>({});

    // 合并options
    const options = ref<IModalOptions>({});
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
      setOptions(opt) {
        Object.assign(options.value, opt);
      },
    });

    provide('modal', modal);

    const dismiss = (_data?: IModalData) => {
      return modal.dismiss(_data);
    };

    const present = () => {
      isShow.value = true;
    };

    const isConfirmLoading = ref(false);

    const ok = async () => {
      if (modal.ok) {
        try {
          isConfirmLoading.value = true;
          const result = await modal.ok();
          isConfirmLoading.value = false;
          if (result && (result.ok === true || result.close === true)) {
            dismiss(result);
          }
        } finally {
          isConfirmLoading.value = false;
        }
      } else {
        console.warn('打开模态未实现ok方法');
      }
    };

    const cancel = async () => {
      if (modal.cancel) {
        const bol = await modal.cancel();
        if (bol === false) {
          return;
        }
      }
      dismiss();
    };

    const locale = (window as any).___GCT___.locale;

    const { getAntdLocale } = locale;

    return {
      ns,
      isConfirmLoading,
      getAntdLocale,
      isShow,
      options,
      customStyle,
      modal,
      isFullScreen,
      present,
      dismiss,
      ok,
      cancel,
      onFullScreen,
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
            resolveComponent('a-modal'),
            {
              visible: this.isShow,
              class: [
                this.ns.b(),
                this.options.placement && this.ns.m(this.options.placement),
                this.options.modalClass,
                this.ns.is('hidden-footer', this.options.showFooter === false),
                this.ns.is('hidden-close-btn', this.options.showCloseBtn === false),
                this.ns.is('hidden-cancel-btn', this.options.showCancelBtn === false),
                this.ns.is('full-screen', this.isFullScreen),
              ],
              centered: true,
              onOk: this.ok,
              confirmLoading: this.isConfirmLoading,
              onCancel: this.cancel,
              okText: this.$t('sys.okText'),
              okButtonProps: {
                disabled: this.modal.state.okDisabled,
              },
              ...this.options,
            },
            [
              <DragPlaceholder draggable={this.options.draggable} />,
              this.options.canFullscreen !== false ? (
                <div class={this.ns.e('full-screen')} onClick={this.onFullScreen}>
                  <i
                    class={`iconfont ${
                      this.isFullScreen ? 'icon-tuichuquanping' : 'icon-quanping'
                    }`}
                  />
                </div>
              ) : null,
              slot,
            ],
          )}
        </DndProvider>
      </ConfigProvider>
    );
  },
});

/**
 * 创建模态框
 *
 * @author zhanghanrui
 * @date 2024-03-19 21:03:37
 * @export
 * @param {() => VNode} render
 * @param {(IModalOptions)} [opts]
 * @return {*}  {IOverlayContainer}
 */
export function createModal(render: () => VNode, opts?: IModalOptions): IOverlayContainer {
  return new OverlayContainer(AppModalComponent, render, opts);
}
