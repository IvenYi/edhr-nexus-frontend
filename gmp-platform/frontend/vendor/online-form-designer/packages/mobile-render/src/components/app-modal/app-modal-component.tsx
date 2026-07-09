import { defineComponent, h, PropType, reactive, ref, VNode, provide } from 'vue';
import {
  IModal,
  IModalData,
  IModalOptions,
  IOverlayContainer,
  useNamespace,
  Modal,
} from '@gct/runtime';
import { Dialog } from 'vant';
import { OverlayContainer } from '../../utils';
import './app-modal-component.scss';

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

    const ok = async () => {
      if (modal.ok) {
        const result = await modal.ok();
        if (result && (result.ok === true || result.close === true)) {
          dismiss(result);
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

    return {
      ns,
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
    return h(
      Dialog,
      {
        visible: this.isShow,
        class: [
          this.ns.b(),
          this.options.placement && this.ns.m(this.options.placement),
          this.options.modalClass,
        ],
        ...this.options,
      },
      slot,
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
