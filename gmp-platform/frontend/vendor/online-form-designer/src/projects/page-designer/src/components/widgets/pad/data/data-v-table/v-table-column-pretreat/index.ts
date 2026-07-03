import { FIELD_TYPE, LowCodeWidget, modelLoader } from '@gct/runtime';
import { IVTableColumn, IVTableEditColumn } from '@gct/universal-component/gct-v-table';
import { pretreatEnumColumn } from './enum-column';
import { pretreatModelRefColumn } from './model-ref-column';

// 表格支持行编辑列字段类型白名单
const VTABLE_EDIT_COLUMN_FIELD_TYPE_WHITELIST: string[] = [
  FIELD_TYPE.TEXT,
  FIELD_TYPE.LONG_TEXT,
  FIELD_TYPE.LONG,
  FIELD_TYPE.INTEGER,
  FIELD_TYPE.DOUBLE,
  FIELD_TYPE.DECIMAL,
  FIELD_TYPE.BOOLEAN,
  FIELD_TYPE.TIME,
  FIELD_TYPE.DATE,
  FIELD_TYPE.DATE_TIME,
  FIELD_TYPE.USER,
  FIELD_TYPE.USER_MULTI,
];

/**
 * 创建表格列配置
 *
 * @export
 * @param {LowCodeWidget.BasicSchema} widget 表格组件配置
 * @param {LowCodeWidget.BasicSchema} colWidget 列组件配置
 * @return {*}  {Promise<IVTableColumn>}
 */
export async function _createColumnsConfig(
  widget: LowCodeWidget.BasicSchema,
  colWidget: LowCodeWidget.BasicSchema,
): Promise<IVTableColumn> {
  // closeValidator 为是否关闭了校验功能
  const { closeValidator } = widget.props;
  const { field, fieldType, modelKey, fieldReadonly, isFieldModel, bindFieldLink } =
    colWidget.props;
  const isLinkField = isFieldModel && bindFieldLink?.length > 0;
  const columnConfig: IVTableColumn | IVTableEditColumn = {
    type:
      fieldReadonly === true || !VTABLE_EDIT_COLUMN_FIELD_TYPE_WHITELIST.includes(fieldType)
        ? 'default'
        : 'edit',
    name: isLinkField ? bindFieldLink.join('.') : (colWidget.props.field as string),
    title: colWidget.alias || colWidget.props.fieldName,
    width:
      colWidget.style.columnwidthConfigure === 'selfAdaption'
        ? 'auto'
        : (colWidget.style.columnwidth ?? 'auto'),
    skipWhenHidden: colWidget.props.notSubmitInHide === false,
    required(widget) {
      return (
        closeValidator !== true &&
        (widget.props.required == true || columnConfig._cfg?.required === 1) &&
        !widget.props.readonly == true
      );
    },
    readonly(widget, record) {
      return (
        widget.props.fieldReadonly == true ||
        widget.props.readonly == true ||
        record?._READONLY?.[widget.props.field] === true
      );
    },
    hidden(widget) {
      return widget.props.hidden === true;
    },
    _item: colWidget,
  };
  if (modelKey) {
    const fieldCfg = await modelLoader.loadField(modelKey, field);
    columnConfig._cfg = fieldCfg;
  }
  switch (fieldType) {
    case FIELD_TYPE.ENUM:
    case FIELD_TYPE.ENUM_MULTI:
      await pretreatEnumColumn(columnConfig, colWidget);
      break;
    case FIELD_TYPE.REF:
    case FIELD_TYPE.REF_MULTI:
      await pretreatModelRefColumn(columnConfig, colWidget);
      break;
  }
  return columnConfig;
}
