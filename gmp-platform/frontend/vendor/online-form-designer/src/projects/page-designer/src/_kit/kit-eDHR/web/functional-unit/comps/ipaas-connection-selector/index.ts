import { IModalOptions } from '@gct/runtime';
import SelectForm from './select-form.vue';
import { postIpaasWebhook } from '/@/apis/gct-apaas/IPaaSController';
import { WebhookRequest } from '/@/apis/gct-apaas/model';

interface Props {
  modalProps?: IModalOptions;
  params?: IParams;
  callback?: Function;
}

export async function openConnectionModal({ modalProps = {}, params = {}, callback }: Props) {
  const res: any = await gct.openUtil.modal(
    SelectForm,
    {
      ...params,
    },
    {
      ...modalProps,
      width: modalProps?.width ?? 640,
      title:
        modalProps?.title ?? $t('sys.pleaseSelectSth', { sth: $t('sys.ipaas.connectionFlow') }),
      okText: modalProps?.okText ?? $t('sys.okText'),
    },
  );
  if (res.ok) {
    if (callback && typeof callback === 'function') callback(res.data);
  }
}

/**
 * 调用ipaas的webhook
 * @param data
 * @returns
 */
export async function postIpaasWebhookFunc(data: WebhookRequest) {
  return await postIpaasWebhook(data);
}

export default {
  openConnectionModal,
};
