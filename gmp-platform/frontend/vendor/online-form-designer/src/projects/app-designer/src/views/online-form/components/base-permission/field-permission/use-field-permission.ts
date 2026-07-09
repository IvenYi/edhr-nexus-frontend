import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
import { FIELD_TYPE, CreateType } from '/@/enums/appEnum';
import { getModelComprehensiveSubModelList } from '/@/apis/gct-apaas/ModelComprehensiveController';
import type { FieldMetaDTO } from '/@/apis/gct-apaas/model';
import { FieldPermissionConfig, ModelMeta } from './type';
import EditFieldPermissionModal from './edit-field-permission-modal.vue';
import { calcUsedFields } from '/@online-form/views/designer/hooks/reverse-modeling';
import { reactive } from 'vue';

/**
 * 过滤掉不需要的字段信息
 * @param item
 * @return {*}
 */
function filterFieldInfo(item) {
  if ([CreateType.BUILTIN, CreateType.SYSTEM].includes(item.createType)) {
    return false;
  }
  // 排除某些字段类型
  if (
    [
      FIELD_TYPE.PRIMARY_KEY,
      FIELD_TYPE.ASSOCIATED_PRIMARY_KEY,
      FIELD_TYPE.SERIAL,
      FIELD_TYPE.REF_MULTI,
      FIELD_TYPE.RDO_REF,
      FIELD_TYPE.REF,
      FIELD_TYPE.EXPRESSION,
      FIELD_TYPE.AGG,
      FIELD_TYPE.ESOP,
      FIELD_TYPE.TRANSACTION,
      FIELD_TYPE.LABEL_TEMPLATE,
      FIELD_TYPE.SERIALRULE,
      FIELD_TYPE.PRINTER,
      FIELD_TYPE.MESSAGE_TMPL,
      FIELD_TYPE.RANGE_USER,
      FIELD_TYPE.LABEL_TEMPLATE_REF,
      FIELD_TYPE.DOCUMENT_TEMPLATE,
      FIELD_TYPE.ONLINE_FORM_TEMPLATE,
      FIELD_TYPE.E_DHR_TEMPLATE,
      FIELD_TYPE.EXPRESSION_CONDITION,
    ].includes(item.type as any)
  ) {
    return false;
  }
  return true;
}

/**
 * 处理模型字段信息，排除了不需要的部分
 * 修复某些字段没有modelKey的问题
 * @export
 * @param modelKey
 * @param [fields]
 * @return {*}
 */
export function handleFields(modelKey: string, fields?: FieldMetaDTO[]) {
  return (fields ?? [])
    .filter((item) => filterFieldInfo(item))
    .map((item) => {
      // 补充缺失的modelKey字段
      if (!item.modelKey) {
        item.modelKey = modelKey;
      }
      return item;
    });
}

/**
 * 获取模型需要的模型字段信息
 * @export
 * @param modelKey
 */
export async function getModelFields(modelKey: string) {
  const res: any = await getFieldMetaList({ modelKey: modelKey });
  return handleFields(modelKey, res);
}

/**
 * 获取子模型需要的模型字段信息
 * @export
 * @param modelKey 主模型
 */
export async function getSubModelFields(modelKey: string) {
  const res = await getModelComprehensiveSubModelList({
    modelKey,
  });
  return (res ?? []).map((m) => {
    if (m.fieldMetaList) {
      m.fieldMetaList = handleFields(m.key!, m.fieldMetaList);
    }
    return {
      key: m.key,
      name: m.name,
      fields: handleFields(m.key!, m.fieldMetaList),
    };
  });
}

export class FieldPermissionController {
  state = reactive<{
    modelMetaArr: ModelMeta[];
  }>({
    modelMetaArr: [],
  });

  set modelMetaArr(val: ModelMeta[]) {
    this.state.modelMetaArr = val;
  }

  get modelMetaArr() {
    return this.state.modelMetaArr;
  }

  constructor(private modelKey: string) {}
  async init(opts: { modelKey?: string; designerJson?: string } = {}) {
    /** 提供模型key的话修改模型key */
    const { modelKey } = opts;
    if (modelKey) {
      this.modelKey = modelKey;
    }
    const mainFields = await getModelFields(this.modelKey);
    const subModelFields = await getSubModelFields(this.modelKey);
    const subFields: FieldMetaDTO[] = [];
    const restMainFields: FieldMetaDTO[] = [];
    mainFields.forEach((field) => {
      if (field.type === FIELD_TYPE.MASTERSLAVE) {
        subFields.push(field);
      } else {
        restMainFields.push(field);
      }
    });

    this.modelMetaArr = [
      {
        title: $t('sys.component.fieldTransfer.subMainModel'),
        modelKey: this.modelKey,
        fields: mainFields,
        subModel: 0,
      },
    ];

    subFields.forEach((field) => {
      const subModel = subModelFields.find((m) => m.key === field.bindInfo);
      this.modelMetaArr.push({
        title: `${field.name}(${field.key})`,
        modelKey: field.bindInfo!,
        subModel: 1,
        fields: subModel?.fields ?? [],
      });
    });

    console.log('加载回来的模型字段信息', this.modelMetaArr);

    if (opts.designerJson) {
      const designerJson = JSON.parse(opts.designerJson);
      const usedFields = calcUsedFields({
        mainModelKey: this.modelKey,
        sheets: designerJson.sheets,
        onlyFillFields: true,
      });
      console.log('已使用的字段信息', usedFields);
      const filteredModelMetaArr: ModelMeta[] = [];
      this.modelMetaArr.forEach((item) => {
        const fields = item.fields.filter((item) => {
          return usedFields.includes(`${item.modelKey}.${item.key}`);
        });
        if (fields.length) {
          filteredModelMetaArr.push({
            ...item,
            fields,
          });
        }
      });
      console.log('过滤后的模型字段信息', filteredModelMetaArr);
      this.modelMetaArr = filteredModelMetaArr;
    }
  }

  async openModal(opts: { fieldConfigs: FieldPermissionConfig[]; readonly?: boolean }) {
    const res = await gct.openUtil.modal<{
      ok: boolean;
      data: FieldPermissionConfig[];
    }>(
      EditFieldPermissionModal,
      {
        modelMetaArr: this.modelMetaArr,
        fieldConfigs: opts.fieldConfigs,
        readonly: opts.readonly,
      },
      {
        title: $t('sys.appDesigner.fieldRole'),
        width: 640,
        height: 'auto',
        okText: $t('sys.ok'),
        cancelText: $t('sys.appDesigner.cancel'),
      },
    );
    return res;
  }
}

const instances: Record<string, FieldPermissionController> = {};
/**
 * @export
 * @param uniqueKey 唯一标识，一般默认是模型key
 * @return {*}
 */
export function useFieldPermission(uniqueKey: string) {
  if (!instances[uniqueKey]) {
    instances[uniqueKey] = new FieldPermissionController(uniqueKey);
  }

  return instances[uniqueKey];
}
