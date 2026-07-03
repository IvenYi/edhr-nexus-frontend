import { has, isEmpty } from 'lodash-es';
import { ref, toRaw } from 'vue';
import { message } from 'ant-design-vue';
import { ButtonTypeEnum } from '@gct/nocode-base';
import { IActionButtonItem } from '/@/projects/online-form/src/views/integration/apaas_si/render/types';
import {
  postDocControlProcessApprove,
  postDocControlProcessReturn,
  postDocControlProcessJump,
  postDocControlProcessReassign,
} from '/@/apis/gct-apaas/DocControlProcessController';
import { excApprovalOperate } from '/@/projects/online-form/src/approval';

/** 文控审核内置按钮组 */
const builtinBtnGroup = [
  {
    type: ButtonTypeEnum.Approve,
    title: $t('sys.appDesigner.approval.button.Approve'),
    api: postDocControlProcessApprove,
    style: {
      type: 'primary',
    },
  },
  {
    type: ButtonTypeEnum.Reassign,
    title: $t('sys.appDesigner.approval.button.Reassign'),
    api: postDocControlProcessReassign,
    style: {
      type: 'primary',
    },
  },
  {
    type: ButtonTypeEnum.Return,
    title: $t('sys.appDesigner.approval.button.Return'),
    api: postDocControlProcessReturn,
  },
];

export function useApprovalButton() {
  const actionButtonList = ref<IActionButtonItem[]>([]);
  function renderActionButton(
    showButtons: string[],
    buttonConfig: string,
    options: {
      readonly: boolean;
      isInit: boolean;
    },
  ) {
    if (options.readonly) return [];

    const buttonMap = (buttonConfig ? JSON.parse(buttonConfig) : []).reduce((acc, current) => {
      acc[current.type] = current;
      return acc;
    }, {});

    const { buttons: visibleButtons, buttonsConfigMap } = hackReassignBtnLogic(
      showButtons,
      buttonMap,
    );

    let customButton: IActionButtonItem[] = [];
    if (!options.isInit) {
      // 流程自定义按钮
      customButton = Object.values(buttonsConfigMap)
        .filter(
          (btn: any) =>
            btn.enable && has(btn, 'isCustom') && btn.isCustom && showButtons.includes(btn.type),
        )
        .map((item: any) => {
          const btn = buttonsConfigMap?.[item.type];
          return {
            ...btn,
            buttonType: 'custom',
            customTitle: btn.alias || item.title,
            api: postDocControlProcessJump,
          };
        });
    }
    return customButton
      .concat(
        builtinBtnGroup
          .filter((info) => visibleButtons.includes(info.type) && !options.isInit)
          .map((item) => {
            const btn = buttonsConfigMap?.[item.type];
            if (btn && btn.enable) {
              return {
                ...btn,
                style: {
                  ...item.style,
                  ...btn.style,
                },
                buttonType: 'builtin',
                customTitle: btn.alias || item.title,
                api: item.api,
              };
            }
          })
          .filter((i) => i) as any,
      )
      .reverse();
  }

  async function handleButtonFn(btn, { taskId, tmplId }) {
    const signResult = await excApprovalOperate(btn);
    if (!signResult) return;

    const buttonConfig = JSON.stringify({
      title: btn.customTitle,
      color: btn.style?.backgroundColor,
    });
    const baseParams = {
      taskId: taskId,
      tmplId: tmplId,
      btnKey: btn.isCustom ? btn.flowAction : btn.type,
      buttonConfig,
    };
    // 需要签名或审批意见
    if (typeof signResult === 'object') {
      const signature = toRaw(signResult.signature);
      const person = toRaw(signResult.person);
      Object.assign(baseParams, {
        opinion: signResult.comment,
        signature: !isEmpty(signature) ? JSON.stringify([signature]) : undefined,
        toUserId: btn.type === ButtonTypeEnum.Reassign ? person : undefined,
      });
    }
    await btn.api(baseParams);
    message.success($t('sys.operatingTitle'));
  }

  return {
    actionButtonList,
    renderActionButton,
    handleButtonFn,
  };
}

/**
 * @description: 兼容处理旧的文控审批流程中没有转办按钮配置的问题(详细见tapd/bug号：1028002)
 * @param {showButtons}
 * @param {btnConfigMap}
 */
function hackReassignBtnLogic(showButtons: string[], btnConfigMap: Record<ButtonTypeEnum, any>) {
  if (!showButtons.includes(ButtonTypeEnum.Reassign)) {
    showButtons.push(ButtonTypeEnum.Reassign);
    Object.assign(btnConfigMap, {
      [ButtonTypeEnum.Reassign]: {
        enable: true,
        type: ButtonTypeEnum.Reassign,
        signatureType: 'None',
      },
    });
  }
  return {
    buttons: showButtons,
    buttonsConfigMap: btnConfigMap,
  };
}
