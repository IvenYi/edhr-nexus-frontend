import { CanvasMode, type IPaper } from '../types';
import { num2Col } from '../utils';
import { CellWidgetCategory } from '../enums';
import { FIELD_TYPE } from '/@online-form/views/designer/enums/local-field';

enum Orientation {
  Portrait = 'portrait',
  Landscape = 'landscape',
}

export const NumColMap: Record<number, string> = Array(1000)
  .fill('')
  .reduce((m, e, i) => {
    m[i + 1] = num2Col(i + 1);
    return m;
  }, {});

export const DEFAULT_ROW_HEIGHT = 30;
export const DEFAULT_COL_WIDTH = 75;

export const PaperWidgetDropBoxId = 'PaperWidgetDropBoxId';
export const ValueEditorFieldDropBoxId = 'ValueEditorFieldDropBoxId';
export const CellContentDropBoxId = 'CellContentDropBoxId';
export const CellContentDropBoxClass = 'CellContentDropBoxClass';

export const FontSizeOptions = [5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72];

export const DEFAULT_FONT_SIZE = 12;

export const DefaultPaper: IPaper = {
  canvasMode: CanvasMode.Sheet,
  padding: {
    t: 10,
    r: 10,
    b: 10,
    l: 10,
  },
  orientation: Orientation.Portrait,
  cols: Array(10)
    .fill('')
    .map(() => ({
      width: DEFAULT_COL_WIDTH,
    })),
  rows: Array(20)
    .fill('')
    .map(() => ({
      height: DEFAULT_ROW_HEIGHT,
    })),
  cells: Array(20)
    .fill('')
    .map(() =>
      Array(12)
        .fill('')
        .map(() => ({})),
    ),
  mergedCells: [],
  paperWidgets: [],
};

/**
 * 单元格中 字段类型-组件映射
 */
export const FieldTypeToCellWidgetMap = {
  [FIELD_TYPE.TEXT]: CellWidgetCategory.Text,
  [FIELD_TYPE.LONG_TEXT]: CellWidgetCategory.Text,
  [FIELD_TYPE.PRODUCT]: CellWidgetCategory.Trace,
  [FIELD_TYPE.DEVICE]: CellWidgetCategory.Trace,
  [FIELD_TYPE.MATERIAL_NO]: CellWidgetCategory.Trace,
  [FIELD_TYPE.RELATED_LOT_NO]: CellWidgetCategory.Trace,
  [FIELD_TYPE.MFG_ORDER]: CellWidgetCategory.Trace,
  [FIELD_TYPE.RECORD_NO]: CellWidgetCategory.Trace,
  [FIELD_TYPE.ORDER_NO]: CellWidgetCategory.Trace,
  [FIELD_TYPE.TRACE_DATE]: CellWidgetCategory.Trace,

  [FIELD_TYPE.INTEGER]: CellWidgetCategory.Integer,
  [FIELD_TYPE.LONG]: CellWidgetCategory.Integer,

  [FIELD_TYPE.DOUBLE]: CellWidgetCategory.Double,
  [FIELD_TYPE.DECIMAL]: CellWidgetCategory.Decimal,

  [FIELD_TYPE.BOOLEAN]: CellWidgetCategory.Boolean,

  [FIELD_TYPE.DATE]: CellWidgetCategory.DateTime,
  [FIELD_TYPE.TIME]: CellWidgetCategory.DateTime,
  [FIELD_TYPE.DATE_TIME]: CellWidgetCategory.DateTime,

  [FIELD_TYPE.IMAGE]: CellWidgetCategory.Image,
  [FIELD_TYPE.ATTACHMENT]: CellWidgetCategory.File,

  [FIELD_TYPE.USER]: CellWidgetCategory.User,
  [FIELD_TYPE.USER_MULTI]: CellWidgetCategory.User,

  [FIELD_TYPE.ORG]: CellWidgetCategory.Org,
  [FIELD_TYPE.ORG_MULTI]: CellWidgetCategory.Org,

  [FIELD_TYPE.ENUM]: CellWidgetCategory.Enum,
  [FIELD_TYPE.ENUM_MULTI]: CellWidgetCategory.Enum,

  [FIELD_TYPE.OPTION]: CellWidgetCategory.Enum,
  [FIELD_TYPE.OPTION_MULTI]: CellWidgetCategory.Enum,

  [FIELD_TYPE.REF]: CellWidgetCategory.Ref,
  [FIELD_TYPE.REF_MULTI]: CellWidgetCategory.Ref,

  [FIELD_TYPE.SIGNATURE]: CellWidgetCategory.Signature, // 平台签名

  [FIELD_TYPE.EXPRESSION]: CellWidgetCategory.Expression,
  [FIELD_TYPE.AGG]: CellWidgetCategory.Agg,

  [FIELD_TYPE.ROUTING_OPERATION]: CellWidgetCategory.Ref,
  [FIELD_TYPE.GOOD_QTY]: CellWidgetCategory.Double,
  [FIELD_TYPE.NOT_GOOD_QTY]: CellWidgetCategory.Double,
  [FIELD_TYPE.REPORT_START_TIME]: CellWidgetCategory.DateTime,
  [FIELD_TYPE.REPORT_END_TIME]: CellWidgetCategory.DateTime,
  [FIELD_TYPE.WORK_HOURS]: CellWidgetCategory.Decimal,
  [FIELD_TYPE.PRODUCTION_DATE]: CellWidgetCategory.DateTime,
  [FIELD_TYPE.REPORTER]: CellWidgetCategory.Signature,
  [FIELD_TYPE.NOT_GOOD_REASON]: CellWidgetCategory.Ref,
  [FIELD_TYPE.NOT_GOOD_GROUP]: CellWidgetCategory.Ref,
  [FIELD_TYPE.SCRAP_REASON]: CellWidgetCategory.Ref,
  [FIELD_TYPE.SCRAP_GROUP]: CellWidgetCategory.Ref,
  [FIELD_TYPE.SCRAP_QTY]: CellWidgetCategory.Double,
  [FIELD_TYPE.SCRAP_MATERIAL]: CellWidgetCategory.Ref,
  [FIELD_TYPE.SCRAP_MATERIAL_NO]: CellWidgetCategory.Ref,
  [FIELD_TYPE.DESTRUCTIVE_TEST_QTY]: CellWidgetCategory.Double,
  [FIELD_TYPE.PRODUCT_CHECK_QTY]: CellWidgetCategory.Double,
  [FIELD_TYPE.MATERIAL_CHECK_QTY]: CellWidgetCategory.Double,

  [FIELD_TYPE.DEVICE_REF]: CellWidgetCategory.Ref,
  [FIELD_TYPE.DEVICE_REF_MULTI]: CellWidgetCategory.Ref,
  //...
  [FIELD_TYPE.QTY_REQUIRED]: CellWidgetCategory.Double,
  [FIELD_TYPE.QTY_CONSUMED]: CellWidgetCategory.Double,
  [FIELD_TYPE.QTY]: CellWidgetCategory.Double,

  [FIELD_TYPE.WAREHOUSE_RECEIPT_NO]: CellWidgetCategory.Text,
  [FIELD_TYPE.WAREHOUSE_RECEIPT_DATE]: CellWidgetCategory.DateTime,
  [FIELD_TYPE.WAREHOUSE_MANAGER]: CellWidgetCategory.Signature,
};

/** 数值类的属性类型 */
export const NumberFieldTypes = [
  FIELD_TYPE.LONG,
  FIELD_TYPE.INTEGER,
  FIELD_TYPE.DECIMAL,
  FIELD_TYPE.DOUBLE,
  FIELD_TYPE.GOOD_QTY,
  FIELD_TYPE.NOT_GOOD_QTY,
  FIELD_TYPE.WORK_HOURS,
  FIELD_TYPE.SCRAP_QTY,
  FIELD_TYPE.DESTRUCTIVE_TEST_QTY,
  FIELD_TYPE.PRODUCT_CHECK_QTY,
  FIELD_TYPE.MATERIAL_CHECK_QTY,
  FIELD_TYPE.QTY_REQUIRED,
  FIELD_TYPE.QTY_CONSUMED,
  FIELD_TYPE.QTY,
];

/** 在线表单支持的普通字段类型 */
export const OnlineFormNormalTypes = [
  FIELD_TYPE.TEXT,
  FIELD_TYPE.LONG_TEXT,
  FIELD_TYPE.INTEGER,
  FIELD_TYPE.LONG,
  FIELD_TYPE.DOUBLE,
  FIELD_TYPE.DECIMAL,
  FIELD_TYPE.BOOLEAN,
  FIELD_TYPE.DATE,
  FIELD_TYPE.TIME,
  FIELD_TYPE.DATE_TIME,
  FIELD_TYPE.IMAGE,
  FIELD_TYPE.ATTACHMENT,
  FIELD_TYPE.SIGNATURE,
  FIELD_TYPE.OPTION,
  FIELD_TYPE.OPTION_MULTI,
  FIELD_TYPE.USER,
  FIELD_TYPE.USER_MULTI,
  FIELD_TYPE.ORG,
  FIELD_TYPE.ORG_MULTI,
];

/** 在线表单支持的追溯字段类型 */
export const OnlineFormTraceTypes = [
  FIELD_TYPE.DEVICE,
  FIELD_TYPE.MATERIAL_NO,
  FIELD_TYPE.RELATED_LOT_NO,
  FIELD_TYPE.PRODUCT,
  FIELD_TYPE.MFG_ORDER,
  FIELD_TYPE.RECORD_NO,
  FIELD_TYPE.ORDER_NO,
  FIELD_TYPE.TRACE_DATE,
];

/** 在线表单支持的业务字段类型 */
export const OnlineFormBusinessTypes = [
  FIELD_TYPE.ROUTING_OPERATION,
  FIELD_TYPE.GOOD_QTY,
  FIELD_TYPE.NOT_GOOD_QTY,
  FIELD_TYPE.REPORT_START_TIME,
  FIELD_TYPE.REPORT_END_TIME,
  FIELD_TYPE.WORK_HOURS,
  FIELD_TYPE.PRODUCTION_DATE,
  FIELD_TYPE.REPORTER,
  FIELD_TYPE.NOT_GOOD_REASON,
  FIELD_TYPE.NOT_GOOD_GROUP,
  FIELD_TYPE.SCRAP_REASON,
  FIELD_TYPE.SCRAP_GROUP,
  FIELD_TYPE.SCRAP_QTY,
  FIELD_TYPE.SCRAP_MATERIAL,
  FIELD_TYPE.SCRAP_MATERIAL_NO,
  FIELD_TYPE.DESTRUCTIVE_TEST_QTY,
  FIELD_TYPE.PRODUCT_CHECK_QTY,
  FIELD_TYPE.MATERIAL_CHECK_QTY,
  FIELD_TYPE.WAREHOUSE_MANAGER,
  FIELD_TYPE.WAREHOUSE_RECEIPT_NO,
  FIELD_TYPE.WAREHOUSE_RECEIPT_DATE,
];

/** 在线表单支持的自增字段类型 */
export const OnlineFormAutoFieldTypes = [...OnlineFormTraceTypes, ...OnlineFormBusinessTypes];

/** 在线表单支持的所有字段类型 */
export const OnlineFormAllTypes = [
  ...OnlineFormNormalTypes,
  ...OnlineFormTraceTypes,
  ...OnlineFormBusinessTypes,
];

/**
 * 导入用
 * 字段属性与文本映射
 */
export const FIELD_PROP_LABEL_MAP: Record<string, string> = {
  key: $t('sys.onlineForm.fieldKey'),
  name: $t('sys.FieldName'),
  type: $t('sys.bi.fieldType'),
  required: $t('sys.requiredOrNot'),
  uniqueConstraint: $t('sys.model.uniqueOrNot'),
  disabled: $t('sys.onlineForm.disabledStatus'),
};

/**
 * 导入用
 * 字段类型与文本映射
 */
export const FIELD_TYPE_LABEL_MAP: Partial<Record<FIELD_TYPE, string>> = {
  [FIELD_TYPE.TEXT]: $t('sys.text'),
  [FIELD_TYPE.LONG_TEXT]: $t('sys.component.dataConnection.modelField.long_text'),
  [FIELD_TYPE.INTEGER]: $t('sys.component.dataConnection.modelField.integer'),
  [FIELD_TYPE.LONG]: $t('sys.component.dataConnection.modelField.long'),
  [FIELD_TYPE.DOUBLE]: $t('sys.component.dataConnection.modelField.double'),
  [FIELD_TYPE.DECIMAL]: $t('sys.component.dataConnection.modelField.decimal'),
  [FIELD_TYPE.BOOLEAN]: $t('sys.component.dataConnection.modelField.boolean'),
  [FIELD_TYPE.DATE]: $t('sys.component.dataConnection.modelField.date'),
  [FIELD_TYPE.TIME]: $t('sys.tableColumnDate'),
  [FIELD_TYPE.DATE_TIME]: $t('sys.component.dataConnection.modelField.date_time'),
  [FIELD_TYPE.IMAGE]: $t('sys.appDesigner.appLogoImage'),
  [FIELD_TYPE.ATTACHMENT]: $t('sys.component.dataConnection.modelField.attachment'),
  // [FIELD_TYPE.MASTERSLAVE]: '主从关联',
  [FIELD_TYPE.USER]: $t('sys.component.dataConnection.modelField.user'),
  [FIELD_TYPE.USER_MULTI]: $t('sys.component.dataConnection.modelField.user_multi'),
  [FIELD_TYPE.ORG]: $t('sys.component.dataConnection.modelField.org'),
  [FIELD_TYPE.ORG_MULTI]: $t('sys.component.dataConnection.modelField.org_multi'),
  [FIELD_TYPE.OPTION]: $t('sys.model.option'),
  [FIELD_TYPE.OPTION_MULTI]: $t('sys.component.dataConnection.modelField.enum_multi'),
  // [FIELD_TYPE.REF]: '模型关联',
  // [FIELD_TYPE.REF_MULTI]: '模型多选',
  [FIELD_TYPE.SIGNATURE]: $t('sys.signatureImage'),
  [FIELD_TYPE.MATERIAL_NO]: 'LOT/SN',
  [FIELD_TYPE.RELATED_LOT_NO]: $t('sys.model.related_lot_no'),
  [FIELD_TYPE.PRODUCT]: $t('sys.model.product'),
  [FIELD_TYPE.DEVICE]: $t('sys.developer.devive.index'),
  [FIELD_TYPE.MFG_ORDER]: $t('sys.model.mfg_order'),
  [FIELD_TYPE.RECORD_NO]: $t('sys.model.record_no'),
  [FIELD_TYPE.TRACE_DATE]: $t('sys.model.trace_date'),
  [FIELD_TYPE.ORDER_NO]: $t('sys.model.order_no'),
  [FIELD_TYPE.ROUTING_OPERATION]: $t('sys.model.routing_operation'),
  [FIELD_TYPE.GOOD_QTY]: $t('sys.model.good_qty'),
  [FIELD_TYPE.NOT_GOOD_QTY]: $t('sys.model.not_good_qty'),
  [FIELD_TYPE.REPORT_START_TIME]: $t('sys.model.report_start_time'),
  [FIELD_TYPE.REPORT_END_TIME]: $t('sys.model.report_end_time'),
  [FIELD_TYPE.WORK_HOURS]: $t('sys.model.work_hours'),
  [FIELD_TYPE.PRODUCTION_DATE]: $t('sys.model.production_date'),
  [FIELD_TYPE.REPORTER]: $t('sys.model.reporter'),
  [FIELD_TYPE.NOT_GOOD_REASON]: $t('sys.model.not_good_reason'),
  [FIELD_TYPE.NOT_GOOD_GROUP]: $t('sys.model.not_good_group'),
  [FIELD_TYPE.SCRAP_REASON]: $t('sys.model.scrap_reason'),
  [FIELD_TYPE.SCRAP_GROUP]: $t('sys.model.scrap_group'),
  [FIELD_TYPE.SCRAP_QTY]: $t('sys.model.scrap_qty'),
  [FIELD_TYPE.SCRAP_MATERIAL]: $t('sys.model.scrap_material'),
  [FIELD_TYPE.SCRAP_MATERIAL_NO]: $t('sys.model.scrap_material_no'),
  [FIELD_TYPE.DESTRUCTIVE_TEST_QTY]: $t('sys.model.destructive_test_qty'),
  [FIELD_TYPE.PRODUCT_CHECK_QTY]: $t('sys.model.product_check_qty'),
  [FIELD_TYPE.WAREHOUSE_RECEIPT_NO]: $t('sys.model.warehouse_receipt_no'),
  [FIELD_TYPE.WAREHOUSE_RECEIPT_DATE]: $t('sys.model.warehouse_receipt_date'),
  [FIELD_TYPE.WAREHOUSE_MANAGER]: $t('sys.model.warehouse_manager'),
  [FIELD_TYPE.QTY_REQUIRED]: $t('sys.model.qty_required'),
  [FIELD_TYPE.QTY_CONSUMED]: $t('sys.model.qty_consumed'),
  [FIELD_TYPE.QTY]: $t('sys.model.qty'),
};
