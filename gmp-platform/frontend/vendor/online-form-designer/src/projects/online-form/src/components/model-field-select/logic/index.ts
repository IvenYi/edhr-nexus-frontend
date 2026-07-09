import { computed } from 'vue';
import { IModelField, IModelFieldGroup } from '../types';
import { FieldMetaDTO } from '/@/apis/gct-apaas/model';
import { isSystemField } from '/@online-form/utils/field.enum';
import { useModelFields } from '/@online-form/views/designer/hooks/useModelFields';
import { FIELD_TYPE } from 'packages/runtime/src';

const { modelMetaMap, masterModel, subTableFieldModel } = useModelFields();
export function useModelFieldSelect() {
  /**
   * 过滤模型的属性（排除关联表的属性和内置属性）
   * @author lingxiaoming
   * @date 2024-06-04 03:00:06
   * @param {FieldMetaDTO[]} fields
   * @return {*}  {FieldMetaDTO[]}
   */
  function filterFields(fields: FieldMetaDTO[]): FieldMetaDTO[] {
    return fields.filter((field) => {
      // 排除非用户自建字段
      if (field.createType !== 'USER_DEFINED') {
        return false;
      }
      // 排除关联主子关系的字段
      if (field.bindInfo) {
        return;
      }
      return !isSystemField(field.key!);
    });
  }

  /**
   * 生成关联模型属性的唯一标识
   * @author lingxiaoming
   * @date 2024-05-28 03:33:12
   * @param {string} modelKey 模型key
   * @param {string} fieldKey 属性key
   * @param {string} subModelFieldKey 子模型在主模型里的属性key
   * @return {*}  {string}
   */
  function calcModelFieldKey(
    modelKey: string,
    fieldKey: string,
    subModelFieldKey: string = '',
  ): string {
    return `${modelKey}.${fieldKey}.${subModelFieldKey}`;
  }

  /** 缓存所有的模型属性信息 */
  const fieldInfoMap = new Map<string, IModelField>();

  /** 带分组所有主子的模型属性 */
  const fieldOptionGroups = computed(() => {
    fieldInfoMap.clear();
    const result: IModelFieldGroup[] = [];
    // 主模型字段
    result.push({
      key: masterModel.value.key!,
      label: `${masterModel.value.name}[${masterModel.value.key}]`,
      options: filterFields(modelMetaMap.value[masterModel.value.key!].fields).map((field) => {
        const uniqueKey = calcModelFieldKey(masterModel.value.key!, field.key!);
        fieldInfoMap.set(uniqueKey, {
          model: masterModel.value.key!,
          field: field.key!,
          fieldType: field.type as FIELD_TYPE,
        });
        return {
          value: uniqueKey,
          label: `${field.name}[${field.key}]`,
        };
      }),
    });

    // 子模型字段
    if (subTableFieldModel.value.length) {
      subTableFieldModel.value.forEach((sub) => {
        const fields = filterFields(modelMetaMap.value[sub.model.key!].fields);
        if (!fields.length) {
          return;
        }
        result.push({
          key: sub.field.key!,
          label: `${sub.field.name}(${sub.model.name}[${sub.model.key}])`,
          options: fields.map((field) => {
            const uniqueKey = calcModelFieldKey(sub.model.key!, field.key!, sub.field.key);
            fieldInfoMap.set(uniqueKey, {
              model: sub.model.key!,
              field: field.key!,
              subModelField: sub.field.key,
              fieldType: field.type as FIELD_TYPE,
            });

            return {
              value: uniqueKey,
              label: `${field.name}[${field.key}]`,
            };
          }),
        });
      });
    }

    return result;
  });

  /**
   * 主模型属性的下拉选项
   */
  const masterFieldsOptions = computed(() => {
    fieldInfoMap.clear();
    return filterFields(modelMetaMap.value[masterModel.value.key!].fields).map((field) => {
      const uniqueKey = calcModelFieldKey(masterModel.value.key!, field.key!);
      fieldInfoMap.set(uniqueKey, {
        model: masterModel.value.key!,
        field: field.key!,
        fieldType: field.type as FIELD_TYPE,
      });
      return {
        value: uniqueKey,
        label: `${field.name}[${field.key}]`,
      };
    });
  });

  /**
   * 根据唯一标识获取模型字段信息
   * @param key
   * @return {*}
   */
  const getModelFieldByKey = (key: string) => {
    return fieldInfoMap.get(key);
  };

  return { masterFieldsOptions, fieldOptionGroups, calcModelFieldKey, getModelFieldByKey };
}
