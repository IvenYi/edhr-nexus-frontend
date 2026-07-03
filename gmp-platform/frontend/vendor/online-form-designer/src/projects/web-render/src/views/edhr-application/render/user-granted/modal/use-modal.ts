import { UserGrantedAction } from '../logic/constants';
import { IUserGranted } from '../logic/type';
import UserGrantedModal from './user-granted-modal.vue';

export type ShouldCloseFn = (data) => Promise<boolean>;

const modalTitle = {
  [UserGrantedAction.Add]: $t('sys.add'),
  [UserGrantedAction.Handover]: $t('sys.edhr.handover'),
};

/**
 * 打开产品家族弹窗
 * @export
 * @param opts
 */
export async function openModal(opts: {
  shouldClose?: ShouldCloseFn;
  action: UserGrantedAction;
  data?: IUserGranted;
}) {
  gct.openUtil.modal(
    UserGrantedModal,
    {
      data: opts.data,
      shouldClose: opts.shouldClose,
      action: opts.action,
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
