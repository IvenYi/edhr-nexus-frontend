import { ExclamationCircleFilled } from '@ant-design/icons-vue';
import { Modal, ModalFuncProps } from 'ant-design-vue';
import { createVNode } from 'vue';

/**
 * ant确认提示框样式封装
 * @export
 * @param arg
 * @return {*}
 */
export function modalConfirm(arg: ModalFuncProps): Promise<boolean> {
  return new Promise((resolve, reject) => {
    Modal.confirm({
      icon: createVNode(ExclamationCircleFilled),
      okText: $t('sys.ok2'),
      cancelText: $t('sys.cancel'),
      closable: false,
      centered: true,
      ...arg,
      onOk: async () => {
        resolve(true);
      },
      onCancel: () => {
        resolve(false);
      },
    });
  });
}
