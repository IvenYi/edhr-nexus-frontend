import { has } from 'lodash-es';
import { ButtonTypeEnum } from '@gct/flow/src/plugins/bpmn/enums/index';
// 基础表单接口
import { IBaseButtonConfig } from '/@/projects/app-designer/src/views/online-form/components/base-button-setting';
import {
  postDocControlProcessApprove,
  postDocControlProcessResubmit,
  postDocControlProcessReturn,
  postDocControlProcessJump,
} from '/@/apis/gct-apaas/DocControlProcessController';

export interface IActionButtonItem extends IBaseButtonConfig {
  /** 自定义按钮标题 */
  customTitle?: string;
  /** 回调接口api */
  api?: Function;
}

export function useActionButton() {
  // const baseBtn: IActionButtonItem[] = [
  //   {
  //     type: 'Cancel',
  //     customTitle: '取消',
  //     title: '取消',
  //     enable: 1,
  //     buttonType: 'builtin',
  //     isCustom: false,
  //   },
  // ];

  /** 流程表单按钮组 */
  const processFormBtnGroup = [
    {
      type: ButtonTypeEnum.Return,
      title: '退回',
      api: postDocControlProcessReturn,
    },
    {
      type: ButtonTypeEnum.Submit,
      title: '提交',
      api: postDocControlProcessResubmit,
    },
    {
      type: ButtonTypeEnum.Approve,
      title: '审核',
      api: postDocControlProcessApprove,
    },
  ];

  function renderActionButton(
    showButtons: string[],
    buttonConfig: string,
    options: {
      readonly: boolean;
      isInit: boolean;
    },
  ) {
    // const _baseBtn = baseBtn.slice();

    if (options.readonly) return [];

    const buttonMap = (buttonConfig ? JSON.parse(buttonConfig) : []).reduce((acc, current) => {
      acc[current.type] = current;
      return acc;
    }, {});
    let customButton: IActionButtonItem[] = [];
    if (!options.isInit) {
      // 流程自定义按钮
      customButton = Object.values(buttonMap)
        .filter(
          (btn: any) =>
            btn.enable && has(btn, 'isCustom') && btn.isCustom && showButtons.includes(btn.type),
        )
        .map((item: any) => {
          const btn = buttonMap?.[item.type];
          return {
            ...btn,
            buttonType: 'custom',
            customTitle: btn.alias || item.title || '按钮',
            api: postDocControlProcessJump,
          };
        });
    }
    return customButton
      .concat(
        processFormBtnGroup
          .filter((info) => showButtons.includes(info.type) && !options.isInit)
          .map((item) => {
            const btn = buttonMap?.[item.type];
            if (btn && btn.enable) {
              return {
                ...btn,
                buttonType: 'builtin',
                customTitle: btn.alias || item.title || '按钮',
                api: item.api,
              };
            }
          })
          .filter((i) => i) as any,
      )
      .reverse();
  }

  return {
    renderActionButton,
  };
}
