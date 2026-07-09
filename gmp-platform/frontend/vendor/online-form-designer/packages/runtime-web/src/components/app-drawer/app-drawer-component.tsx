import { defineComponent, h, PropType, reactive, ref, resolveComponent, VNode, provide } from 'vue';
import { ConfigProvider } from 'ant-design-vue';
import {
  IDrawerOptions,
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
import './app-drawer-component.scss';

export const AppDrawerComponent = defineComponent({
  props: {
    opts: {
      type: Object as PropType<IModalOptions>,
      default: () => ({}),
    },
  },
  setup(props, ctx) {
    const ns = useNamespace('drawer');
    const isShow = ref(false);

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
    } as any;
  },
  render() {
    const slot = this.$slots.default?.();
    if (slot && slot.length > 0) {
      (slot[0].props as any).modal = this.modal;
    }
    const props = {
      visible: this.isShow,
      class: [
        this.ns.b(),
        this.options.placement && this.ns.m(this.options.placement),
        this.options.modalClass,
      ],
      style: { padding: 0 },
      onOk: this.ok,
      onCancel: this.dismiss,
      ...this.options,
    };
    return (
      <ConfigProvider locale={this.getAntdLocale}>
        <DndProvider backend={HTML5Backend}>
          {h(resolveComponent('basic-drawer'), props, [slot])}
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
 * @param {(IDrawerOptions)} [opts]
 * @return {*}  {IOverlayContainer}
 */
export function createDrawer(render: () => VNode, opts?: IDrawerOptions): IOverlayContainer {
  return new OverlayContainer(AppDrawerComponent, render, opts);
}
