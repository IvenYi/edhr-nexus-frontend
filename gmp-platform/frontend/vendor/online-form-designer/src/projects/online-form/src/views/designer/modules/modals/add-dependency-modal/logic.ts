import { computed } from 'vue';
import { FIELD_TYPE } from '@gct/runtime';
import { IdentifierGroupInterface } from '/@/components/Expression';
import { useModelFields } from '/@online-form/views/designer/hooks/useModelFields';

export function useFormulaEditor(props: any) {
  const { masterModel, modelMetaMap, subTableFieldModel } = useModelFields();

  const buildChildrenFromModel = (model) => {
    return model.fields
      .filter(({ type }) => type !== FIELD_TYPE.MASTERSLAVE)
      .map(({ key, name, type }) => ({
        id: key!,
        name: name!,
        valueType: type,
      }));
  };

  const buildIdentifierGroup = ({
    id,
    name,
    model,
    idToChildren = false,
  }): IdentifierGroupInterface => {
    return {
      id,
      name,
      idToChildren,
      children: buildChildrenFromModel(model),
    };
  };

  /**
   * 计算对应模型的字段选项
   * @param model
   * @return {*}
   */
  const calcModelFields = (model, isMaster = true): IdentifierGroupInterface => {
    const { key, name } = model.meta || {};
    return buildIdentifierGroup({
      id: isMaster ? key! : '_',
      name: isMaster ? name! : $t('sys.onlineForm.dynamicTableCurrentRow'),
      model,
      idToChildren: isMaster ? false : true,
    });
  };

  const fieldsOptions = computed(() => {
    const currentSubTableModel = modelMetaMap.value[props.modelKey];

    const list: IdentifierGroupInterface[] = [
      calcModelFields(modelMetaMap.value[masterModel.value.key!]),
    ];

    if (props.subModelKey) {
      //子表内部需要添加动态表格当前行
      list.push(calcModelFields(currentSubTableModel, false));
    }

    return list;
  });

  return {
    fieldsOptions,
  };
}
