import { cloneDeep } from 'lodash-es';
import { ButtonOpinionMode, SignatureTypeEnum } from '@gct/flow/src/plugins/bpmn/enums';

export enum TabsEnum {
  /** 模型设计 */
  MODEL = 'ModelDesign',
  /** 表单设计 */
  FORM = 'FormDesign',
  /** 流程设计 */
  BPMN = 'BpmnSetting',
}

/** 单据模式 */
export enum FormEditionEnum {
  /** 专业模式 */
  PROFESSIONAL = 'PROFESSIONAL',
  /** 普通模式 */
  EASY = 'EASY',
}

/** 受控状态 */
export enum ControlStatusEnum {
  /** 期初 */
  UNCONTROLLED = 'UNCONTROLLED',
  /** 受控中 */
  RUNNING = 'RUNNING',
  /** 已受控 */
  CONTROLLED = 'CONTROLLED',
}

export enum BpmnVersionStatusEnum {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  HISTORY = 'HISTORY',
}

export enum ApprovalControlStatusEnum {
  UN_AUDITED = 'UN_AUDITED',
  IN_AUDIT = 'IN_AUDIT',
  WAIT_EFFECTIVE = 'WAIT_EFFECTIVE',
  EFFECTIVE = 'EFFECTIVE',
}

export enum ApproveHisStatusEnum {
  FINISHED = 'FINISHED',
  ENDED = 'ENDED',
}

export interface BaseButtonConfigItem {
  title: string;
  type: string;
  buttonType: 'builtin' | 'custom';
  enable: 0 | 1;
  isCustom: boolean;
  signatureType: SignatureTypeEnum;
  opinionMode?: ButtonOpinionMode;
}

export const BaseButtonConfig: BaseButtonConfigItem[] = [
  {
    title: '保存',
    type: 'Save',
    buttonType: 'builtin',
    enable: 1,
    isCustom: false,
    signatureType: SignatureTypeEnum.None,
    opinionMode: ButtonOpinionMode.Closed,
  },
  {
    title: '提交',
    type: 'Submit',
    buttonType: 'builtin',
    enable: 1,
    isCustom: false,
    signatureType: SignatureTypeEnum.None,
    opinionMode: ButtonOpinionMode.Closed,
  },
];

export function getBaseButtonConfig(_suiteKey?: string) {
  return cloneDeep(BaseButtonConfig);
}

export function handleBaseButtonConfig(
  operations?: BaseButtonConfigItem[] | string,
  suiteKey?: string,
) {
  let localOperations: BaseButtonConfigItem[] | undefined;
  if (typeof operations === 'string') {
    try {
      localOperations = JSON.parse(operations || '[]') as BaseButtonConfigItem[];
    } catch {
      localOperations = undefined;
    }
  } else {
    localOperations = operations;
  }
  const source = localOperations?.length ? localOperations : getBaseButtonConfig(suiteKey);

  return source.map((item) => ({
    ...item,
    signatureType: item.signatureType ?? SignatureTypeEnum.None,
    opinionMode: item.opinionMode ?? ButtonOpinionMode.Closed,
  }));
}
