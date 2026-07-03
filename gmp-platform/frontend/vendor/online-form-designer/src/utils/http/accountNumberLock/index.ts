import { Modal } from 'ant-design-vue';
import { ExclamationCircleFilled } from '@ant-design/icons-vue';
import Lock from './lock.vue';
import { h } from 'vue';

export function accountNumberLock(data) {
  const modalVm = Modal.warning({
    title: $t('sys.tip'),
    content: () =>
      h(Lock, {
        time: data,
        closeModalEvent: () => modalVm.destroy(),
      }),
    okText: $t('sys.okText'),
    centered: true,
    icon: () => h(ExclamationCircleFilled),
    onOk() {
      modalVm.destroy();
    },
  });
}
