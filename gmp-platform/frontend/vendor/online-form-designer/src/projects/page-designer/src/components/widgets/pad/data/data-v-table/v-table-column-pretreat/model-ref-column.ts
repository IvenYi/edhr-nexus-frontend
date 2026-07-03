import { BindCmpStyleEnum, LowCodeWidget, modelLoader } from '@gct/runtime';
import { IVTableColumn, IVTableDataItem } from '@gct/universal-component/gct-v-table';
import { transformSourceData } from '../../../../hooks/utils';

/**
 *
 *
 * @export
 * @param {IVTableColumn} config
 * @param {LowCodeWidget.BasicSchema} widget
 * @returns {*}  {Promise<void>}
 */
export async function pretreatModelRefColumn(
  config: IVTableColumn,
  widget: LowCodeWidget.BasicSchema,
): Promise<void> {
  const { field, modelKey, bindCompStyleType } = widget.props;
  if (
    bindCompStyleType === BindCmpStyleEnum.CMP_CHECKBOX ||
    bindCompStyleType === BindCmpStyleEnum.CMP_RADIO
  ) {
    const { data, dict } = await modelLoader.loadQueryRefData({ modelKey, fieldKey: field });
    const items = transformSourceData(data, dict) as IVTableDataItem[];
    if (items.length > 0) {
      config.enumList = items;
    }
  }
}
