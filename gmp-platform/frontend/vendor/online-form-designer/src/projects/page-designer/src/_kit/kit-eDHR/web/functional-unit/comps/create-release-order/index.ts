import { IModalOptions } from '@gct/runtime';
import CreateForm from './create-form.vue';

interface Props {
  modalProps?: IModalOptions;
  params?: IParams;
  callback?: Function;
}

export async function onCreateReleaseOrder({ modalProps = {}, params = {}, callback }: Props) {
  const res: any = await gct.openUtil.modal(
    CreateForm,
    {
      ...params,
    },
    {
      ...modalProps,
      width: modalProps?.width ?? 640,
      title: modalProps?.title ?? $t('sys.edhr.field.createReleaseTmpl'),
      okText: modalProps?.okText ?? $t('sys.okText'),
    },
  );
  if (res.ok) {
    if (callback && typeof callback === 'function') callback();
  }
}

export default {
  onCreateReleaseOrder,
};
