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
    /** 是否是主模型 */
    const isMasterModel = masterModel.value.key === props.modelKey;
    const currentSubTableModel = modelMetaMap.value[props.modelKey];

    const list: IdentifierGroupInterface[] = [
      calcModelFields(modelMetaMap.value[masterModel.value.key!]),
    ];

    if (isMasterModel) {
      list.push(
        ...subTableFieldModel.value.map(({ field, model }) =>
          buildIdentifierGroup({
            id: `$${field.key}$`,
            name: field.name,
            model: modelMetaMap.value[model.key!],
            idToChildren: true,
          }),
        ),
      );
    } else {
      list.push(calcModelFields(currentSubTableModel, false));
    }
    return list;
  });

  return {
    fieldsOptions,
  };
}
