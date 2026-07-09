import { FIELD_TYPE } from '@gct/runtime';
import { CellColumnType } from '../constants';
import {
  IVTableColumn,
  IVTableColumnPlugin,
  IVTableDataItem,
  IVTableEditColumn,
} from '../interface';
import { IGctVTableStore } from '../store';
import { calcFieldColumnKey, calcHeaderColumnKey } from '../utils';
import { BooleanColumnPlugin } from './boolean-column/boolean-column';
import { DateColumnPlugin } from './date-column/date-column';
import { DefaultColumnPlugin } from './default-column/default-column';
import { DictColumnPlugin } from './dict-column/dict-column';
import { FieldColumnPlugin } from './field-column/field-column';
import { FormulaDisplayColumnPlugin } from './formula-display-column/formula-display-column';
import { HeaderColumnRender } from './header-column/header-column';
import { ImageColumnPlugin } from './image-column/image-column';
import { NumericColumnPlugin } from './numeric-column/numeric-column';
import { RdoModelSelectColumnPlugin } from './rdo-model-column/rdo-model-select-column';
import { DepartmentSelectColumnPlugin } from './select-column/department-select-colmun';
import { EnumSelectColumnPlugin } from './select-column/enum-select-column';
import { ModelSelectColumnPlugin } from './select-column/model-select-column';
import { PersonnelSelectColumnPlugin } from './select-column/personnel-select-column';
import { SignatureColumnPlugin } from './signature-column/signature-column';
import { TableDefaultColumn } from './table-default-column/table-default-column';
import { TextColumnPlugin } from './text-column/text-column';
import { LabelTemplateRefModelSelectColumnPlugin } from './label-template-ref-model-column/label-template-ref-model-column';

export { OperationColumnPlugin } from './operation-column/operation-column';

type PluginCreator = (
  store: IGctVTableStore,
  column: IVTableColumn,
  row: IVTableDataItem,
  rowIndex: number,
) => IVTableColumnPlugin;

class VTableCellPluginManager {
  readonly map: Map<string, PluginCreator> = new Map();

  register(type: string | string[], creator: PluginCreator) {
    if (Array.isArray(type)) {
      type.forEach((t) => this.map.set(t, creator));
    } else {
      this.map.set(type, creator);
    }
  }

  unregister(type: string | string[]): void {
    if (Array.isArray(type)) {
      type.forEach((t) => this.map.delete(t));
    } else {
      this.map.delete(type);
    }
  }

  get(type: string): PluginCreator | undefined {
    return this.map.get(type);
  }
}

/**
 * 单元格插件管理实例
 */
export const cellPluginManage = new VTableCellPluginManager();

/**
 * 注册预置列绘制
 */
function registerPlugins(): void {
  // 默认绘制
  cellPluginManage.register(CellColumnType.DEFAULT, (store, column, row, rowIndex) => {
    return new DefaultColumnPlugin(store, column, row, rowIndex);
  });
  // 表格默认字段呈现
  cellPluginManage.register(CellColumnType.FIELD_DEFAULT, (store, column, row, rowIndex) => {
    return new TableDefaultColumn(store, column, row, rowIndex);
  });
  // 文本类型
  cellPluginManage.register(
    [CellColumnType.TEXT, CellColumnType.LONG_TEXT],
    (store, column, row, rowIndex) => {
      return new TextColumnPlugin(store, column, row, rowIndex);
    },
  );
  // 数值类型
  cellPluginManage.register(
    [CellColumnType.INTEGER, CellColumnType.LONG, CellColumnType.DOUBLE, CellColumnType.DECIMAL],
    (store, column, row, rowIndex) => {
      return new NumericColumnPlugin(store, column, row, rowIndex);
    },
  );
  // 布尔类型
  cellPluginManage.register(CellColumnType.BOOLEAN, (store, column, row, rowIndex) => {
    return new BooleanColumnPlugin(store, column, row, rowIndex);
  });
  // 日期时间类型
  cellPluginManage.register(
    [CellColumnType.DATE, CellColumnType.DATE_TIME, CellColumnType.TIME],
    (store, column, row, rowIndex) => {
      return new DateColumnPlugin(store, column, row, rowIndex);
    },
  );
  // 人员多选、人员关联
  cellPluginManage.register(
    [CellColumnType.USER, CellColumnType.USER_MULTI],
    (store, column, row, rowIndex) => {
      return new PersonnelSelectColumnPlugin(store, column, row, rowIndex);
    },
  );
  // 模型多选、模型关联
  cellPluginManage.register(
    [CellColumnType.REF, CellColumnType.REF_MULTI],
    (store, column, row, rowIndex) => {
      return new ModelSelectColumnPlugin(store, column, row, rowIndex);
    },
  );
  // 版本模型多选
  cellPluginManage.register(CellColumnType.RDO_REF, (store, column, row, rowIndex) => {
    return new RdoModelSelectColumnPlugin(store, column, row, rowIndex);
  });
  // 部门多选、部门关联
  cellPluginManage.register(
    [CellColumnType.ORG, CellColumnType.ORG_MULTI],
    (store, column, row, rowIndex) => {
      return new DepartmentSelectColumnPlugin(store, column, row, rowIndex);
    },
  );
  // 枚举多选、枚举关联
  cellPluginManage.register(
    [CellColumnType.ENUM, CellColumnType.ENUM_MULTI],
    (store, column, row, rowIndex) => {
      return new EnumSelectColumnPlugin(store, column, row, rowIndex);
    },
  );
  // 图片上传
  cellPluginManage.register(CellColumnType.IMAGE, (store, column, row, rowIndex) => {
    return new ImageColumnPlugin(store, column, row, rowIndex);
  });
  // 附件上传
  cellPluginManage.register(CellColumnType.ATTACHMENT, (store, column, row, rowIndex) => {
    return new FieldColumnPlugin(store, column, row, rowIndex);
  });
  // 公式显示字段
  cellPluginManage.register(CellColumnType.DATA_TABLE_FORMULA, (store, column, row, rowIndex) => {
    return new FormulaDisplayColumnPlugin(store, column, row, rowIndex);
  });
  // DICT 呈现方式，字段类型: 事务字段、标签模板、打印机
  cellPluginManage.register(
    [CellColumnType.TRANSACTION, CellColumnType.LABEL_TEMPLATE_REF, CellColumnType.PRINTER],
    (store, column, row, rowIndex) => {
      return new DictColumnPlugin(store, column, row, rowIndex);
    },
  );
  // 签名字段类型
  cellPluginManage.register(CellColumnType.SIGNATURE, (store, column, row, rowIndex) => {
    return new SignatureColumnPlugin(store, column, row, rowIndex);
  });
  // 标签模板字段类型
  cellPluginManage.register(CellColumnType.LABEL_TEMPLATE_REF, (store, column, row, rowIndex) => {
    return new LabelTemplateRefModelSelectColumnPlugin(store, column, row, rowIndex);
  });
}
registerPlugins();

/**
 * 创建列绘制插件实例
 *
 * @export
 * @param {IGctVTableStore} store
 * @param {IVTableColumn} column
 * @param {IVTableDataItem} row
 * @param {number} rowIndex
 * @returns {*}  {IVTableColumnPlugin}
 */
export function createFieldColumnPluginInstance(
  store: IGctVTableStore,
  column: IVTableColumn,
  row: IVTableDataItem,
  rowIndex: number,
): IVTableColumnPlugin {
  const key = calcFieldColumnKey(column, row, rowIndex);
  let pluginInst = store.cellPluginManager.get(key);
  if (!pluginInst) {
    let creator: PluginCreator | undefined = undefined;
    // 根据列编辑器配置类型获取对应的列绘制插件
    if ((column as IVTableEditColumn).editor?.type) {
      creator = cellPluginManage.get((column as IVTableEditColumn).editor!.type!);
    }
    // 根据字段类型获取对应的列绘制插件
    if (!creator && column._item?.props.fieldType) {
      const fieldType = column._item.props.fieldType;
      // 公式或者汇总的情况下，需要根据返回值类型选择对应的列绘制插件
      if (fieldType === FIELD_TYPE.EXPRESSION || fieldType === FIELD_TYPE.AGG) {
        const returnType = column._item.props.returnType;
        if (returnType) {
          creator = cellPluginManage.get(returnType);
        }
      }
      if (!creator) {
        creator = cellPluginManage.get(fieldType);
      }
      if (!creator) {
        creator = cellPluginManage.get(CellColumnType.FIELD_DEFAULT)!;
      }
    }
    // 使用默认列绘制插件
    if (!creator) {
      creator = cellPluginManage.get(CellColumnType.DEFAULT)!;
    }
    pluginInst = creator(store, column, row, rowIndex);
    store.cellPluginManager.set(key, pluginInst);
  } else {
    pluginInst.updateRow(row, rowIndex);
  }
  return pluginInst;
}

/**
 * 创建列头列插件实例
 *
 * @export
 * @param {IGctVTableStore} store
 * @param {IVTableColumn} column
 * @param {number} colIndex
 * @return {*}  {IVTableColumnPlugin}
 */
export function createHeaderColumnPluginInstance(
  store: IGctVTableStore,
  column: IVTableColumn,
  colIndex: number,
): IVTableColumnPlugin {
  const key = calcHeaderColumnKey(column, colIndex);
  let pluginInst = store.cellPluginManager.get(key);
  if (!pluginInst) {
    // 目前表头列插件暂时只有一种，后续如果有多种可以参考数据列插件进行扩展
    pluginInst = new HeaderColumnRender(store, column as IVTableEditColumn, colIndex);
    store.cellPluginManager.set(key, pluginInst);
  }
  return pluginInst;
}
