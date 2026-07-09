import { createVNode, render } from 'vue';
import ProcessPopup from './index.vue';

export interface FormData {
  signature?: string;
  opinion?: string;
  user?: string | string[];
}

export interface OPTIONS {
  title: string; // 弹窗的标题
  signatureTypes?: Array<'handwrite' | 'account'>;
  // 是否需要签名
  signature?: boolean;
  // 审批意见
  opinion?: {
    show: boolean;
    required?: boolean;
  };
  //人员选择器
  user?: {
    label: string;
    show: boolean;
    multiple?: boolean;
  };
  callback?: Function;
  reject?: Function;
}

export async function openProcessPopup(options: OPTIONS) {
  return new Promise((resolve, reject) => {
    const instance = createVNode(ProcessPopup);
    const container = document.createElement('div');
    render(instance, container);
    document.body.appendChild(container);
    const popupRef = instance.component?.exposed;
    popupRef?.open({ ...options, callback: resolve, reject });
  });
}
