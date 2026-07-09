import { isPresetField as isPresetField2, useModelFields } from '../useModelFields';
import type {
  FieldMetaDTO,
  FieldMetaFormVO,
  OnlineFormTmplResponse,
} from '/@/apis/gct-apaas/model';
import { FIELD_TYPE, UniqueConstraintType } from '/@/enums/appEnum';
import { uuid2 } from '/@/utils/uuid';
import { ref } from 'vue';
import { calcAutoFieldInfo, calcExistedFields, calcUsedFields, mergeModels } from './utils';

import { FormEditionEnum } from '/@app-designer/views/online-form/constants/index';
import { FormTypeEnum } from '@gct/nocode-base';
import { FieldDefaultValueTypeEnum, FIELD_TYPE_BUSINESS } from '@gct/runtime';

/** 字段替换回调函数 */
export type FieldReplaceCallback = (params: {
  modelKey: string;
  oldKey: string;
  newKey: string;
}) => void;

/** 后台已经存在的模型字段 */
const existedFields = ref<string[]>([]);

const callBacks: {
  fieldReplace?: FieldReplaceCallback;
} = {};

/**
 * 使用反向建模
 *
 * @export
 * @return {*}
 */
export function useReverseModeling() {
  const { masterModel, modelMetaMap } = useModelFields();

  const TYPE_MAP = {
    [FIELD_TYPE.PRODUCT]: {
      bindInfo: 'em_product',
      exprInEditor: $t('sys.name'),
    },
    [FIELD_TYPE.SCRAP_MATERIAL]: {
      bindInfo: 'em_product',
      exprInEditor: $t('sys.name'),
    },
    [FIELD_TYPE.MFG_ORDER]: {
      bindInfo: 'em_mfg_order',
      exprInEditor: $t('sys.no'),
    },
    [FIELD_TYPE.ROUTING_OPERATION]: {
      bindInfo: 'em_routing_operation',
      exprInEditor: $t('sys.onlineForm.processName'),
    },
    [FIELD_TYPE.NOT_GOOD_REASON]: {
      bindInfo: 'em_not_good_reason',
      exprInEditor: $t('sys.onlineForm.defectCauseName'),
    },
    [FIELD_TYPE.NOT_GOOD_GROUP]: {
      bindInfo: 'em_not_good_group',
      exprInEditor: $t('sys.onlineForm.defectCategoryName'),
    },
    [FIELD_TYPE.SCRAP_REASON]: {
      bindInfo: 'em_scrap_reason',
      exprInEditor: $t('sys.name'),
    },
    [FIELD_TYPE.SCRAP_GROUP]: {
      bindInfo: 'em_scrap_group',
      exprInEditor: $t('sys.name'),
    },
    [FIELD_TYPE.DEVICE_REF]: {
      bindInfo: 'em_device',
      exprInEditor: $t('sys.developer.devive.name'),
    },
    [FIELD_TYPE.DEVICE_REF_MULTI]: {
      bindInfo: 'em_device',
      exprInEditor: $t('sys.developer.devive.name'),
    },
    [FIELD_TYPE.DEVICE]: {
      bindInfo: 'em_device',
      exprInEditor: $t('sys.developer.devive.name'),
    },
  };

  const getCommonConfig = (key) => {
    return {
      specificConfig: {
        displayRule: {
          exp: key,
          relationColumns: [key],
        },
      },
    };
  };

  const getFieldConfig = (fieldType) => {
    const config = TYPE_MAP[fieldType];
    const COMMON_CONFIG = getCommonConfig(fieldType === FIELD_TYPE.MFG_ORDER ? 'code_' : 'name_');
    return {
      bindInfo: config?.bindInfo,
      specificConfig: {
        displayRule: {
          ...COMMON_CONFIG.specificConfig.displayRule,
          exprInEditor: config?.exprInEditor,
        },
      },
    };
  };

  function initialize(opts: { fieldReplace: FieldReplaceCallback; modelMetaMap: any }) {
    callBacks.fieldReplace = opts.fieldReplace;
    // 清空缓存，重新计算已有的模型字段
    existedFields.value = calcExistedFields(modelMetaMap.value);
    // 合并模型数据
    if (opts.modelMetaMap) {
      mergeModels(modelMetaMap.value, opts.modelMetaMap);
    }
  }

  /** 清除未使用到的缓存字段 */
  function clearUnusedModel(opts: any) {
    // 根据模型数据，删除未使用的模型
    const usedFields = calcUsedFields(opts);
    const currentFields = calcExistedFields(modelMetaMap.value);

    // 过滤出既没有使用且不是数据库里已经存在的字段
    const removeFields = currentFields.filter(
      (key) => !usedFields.includes(key) && !existedFields.value.includes(key),
    );

    // 删除多余的字段
    if (removeFields.length) {
      removeFields.forEach((key) => {
        const [modelKey, fieldKey] = key.split('.');
        try {
          removeField({ fieldKey, modelKey });
        } catch (error) {
          // 可能删除子模型字段的时候，子模型已经被删除了
          console.warn(error.message);
        }
      });
    }
  }

  /** 是否是未发布字段 */
  function isStashedField(field: { modelKey: string; key: string }) {
    return !existedFields.value.includes(field.modelKey + '.' + field.key);
  }

  /**
   * 根据类型创建fieldDTO
   * @param opts
   * - type: 字段类型
   * - model: 字段所属模型key
   * - refModel: 关联字段对应的模型key
   * @return {*}
   */
  function getFieldDTO(opts: {
    type: string;
    model: string;
    refModel?: string;
    tableType?: 'fixed' | 'dynamic';
  }): FieldMetaDTO {
    const modelMeta = modelMetaMap.value[opts.model]!;
    const { key, name, id } = calcAutoFieldInfo({
      type: opts.type as FIELD_TYPE,
      tableType: opts.tableType,
      modelMeta,
    });
    const { type, model, refModel } = opts;
    const field: FieldMetaDTO = {
      id,
      key,
      name,
      type,
      modelKey: model,
      defaultValue: {
        type: FieldDefaultValueTypeEnum.NONE,
        value: undefined,
      },
      uniqueConstraint: {
        type: UniqueConstraintType.NONE,
        fieldKeys: undefined,
      },
    };

    switch (type) {
      case FIELD_TYPE.MASTERSLAVE:
        field.refModelType = 'BASE';
        // 关联字段的模型key
        if (refModel) {
          field.bindInfo = refModel;
        }
        break;
      case FIELD_TYPE.DECIMAL:
        field.specificConfig = {
          digits: 0,
          rulesForRounding: 6,
        };
        break;

      case FIELD_TYPE.USER:
      case FIELD_TYPE.USER_MULTI:
        field.specificConfig = {
          displayRule: {
            exp: 'fullname',
            exprInEditor: $t('sys.fullname'),
            relationColumns: ['fullname'],
          },
        };
        break;

      case FIELD_TYPE.RECORD_NO:
        field.specificConfig = {
          displayRule: {
            refRecordNo: 0,
          },
        };
        break;

      case FIELD_TYPE.DEVICE:
      case FIELD_TYPE.DEVICE_REF_MULTI:
      case FIELD_TYPE.DEVICE_REF:
      case FIELD_TYPE.SCRAP_GROUP:
      case FIELD_TYPE.SCRAP_REASON:
      case FIELD_TYPE.NOT_GOOD_GROUP:
      case FIELD_TYPE.NOT_GOOD_REASON:
      case FIELD_TYPE.ROUTING_OPERATION:
      case FIELD_TYPE.PRODUCT:
      case FIELD_TYPE.SCRAP_MATERIAL:
      case FIELD_TYPE.MFG_ORDER:
        const config = getFieldConfig(type);
        Object.assign(field, config);
        break;

      default:
        break;
    }

    console.log('getFieldDTO', field);
    return field;
  }

  function validateSameName(field: FieldMetaDTO) {
    const model = modelMetaMap.value[field.modelKey || masterModel.value.key!];
    const allNames = model.fields.map((field) => field.name);
    if (allNames.includes(field.name)) {
      throw new Error(
        $t('sys.onlineForm.reverseModelingTips.fieldHasExisted', {
          sth: field.name,
        }),
      );
    }
  }
  function validateSameKey(field: FieldMetaDTO) {
    const model = modelMetaMap.value[field.modelKey || masterModel.value.key!];
    const allKeys = model.fields.map((field) => field.key);
    if (allKeys.includes(field.key)) {
      throw new Error(
        $t('sys.onlineForm.reverseModelingTips.fieldKeyHasExisted', {
          sth: field.key,
        }),
      );
    }
  }

  function validateOnlyBusinessKey(type, modelKey) {
    // 检查当前模型是否已存在相同类型的业务字段
    if (
      Object.values(FIELD_TYPE_BUSINESS).includes(type) &&
      modelMetaMap.value[modelKey!].fields.some((i) => i.key.startsWith(type))
    ) {
      return true;
    }

    return false;
  }

  /** 修改字段信息 */
  function updateField(field: FieldMetaDTO) {
    const model = modelMetaMap.value[field.modelKey || masterModel.value.key!];
    if (!model) {
      throw new Error(field.modelKey + $t('sys.onlineForm.notExist'));
    }
    const find = model.fields.find((i) => i.id === field.id);
    if (!find) {
      throw new Error(field.id + $t('sys.onlineForm.notExist'));
    }
    if (find.name !== field.name) {
      validateSameName(field);
    }
    if (find.key !== field.key) {
      validateSameKey(field);
    }
    const oldKey = find.key!;
    const newKey = field.key!;
    Object.assign(find, field);

    // 调用外部的更新方法
    callBacks.fieldReplace?.({
      modelKey: field.modelKey!,
      oldKey,
      newKey,
    });
  }

  /** 获取字段信息 */
  function findField(opts: { modelKey?: string; fieldKey: string }) {
    const model = modelMetaMap.value[opts.modelKey || masterModel.value.key!];
    if (!model) {
      throw new Error(opts.modelKey + $t('sys.onlineForm.notExist'));
    }
    const find = model.fields.find((field) => field.key === opts.fieldKey);
    if (!find) {
      throw new Error(opts.fieldKey + $t('sys.onlineForm.notExist'));
    }
    return find;
  }

  /** 添加字段 */
  function addField(field: FieldMetaDTO) {
    const model = modelMetaMap.value[field.modelKey!];
    if (!model) {
      throw new Error(field.modelKey + $t('sys.onlineForm.notExist'));
    }
    if (field.name) {
      validateSameName(field);
    }
    if (field.key) {
      validateSameKey(field);
    }
    model.fields.push(field);
    console.log(field, '字段添加完成');
  }

  /** 删除字段 */
  function removeField(opts: { modelKey?: string; fieldKey: string }) {
    const model = modelMetaMap.value[opts.modelKey || masterModel.value.key!];
    if (!model) {
      throw new Error(opts.modelKey + $t('sys.onlineForm.notExist'));
    }
    const find = findField(opts);
    if (find.type === FIELD_TYPE.MASTERSLAVE) {
      removeSubModel({ modelKey: find.bindInfo! });
    }
    const index = model.fields.findIndex((field) => field.key === opts.fieldKey);
    model.fields.splice(index, 1);
    console.log(opts, '字段删除完成');
  }

  /** 添加子模型 */
  function addSubModel(opts: { name: string; tableType?: 'fixed' | 'dynamic' }) {
    // 往主表添加关联字段
    const modelKey = `fm_${uuid2(8).toLowerCase()}`;

    const refFieldDTO: FieldMetaDTO = getFieldDTO({
      type: FIELD_TYPE.MASTERSLAVE,
      model: masterModel.value.key!,
      refModel: modelKey,
      tableType: opts.tableType,
    });
    refFieldDTO.name = opts.name;
    addField(refFieldDTO);

    // 添加子表模型信息
    // todo 预制字段的相关信息，可能不需要
    modelMetaMap.value[modelKey] = {
      fields: [],
      meta: {
        key: modelKey,
        name: opts.name,
        subModel: 1,
      },
    };

    return {
      modelKey: modelKey,
      refFieldKey: refFieldDTO.key,
    };
  }

  /** 删除子模型(只删除模型，不删除关联字段) */
  function removeSubModel(opts: { modelKey: string }) {
    if (modelMetaMap.value[opts.modelKey]) {
      delete modelMetaMap.value[opts.modelKey];
    }
  }

  /** 获取待发布的暂存的字段集合 */
  function getStashFieldVos(): FieldMetaFormVO[] {
    const mainModelKey = masterModel.value.key!;
    const mainModel = modelMetaMap.value[mainModelKey];
    const calcFieldVos = (fieldList: FieldMetaDTO[]) => {
      return fieldList
        .map((field) => {
          const fieldVO: FieldMetaFormVO = { ...field };
          if (field.type === FIELD_TYPE.MASTERSLAVE) {
            const subFieldKeys = calcFieldVos(modelMetaMap.value[field.bindInfo!].fields);
            if (isStashedField(field as Required<FieldMetaDTO>) || subFieldKeys.length) {
              fieldVO.subFieldKeys = subFieldKeys;
              return fieldVO;
            }
          } else if (isStashedField(field as Required<FieldMetaDTO>)) {
            return fieldVO;
          }
        })
        .filter((i) => i !== undefined) as any;
    };
    return calcFieldVos(mainModel.fields);
  }

  /** 获取当前所有字段的集合，交由后台去校验更新 */
  function getAllFieldVos(): FieldMetaFormVO[] {
    const mainModelKey = masterModel.value.key!;
    const mainModel = modelMetaMap.value[mainModelKey];
    const calcFieldVos = (fieldList: FieldMetaDTO[]) => {
      return fieldList
        .map((field) => {
          const fieldVO: FieldMetaFormVO = { ...field };
          if (field.type === FIELD_TYPE.MASTERSLAVE) {
            fieldVO.subFieldKeys = calcFieldVos(modelMetaMap.value[field.bindInfo!].fields);
            return fieldVO;
          } else if (!isPresetField2(field as Required<FieldMetaDTO>)) {
            return fieldVO;
          }
        })
        .filter((i) => i !== undefined) as any;
    };
    return calcFieldVos(mainModel.fields);
  }

  /**
   * 设置小数字段的精度位数（只能修改虚拟字段）
   * @param opts
   */
  function setFieldDigits(opts: { modelKey?: string; fieldKey: string; digits: number }) {
    const field = findField(opts);
    field.specificConfig = {
      ...field.specificConfig,
      digits: opts.digits,
    };
  }

  /**
   * 设置精度小数的修约规则
   * @param opts
   */
  function setFieldRoundingRules(opts: {
    modelKey?: string;
    fieldKey: string;
    rulesForRounding: number;
  }) {
    const field = findField(opts);
    field.specificConfig = {
      ...field.specificConfig,
      rulesForRounding: opts.rulesForRounding,
    };
  }

  /** 设置记录单号的字段属性（只能修改虚拟字段） */
  function setFieldRefRecordNo(opts: { modelKey?: string; fieldKey: string; refRecordNo: number }) {
    const field = findField(opts);
    field.specificConfig = {
      refRecordNo: opts.refRecordNo,
    };
  }

  /** 判断是否是预置字段 */
  function isPresetField(opts: Pick<FieldMetaDTO, 'key' | 'modelKey'>) {
    const info = findField({ modelKey: opts.modelKey, fieldKey: opts.key! });
    return isPresetField2(info);
  }

  return {
    initialize,
    getFieldDTO,
    findField,
    updateField,
    addField,
    removeField,
    addSubModel,
    removeSubModel,
    clearUnusedModel,
    isStashedField,
    getStashFieldVos,
    setFieldDigits,
    setFieldRoundingRules,
    setFieldRefRecordNo,
    isPresetField,
    getAllFieldVos,
    validateOnlyBusinessKey,
    getFieldConfig,
  };
}

/** 是否启用电子表单的反向建模 */
export function isReverseModelingEnabled(doc: OnlineFormTmplResponse): boolean {
  return doc.edition === FormEditionEnum.EASY && doc.formType !== FormTypeEnum.TEXT;
}
