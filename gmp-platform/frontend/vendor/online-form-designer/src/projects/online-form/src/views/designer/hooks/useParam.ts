import { computed } from 'vue';
import { useSpreadSheet } from './useSpreadSheet';
import ParamModal from '/@online-form/views/designer/modules/modals/param-modal.vue';
import { useModelFields } from './useModelFields';
import { FieldMetaDTO } from '/@/apis/gct-apaas/model';
import { isSystemField } from '../../../utils/field.enum';
import type { IBindField } from '@gct/nocode-base';

const { paper } = useSpreadSheet();
const { modelMetaMap, masterModel, subTableFieldModel } = useModelFields();

export type IParam = {
  id: string;
  key: string;
  toFields: string[];
};

export type IToModelField = {
  toModel: string;
  toField: string;
  subModelField?: string;
};

export type FieldOptionGroup = {
  key: string;
  label: string;
  options: Array<{
    value: string;
    label: string;
  }>;
};

/**
 * 过滤模型的属性（排除关联表的属性和内置属性）
 * @author lingxiaoming
 * @date 2024-06-04 03:00:06
 * @param {FieldMetaDTO[]} fields
 * @return {*}  {FieldMetaDTO[]}
 */
function filterFields(fields: FieldMetaDTO[]): FieldMetaDTO[] {
  return fields.filter((field) => {
    if (field.createType === 'USER_DEFINED') {
      return false;
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

/**
 * 从key解析出模型key、属性key、子模型属性key
 * @author lingxiaoming
 * @date 2024-05-28 03:38:21
 * @param {string} key
 * @return {*}  {IToModelField}
 */
export function parseModelFieldKey(key: string): IToModelField {
  const [modelKey, fieldKey, subModelFieldKey] = key.split('.');
  return {
    toModel: modelKey,
    toField: fieldKey,
    subModelField: subModelFieldKey,
  };
}

export function useParam() {
  /** 参数列表 */
  const params = computed(() => {
    const result: IParam[] = [];
    paper.value.paramToField?.forEach((f) => {
      let find: IParam | undefined = result.find((item) => item.key === f.key);
      if (!find) {
        find = {
          id: f.id,
          key: f.key,
          toFields: [],
        };
        result.push(find);
      }
      find.toFields.push(calcModelFieldKey(f.toModel, f.toField, f.subModelField));
    });

    return result;
  });

  /**
   * 设置Param(可以是新建的，也可以是修改的)
   * @author lingxiaoming
   * @date 2024-05-28 03:48:11
   * @param {IParam} param
   */
  const setParam = (param: IParam): void => {
    if (!paper.value.paramToField) {
      paper.value.paramToField = [];
    }

    // 计算插入位置，保持原有顺序不变
    let insertIndex = -1;
    let removeNum = 0;
    paper.value.paramToField?.forEach((item, index) => {
      if (item.id === param.id) {
        if (insertIndex === -1) {
          insertIndex = index;
        }
        removeNum++;
      }
    });

    if (insertIndex === -1) {
      //新建的时候从0开始插入
      insertIndex = 0;
    }

    // 计算新的数组
    const newArr = param.toFields.map((key) => {
      return {
        id: param.id,
        key: param.key,
        ...parseModelFieldKey(key),
      };
    });

    // 删除并填充新的数组
    paper.value.paramToField!.splice(insertIndex, removeNum, ...newArr);
  };

  /**
   * 删除Param
   * @author lingxiaoming
   * @date 2024-05-28 03:49:43
   * @param {string} key 参数的key
   */
  const deleteParam = (key: string): void => {
    if (paper.value.paramToField?.length) {
      paper.value.paramToField = paper.value.paramToField.filter((item) => item.key !== key);
    }
  };

  /**
   * 添加参数
   */
  async function addParam() {
    const { ok, data } = await gct.openUtil.modal(
      ParamModal,
      {},
      { title: $t('sys.bi.param.add'), width: '640px', zIndex: 1500 },
    );
    if (!ok) return;

    console.log('addParam', data);
    setParam(data as unknown as IParam);
  }

  /**
   * 添加参数
   */
  async function editParam(param: IParam) {
    const { ok, data } = await gct.openUtil.modal(
      ParamModal,
      { isEdit: true, param },
      { title: $t('sys.onlineForm.modifyParameters'), width: '640px', zIndex: 1500 },
    );
    if (!ok) return;
    console.log(data);
    setParam(data as unknown as IParam);
  }

  /** 所有的模型属性分组 */
  const fieldOptionGroups = computed(() => {
    const result: FieldOptionGroup[] = [];

    // 主模型字段
    result.push({
      key: masterModel.value.key!,
      label: `${masterModel.value.name}[${masterModel.value.key}]`,
      options: filterFields(modelMetaMap.value[masterModel.value.key!].fields).map((field) => {
        return {
          value: calcModelFieldKey(masterModel.value.key!, field.key!),
          label: `${field.name}[${field.key}]`,
        };
      }),
    });

    // 子模型字段
    if (subTableFieldModel.value.length) {
      subTableFieldModel.value.forEach((sub) => {
        result.push({
          key: sub.field.key!,
          label: `${sub.field.name}(${sub.model.name}[${sub.model.key}])`,
          options: filterFields(modelMetaMap.value[sub.model.key!].fields).map((field) => {
            return {
              value: calcModelFieldKey(sub.model.key!, field.key!, sub.field.key),
              label: `${field.name}[${field.key}]`,
            };
          }),
        });
      });
    }

    return result;
  });

  /**
   * 获取已选中的选项的key集合
   * @author lingxiaoming
   * @date 2024-06-03 01:40:59
   * @param {string} [key] 不包括自身选中的属性选项
   * @return {*}  {string[]}
   */
  const getSelectedOptionKeys = (key?: string): string[] => {
    return params.value
      .filter((item) => item.key !== key)
      .reduce<string[]>((pre, cur) => pre.concat(cur.toFields), []);
  };

  return {
    params,
    fieldOptionGroups,
    getSelectedOptionKeys,
    setParam,
    deleteParam,
    addParam,
    editParam,
  };
}

/**
 * 是否是参数绑定了的属性
 * @author lingxiaoming
 * @date 2024-06-06 04:12:38
 * @export
 * @param {IBindField} field
 * @return {*}  {boolean}
 */
export function isParamBindField(field: IBindField): boolean {
  return !!paper.value.paramToField?.find(
    (item) => item.toModel === field.model && item.toField === field.field,
  );
}
