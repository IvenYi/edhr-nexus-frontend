import { LowCodeWidget, modelLoader } from '@gct/runtime';
import { IVTableColumn } from '@gct/universal-component/gct-v-table';

/**
 *
 *
 * @export
 * @param {IVTableColumn} config
 * @param {LowCodeWidget.BasicSchema} widget
 * @returns {*}  {Promise<void>}
 */
export async function pretreatEnumColumn(
  config: IVTableColumn,
  widget: LowCodeWidget.BasicSchema,
): Promise<void> {
  const { field, modelKey, isFieldModel, bindFieldLink, fieldId, modeldata } = widget.props;
  if (isFieldModel && bindFieldLink?.length > 0) {
    const [_modelKey, _field] = fieldId.split('$');
    // 枚举下 bindModelKey 是枚举标识
    const enumList = await modelLoader.loadEnumList(_modelKey, _field, modeldata?.modelCategory);
    config.enumList = enumList;
  } else {
    // 枚举下 bindModelKey 是枚举标识
    const enumList = await modelLoader.loadEnumList(modelKey, field, config._cfg?.modelCategory);
    config.enumList = enumList;
  }
}
