import { PaperWidget } from '../../../types/paper-widget';
import { PaperWidgeType } from '@gct/nocode-base';
import { ICell, IFixedTable, IPaper, ITable } from '../../types';
import type { IBindField } from '@gct/nocode-base';
import type { CellWidget } from '/@online-form/views/designer/types/cell-widget';
import { NumberFieldTypes } from '../../constants';
import { CellWidgetCategory } from '../../enums';

/** 绑定字段的场景类型 */
export enum FieldSceneType {
  /** 单元格字段 */
  CellField = 'CellField',
  /** 单元格组合字段 */
  CellMultiFields = 'CellMultiFields',
  /** 单个的字段配置 */
  FieldWidget = 'FieldWidget',
  /** 上下限组件 */
  WidgetRangeLimit = 'WidgetRangeLimit',
  /** 次幂组件 */
  WidgetPower = 'WidgetPower',
  /** 条码组件 */
  WidgetBarcode = 'WidgetBarcode',
  /** 二维码组件 */
  WidgetQrcode = 'WidgetQrcode',
  /** 文本组件 */
  WidgetText = 'WidgetText',
  /** 动态表 */
  DynamicTable = 'DynamicTable',
  /** 固定表 */
  FixedTable = 'FixedTable',
  /** 数值字段表达式 */
  NumberFieldFormula = 'NumberFieldFormula',
}

type PartialAttachField = Partial<CellWidget.AttachField>;

type NumberFieldFormula = {
  fieldMeta: IBindField;
  fieldWidget: CellWidget.Integer;
};

export type ICellInfo = {
  /** 行索引 */
  y: number;
  /** 列索引 */
  x: number;
  /** 单元格所在的sheet页的id */
  sheetId?: string;
};

type CallbackParams =
  | {
      type: FieldSceneType.CellField;
      cell: ICell;
    }
  | {
      type: FieldSceneType.CellMultiFields;
      cell: ICell;
    }
  | {
      type: FieldSceneType.FieldWidget;
      /** 单个字段相关配置 */
      attachField: CellWidget.AttachField;
      /** 所属单元格的信息 */
      cellInfo?: ICellInfo;
    }
  | {
      type: FieldSceneType.WidgetRangeLimit;
      widget: PaperWidget.RangeLimit;
    }
  | {
      type: FieldSceneType.WidgetPower;
      widget: PaperWidget.Power;
    }
  | {
      type: FieldSceneType.WidgetBarcode;
      widget: PaperWidget.Barcode;
    }
  | {
      type: FieldSceneType.WidgetQrcode;
      widget: PaperWidget.Qrcode;
    }
  | {
      type: FieldSceneType.WidgetText;
      widget: PaperWidget.Text;
    }
  | {
      type: FieldSceneType.DynamicTable;
      table: ITable;
    }
  | {
      type: FieldSceneType.FixedTable;
      table: IFixedTable;
    }
  | {
      type: FieldSceneType.NumberFieldFormula;
      attachField: NumberFieldFormula;
    };

type callBackResult = {
  /** 是否跳过后续解析 */
  isSkip: boolean;
} | void;

/**
 * 是否是数值类型的字段并且有配置表达式
 * @param item
 * @return {*}
 */
function hasNumberFieldFormula(item: PartialAttachField): item is NumberFieldFormula {
  return (
    !!item.fieldMeta &&
    !!item.fieldWidget &&
    NumberFieldTypes.includes(item.fieldMeta?.fieldType as any) &&
    !!(item.fieldWidget as CellWidget.Integer)?.expr
  );
}

/**
 * 扫描字段
 * @export
 * @param paper
 * @param callback
 */
export function scanField(paper: IPaper, callback: (params: CallbackParams) => callBackResult) {
  /** 递归解析字段配置和其内部的字段配置 */
  function parseAttachFields(item: PartialAttachField, extra: { cellInfo?: ICellInfo } = {}) {
    if (!(item.fieldMeta && item.fieldWidget)) {
      return;
    }
    // 处理字段配置回调
    const result = callback({
      type: FieldSceneType.FieldWidget,
      attachField: item as any,
      cellInfo: extra.cellInfo,
    });

    // 回调结果表示跳过的时候，跳过后续解析
    if (result?.isSkip) {
      return;
    }

    // 处理字段后续的配置
    if (hasNumberFieldFormula(item)) {
      // 数值类型字段的表达式场景
      callback({
        type: FieldSceneType.NumberFieldFormula,
        attachField: item,
      });
    } else if (item.fieldWidget.category === CellWidgetCategory.Boolean) {
      // 布尔类型值的引入字段
      const booleanWidget = item.fieldWidget as CellWidget.Boolean;
      if (booleanWidget.trueAttachFields?.length) {
        booleanWidget.trueAttachFields.forEach((x) => {
          parseAttachFields(x, extra);
        });
      }
      if (booleanWidget.falseAttachFields?.length) {
        booleanWidget.falseAttachFields.forEach((x) => {
          parseAttachFields(x, extra);
        });
      }
    } else if (item.fieldWidget.category === CellWidgetCategory.Enum) {
      // 枚举类型值的引入字段
      const enumWidget = item.fieldWidget as CellWidget.Enum;
      if (enumWidget.options?.length) {
        enumWidget.options.forEach((option) => {
          if (option.attachFields?.length) {
            option.attachFields.forEach((y) => {
              parseAttachFields(y, extra);
            });
          }
        });
      }
    } else if (item.fieldWidget.category === CellWidgetCategory.Signature) {
      // 处理签名字段的日期填充字段
      const signWidget = item.fieldWidget as CellWidget.Signature;
      signWidget.populateFields?.forEach((x) => {
        parseAttachFields(x, extra);
      });
    }
  }

  const handleWidget = (widget: PaperWidget.BasicSchema) => {
    // 单元格绑定的组件
    switch (widget.type) {
      // 上下限组件处理
      case PaperWidgeType.RangeLimit:
        {
          callback({
            type: FieldSceneType.WidgetRangeLimit,
            widget: widget as PaperWidget.RangeLimit,
          });
        }
        break;
      // 次幂组件处理
      case PaperWidgeType.Power:
        {
          callback({
            type: FieldSceneType.WidgetPower,
            widget: widget as PaperWidget.Power,
          });
        }
        break;
      // 条码组件处理
      case PaperWidgeType.Barcode:
        {
          callback({
            type: FieldSceneType.WidgetBarcode,
            widget: widget as PaperWidget.Barcode,
          });
        }
        break;
      // 二维码组件处理
      case PaperWidgeType.Qrcode:
        {
          callback({
            type: FieldSceneType.WidgetQrcode,
            widget: widget as PaperWidget.Qrcode,
          });
        }
        break;
      // 二维码组件处理
      case PaperWidgeType.Text:
        {
          callback({
            type: FieldSceneType.WidgetText,
            widget: widget as PaperWidget.Text,
          });
        }
        break;
    }
  };

  // 计算单元格绑定的字段
  paper.cells.forEach((row, y) => {
    row.forEach((cell, x) => {
      const cellInfo: ICellInfo = {
        y,
        x,
      };
      if (cell.multiFieldsContent?.length) {
        // 组合字段绑定的字段
        const result = callback({
          type: FieldSceneType.CellMultiFields,
          cell,
        });
        if (!result?.isSkip) {
          cell.multiFieldsContent!.forEach((item) => {
            parseAttachFields(item, { cellInfo });
          });
        }
      } else if (cell.fieldMeta) {
        // 单个字段
        const result = callback({
          type: FieldSceneType.CellField,
          cell,
        });
        if (!result?.isSkip) {
          parseAttachFields(cell, { cellInfo });
        }
      } else if (cell.paperWidget) {
        // 单元格内的组件
        handleWidget(cell.paperWidget);
      }
    });
  });

  // 计算动态表绑定的关联字段
  if (paper.dynamicTables?.length) {
    paper.dynamicTables.forEach((table) => {
      callback({
        type: FieldSceneType.DynamicTable,
        table,
      });
    });
  }

  // 计算固定表绑定的关联字段
  if (paper.fixedTables?.length) {
    paper.fixedTables.forEach((table) => {
      callback({
        type: FieldSceneType.FixedTable,
        table,
      });
    });
  }

  // 计算二维表绑定的关联字段

  // 页眉页脚的组件
  if (paper.paperHeaderWidgets?.length) {
    paper.paperHeaderWidgets.forEach((widget) => {
      handleWidget(widget);
    });
  }
  if (paper.paperFooterWidgets?.length) {
    paper.paperFooterWidgets.forEach((widget) => {
      handleWidget(widget);
    });
  }

  // 自定义脚本
}
