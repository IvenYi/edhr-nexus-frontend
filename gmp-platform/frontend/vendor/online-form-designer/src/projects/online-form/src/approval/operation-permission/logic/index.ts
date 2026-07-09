import { OperatePermissionConfig } from '../types';
import ButtonStyleModal from '../comp/button-style-modal.vue';
import { IGctBpmnNodeStyleConfig } from '@gct/flow/src/plugins/bpmn/types';
import { ButtonSize, ButtonType } from '/@/projects/page-designer/src/enum';
import { ButtonTypeEnum } from '@gct/flow/src/plugins/bpmn/enums';
import { CardControlEnum } from '@gct/runtime';

export const ButtonStyleDefault: IGctBpmnNodeStyleConfig = {
  hasIcon: false,
  hasText: true,
  danger: false,
  type: ButtonType.PRIMARY,
  icon: 'icon-park:all-application',
  enableCustomColor: false,
  backgroundColor: '',
  fontColor: '',
  size: ButtonSize.DEFAULT,
  controlType: CardControlEnum.CHECK,
  checkContent: '',
};

export async function openButtonStyleModal(op: OperatePermissionConfig) {
  const res = await gct.openUtil.modal(
    ButtonStyleModal,
    {
      data: op.style,
      isSaveButton: op.type === ButtonTypeEnum.Save && !op.isCustom,
      noControlConfig: op.noControl,
    },
    {
      title: $t('sys.edhr.setButtonStyle'),
      width: 640,
      showFooter: true,
    },
  );

  return res.ok ? res.data![0] : undefined;
}
