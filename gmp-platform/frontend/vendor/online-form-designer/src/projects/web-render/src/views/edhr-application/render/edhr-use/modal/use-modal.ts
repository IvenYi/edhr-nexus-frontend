import { EdhrUseAction } from '../logic/constants';
import { IEdhrUse } from '../logic/type';
import EdhrUseModal from './edhr-use-modal.vue';

export type ShouldCloseFn = (data) => Promise<boolean>;

const modalTitle = {
  [EdhrUseAction.NEW]: $t('sys.new') + $t('sys.edhr.edhrUse'),
  [EdhrUseAction.EDIT]: $t('sys.edit') + $t('sys.edhr.edhrUse'),
};

const disabledFields: { [k in EdhrUseAction]?: Array<keyof IEdhrUse> } = {
  [EdhrUseAction.NEW]: [] as any,
  [EdhrUseAction.EDIT]: [] as any,
};

/**
 * 打开eDHR应用弹窗
 * @export
 * @param opts
 */
export async function openModal(opts: {
  shouldClose?: ShouldCloseFn;
  action: EdhrUseAction;
  data?: IEdhrUse;
}) {
  gct.openUtil.modal(
    EdhrUseModal,
    {
      data: opts.data,
      shouldClose: opts.shouldClose,
      disabledFields: disabledFields[opts.action],
    },
    {
      title: modalTitle[opts.action],
      width: 640,
      height: 'auto',
      okText: $t('sys.okText'),
      cancelText: undefined,
    },
  );
}
