import { VNode, createVNode, render, unref, ref, createApp } from 'vue';
import type { App, Ref } from 'vue';
import { has } from 'lodash-es';
import ModalWrapper from './components/modal-wrapper.vue';
import { FIELD_TYPE, CreateType } from '/@/enums/appEnum';
import { registerGlobComp } from '../registerGlobComp';

export interface IFieldTransferProps {
  /** 模型key */
  modelKey: string;
  /** 模态框标题 */
  modalTitle?: string;
  /** 是否显示级联选择 */
  isShowCascader?: boolean;
  /**提示消息 */
  promptMessage?: string;
  /** 选中的字段数组 */
  data: any[];
  /** 穿梭框标题集合 */
  titles?: string[];
  /** 包含的字段 */
  containFieldType?: FIELD_TYPE[];
  /** 包含的字段key */
  containFieldKey?: string[];
  /** 禁用的字段key */
  disabledFieldKey?: string[];
  /** 排除的字段 */
  excludeFieldKey?: string[];
  /** 排除的字段 */
  excludeFieldType?: FIELD_TYPE[];
  /**包含的字段创建类型 */
  containCreateType?: CreateType[];
  /**过滤函数 */
  filterFieldByFunction?: (field: object) => boolean;
  /** 最大选择个数 */
  maxEnableCount?: number;
  /** 是否支持拖拽 */
  draggable?: boolean;
  /**
   * 子表的关联主键字段的父模型字段
   */
  childParentModelKey?: string;
  width?: number;
  saveCallback?: (params: Recordable<any>) => void;
}

export interface IFieldTransferOptions {
  target?: any;
  props?: Partial<IFieldTransferProps>;
}

export function useFieldTransfer() {
  let app: App | null = null;
  let instance: any = null;

  const modalKey = ref<string>('');

  function open(params: Partial<IFieldTransferProps> | Partial<IFieldTransferOptions>): void {
    let props: Partial<IFieldTransferProps>;
    let target: HTMLElement | Ref<ElRef> = document.body;
    if (has(params, 'target') || has(params, 'props')) {
      const options = params as Partial<IFieldTransferOptions>;
      props = options.props || {};
      target = options.target || document.body;
    } else {
      props = params as Partial<IFieldTransferProps>;
    }

    modalKey.value = `field-transfer-modal-${Math.random().toString(16).substring(8)}`;

    const propsData = {
      width: 740,
      modalKey: unref(modalKey),
      destroyCallback: close,
      ...props,
    };

    if (!app) {
      const container = document.createElement('div');
      container.id = unref(modalKey);

      // instance = createVNode(ModalWrapper, propsData);
      // render(instance, container);

      const t = unref(target as Ref<ElRef>);
      t?.appendChild(container);

      app = createApp(ModalWrapper, propsData);
      registerGlobComp(app);
      instance = app.mount(container);
    }
    // instance.component!.exposed!.open();
    instance.open();
  }

  function close() {
    document.querySelector(`#${unref(modalKey)}`)!.remove();
    if (app) {
      app.unmount();
      app = null;
      instance = null;
    }
  }

  return {
    open,
    close,
  };
}
