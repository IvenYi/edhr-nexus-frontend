import { ApproveControlAction, ApproveControlActionMap } from './approveControl';
import { isEnableApproveControl } from '../hooks/useApproveControl';
import { ControlAction, ControlActionMap } from './control';
import { BasicAction } from '/@/enums/authActionEnum';
import { DhrPermissionEnum } from '/@/perms/index';

/**
 * 表单版本的操作
 */
export enum FormVersionAction {
  /** 创建版本 */
  CREATE_VERSION = 'create_version',
  /** 编辑版本 */
  EDIT_VERSION = 'edit_version',
  /** 复制版本 */
  COPY_VERSION = 'copy_version',
  /** 删除版本 */
  DELETE_VERSION = 'delete_version',
  /** 设计版本 */
  DESIGN_VERSION = 'design_version',
  /** 模拟填报 */
  SIMULATION_FILLING = 'simulation_filling',
  /** 复制表单，携带默认版本 */
  COPY_FORM = 'copy_form',
  /** 复制表单，携带指定版本 */
  COPY_FORM_WITH_VERSION = 'copy_form_with_version',
  /** 设置默认版本 */
  SET_DEFAULT_VERSION = 'set_default_version',
  /** 建模追溯 */
  MODELING_TRACEABILITY = 'modelingTraceability',
  /** 版本对比 */
  VERSION_DIFF = 'version_diff',
}

export const FormVersionActionMap = {
  [FormVersionAction.CREATE_VERSION]: {
    authAction: [BasicAction.Insert, DhrPermissionEnum.InsertVer],
    label: $t('sys.pageDesigner.version_createText'),
  },
  [FormVersionAction.EDIT_VERSION]: {
    authAction: [BasicAction.Update, DhrPermissionEnum.UpdateVer],
    label: $t('sys.edit'),
  },
  [FormVersionAction.COPY_VERSION]: {
    authAction: [BasicAction.Insert, DhrPermissionEnum.CopyVer],
    label: $t('sys.pageDesigner.version_copyText'),
  },
  [FormVersionAction.DELETE_VERSION]: {
    authAction: [BasicAction.Delete, DhrPermissionEnum.DeleteVer],
    label: $t('sys.delete'),
  },
  [FormVersionAction.DESIGN_VERSION]: {
    authAction: [BasicAction.Design, DhrPermissionEnum.Design],
    label: $t('sys.design'),
  },
  [FormVersionAction.SIMULATION_FILLING]: {
    authAction: [BasicAction.Design, DhrPermissionEnum.Design],
    label: $t('sys.edhr.designMode.SimulateFill'),
  },
  [FormVersionAction.COPY_FORM]: {
    authAction: [BasicAction.Insert, DhrPermissionEnum.CopyDefaultVer],
    label: $t('sys.copy'),
  },
  [FormVersionAction.COPY_FORM_WITH_VERSION]: {
    authAction: [BasicAction.Insert, DhrPermissionEnum.CopyCurrentVer],
    label: $t('sys.copy'),
  },
  [FormVersionAction.SET_DEFAULT_VERSION]: {
    authAction: [BasicAction.Update, DhrPermissionEnum.UpdateVer],
    label: $t('sys.setDefault'),
  },
  [FormVersionAction.MODELING_TRACEABILITY]: {
    label: $t('sys.appDesigner.modelTrace'),
  },
  [FormVersionAction.VERSION_DIFF]: {
    authAction: [DhrPermissionEnum.CompareVersion, DhrPermissionEnum.CompareVersion],
    label: $t('sys.onlineForm.versionDiff'),
  },
  ...ControlActionMap,
  ...ApproveControlActionMap,
};

/** 表单版本父的操作 */
export const FormVersionParentActions = [
  FormVersionAction.COPY_FORM,
  FormVersionAction.CREATE_VERSION,
  FormVersionAction.VERSION_DIFF,
];

// @Progressives [迭代3.0.5]eDHR审核功能替代之前的文控，medPro可渐进式选择替换
export const ApproveControlActions = [
  ApproveControlAction.APPROVE,
  ApproveControlAction.APPROVE_PATH,
  ApproveControlAction.EFFECT,
  ApproveControlAction.WITHDRAW,
  ApproveControlAction.BUTTON_DESIGN,
  ApproveControlAction.PROCESS_DESIGN,
];

// 文控操作 will @deprecated!!!
export const ControlActions = [
  ControlAction.CONTROL,
  ControlAction.CONTROL_PATH,
  ControlAction.WITHDRAW,
  ControlAction.PROCESS_DESIGN,
  ControlAction.BUTTON_DESIGN,
];

const ControlActionEntries = isEnableApproveControl()
  ? [...ApproveControlActions]
  : [...ControlActions];

/** 表单版本的操作 */
export const FormVersionActions = [
  FormVersionAction.DESIGN_VERSION,
  FormVersionAction.COPY_VERSION,
  FormVersionAction.DELETE_VERSION,
  FormVersionAction.EDIT_VERSION,
  // FormVersionAction.COPY_FORM_WITH_VERSION,
  FormVersionAction.SIMULATION_FILLING,
  FormVersionAction.SET_DEFAULT_VERSION,
  FormVersionAction.MODELING_TRACEABILITY,

  ...ControlActionEntries,
];

export const SystemFieldKeyMap = {
  id_: {
    fieldType: 'text',
    fieldName: 'ID',
  },
  create_time_: {
    fieldType: 'text',
    fieldName: $t('sys.createTime'),
  },
  create_user_id_: {
    fieldType: 'text',
    fieldName: $t('sys.onlineForm.creatorID'),
  },
  create_user_name_: {
    fieldType: 'text',
    fieldName: $t('sys.createName'),
  },
  modify_time_: {
    fieldType: 'text',
    fieldName: $t('sys.modifyTime'),
  },
  modify_user_id_: {
    fieldType: 'text',
    fieldName: $t('sys.onlineForm.modifierID'),
  },
  modify_user_name_: {
    fieldType: 'text',
    fieldName: $t('sys.modifier'),
  },
  deleted_: {
    fieldType: 'text',
    fieldName: $t('sys.onlineForm.confirmDeletion'),
  },
  ref_master_id_: {
    fieldType: 'text',
    fieldName: $t('sys.onlineForm.referenceMasterModelDataId'),
  },
  ref_model_key_: {
    fieldType: 'text',
    fieldName: $t('sys.onlineForm.referenceMasterModelKey'),
  },
  ref_field_key_: {
    fieldType: 'text',
    fieldName: $t('sys.onlineForm.referenceMasterModelFieldKey'),
  },
};

export const getSetFieldColumns = () => [
  {
    title: $t('sys.model.viewOriginFieldKey'),
    dataIndex: 'column',
  },
  {
    title: $t('sys.component.dataConnection.hasUsed'),
    dataIndex: 'enabled',
    width: 90,
  },
  {
    title: $t('sys.model.viewFieldKey'),
    dataIndex: 'key',
  },
  {
    title: $t('sys.component.dataConnection.fieldName'),
    dataIndex: 'name',
  },
  {
    title: $t('sys.component.dataConnection.fieldType'),
    dataIndex: 'type',
  },
];

/**
 * 模型字段映射
 */
enum ModelFieldTypeEnum {
  /** 文本 */
  text = 'text',
  /** 长文本 */
  long_text = 'long_text',
  /** 图片 */
  image = 'image',
  /** 附件 */
  attachment = 'attachment',
}

const dataBaseFieldTypes = 'text,long_text,image,attachment';

const ModelFieldTypeOptions = Object.keys(ModelFieldTypeEnum).map((key) => {
  return {
    key,
    i18n: `sys.component.dataConnection.modelField.${key}`,
  };
});

export const getFiledOptionsByDb = () => {
  return dataBaseFieldTypes
    .split(',')
    .map((key) => ModelFieldTypeOptions.find((item) => item.key === key))
    .filter((i) => i);
};
