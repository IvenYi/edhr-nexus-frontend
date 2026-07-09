import { CellWidgetCategory } from '../../enums';
import { PaperWidgeValueType, useCalculateFormula } from '@gct/nocode-base';
import { IPaper } from '../../types';
import type { IBindField, IParseFormulaVar } from '@gct/nocode-base';
import { IModel, IModelMetaMap } from '../useModelFields';
import { FieldSceneType, scanField } from './scan-field';
import { FIELD_TYPE } from '/@/enums/appEnum';
import { uuid2 } from '/@/utils/uuid';
import * as esprima from 'esprima-next';

import estraverse from 'estraverse';

import escodegen from 'escodegen';
import type { CellWidget } from '/@online-form/views/designer/types/cell-widget';
import { NumberFieldTypes, OnlineFormAutoFieldTypes } from '../../constants';
import type { FieldMetaDTO } from '/@/apis/gct-apaas/model';

/** start: 数值字段并且配置表达式 */

type FieldWidgetContainer = {
  fieldMeta?: IBindField;
  fieldWidget?: CellWidget.BasicSchema;
};

type NumberFieldFormula = {
  fieldMeta: IBindField;
  fieldWidget: CellWidget.Integer;
};

/**
 * 是否是数值类型的字段并且有配置表达式
 * @param item
 * @return {*}
 */
function hasNumberFieldFormula(item: FieldWidgetContainer): item is NumberFieldFormula {
  return (
    !!item.fieldMeta &&
    !!item.fieldWidget &&
    NumberFieldTypes.includes(item.fieldMeta?.fieldType as any) &&
    !!(item.fieldWidget as CellWidget.Integer)?.expr
  );
}

/** end: 数值字段并且配置表达式 */

function deepCalcName(node: any): string | undefined {
  if (node.type === esprima.Syntax.MemberExpression) {
    return `${
      node.object.type === esprima.Syntax.MemberExpression
        ? deepCalcName(node.object)
        : node.object.name
    }.${node.property.name}`;
  }
  if (node.type === esprima.Syntax.Identifier) {
    return node.name;
  }
}

/** 计算用到的字段,返回数组，格式是模型key.字段key */
export function calcUsedFields(opts: {
  /** 主模型key */
  mainModelKey: string;
  /** 所有表单配置数据 */
  sheets: any;
  /** 是否只计算填报用到的字段 */
  onlyFillFields?: boolean;
}): string[] {
  const { mainModelKey, sheets, onlyFillFields } = opts;
  let scanSceneTypes = Object.values(FieldSceneType);
  if (onlyFillFields) {
    scanSceneTypes = [
      FieldSceneType.CellField,
      FieldSceneType.CellMultiFields,
      FieldSceneType.DynamicTable,
      FieldSceneType.FixedTable,
    ];
  }

  const { getParseFormulaVarInfos } = useCalculateFormula();
  const fieldSet = new Set<string>();

  /** 计算字段里的表达式里的字段 */
  const parseFieldFormula = (item: FieldWidgetContainer) => {
    if (!hasNumberFieldFormula(item)) {
      return;
    }
    const expr = item.fieldWidget.expr!;
    const subModel = item.fieldMeta.model!;

    const { parseInfos } = getParseFormulaVarInfos(expr);

    parseInfos.forEach((parseInfo: IParseFormulaVar) => {
      const { type, processed, hashValue } = parseInfo;
      const prefixMap: Record<string, string | undefined> = {
        plain: mainModelKey,
        underscore: subModel,
        hash: hashValue,
      };
      const prefix = prefixMap[type];
      if (prefix) {
        fieldSet.add(`${prefix}.${processed}`);
      }
      console.log('数值字段里表达式里的字段', prefix + '.' + processed);
    });
  };

  const parseFieldContainer = (item: FieldWidgetContainer) => {
    if (!(item.fieldMeta && item.fieldWidget)) {
      return;
    }
    fieldSet.add(`${item.fieldMeta!.model}.${item.fieldMeta!.field}`);
    if (hasNumberFieldFormula(item)) {
      parseFieldFormula(item);
    }

    // 布尔类型值的引入字段
    if (item.fieldWidget.category === CellWidgetCategory.Boolean) {
      const booleanWidget = item.fieldWidget as CellWidget.Boolean;
      if (booleanWidget.trueAttachFields?.length) {
        booleanWidget.trueAttachFields.forEach((x) => {
          parseFieldContainer(x);
        });
      }
      if (booleanWidget.falseAttachFields?.length) {
        booleanWidget.falseAttachFields.forEach((x) => {
          parseFieldContainer(x);
        });
      }
    }

    // 枚举类型值的引入字段
    if (item.fieldWidget.category === CellWidgetCategory.Enum) {
      const enumWidget = item.fieldWidget as CellWidget.Enum;
      if (enumWidget.options?.length) {
        enumWidget.options.forEach((option) => {
          if (option.attachFields?.length) {
            option.attachFields.forEach((y) => {
              parseFieldContainer(y);
            });
          }
        });
      }
    }
  };

  sheets.forEach((sheet) => {
    scanField(sheet.paper, (params) => {
      // 拦截不需要扫描的场景
      if (!scanSceneTypes.includes(params.type)) {
        return;
      }

      if (params.type === FieldSceneType.CellField) {
        const { cell } = params;
        parseFieldContainer(cell);
      } else if (params.type === FieldSceneType.CellMultiFields) {
        const { cell } = params;
        cell.multiFieldsContent!.forEach((item) => {
          parseFieldContainer(item);
        });
      } else if (params.type === FieldSceneType.WidgetRangeLimit) {
        const { widget } = params;
        [
          widget.showTypeField,
          widget.lowerLimitField,
          widget.upperLimitField,
          widget.standardValueField,
        ].forEach((field) => {
          if (field) {
            fieldSet.add(`${field.model}.${field.field}`);
          }
        });
      } else if (params.type === FieldSceneType.WidgetPower) {
        const { widget } = params;
        [widget.valueField, widget.baseValueField, widget.exponentValueField].forEach((field) => {
          if (field) {
            fieldSet.add(`${field.model}.${field.field}`);
          }
        });
      } else if (
        FieldSceneType.DynamicTable === params.type ||
        FieldSceneType.FixedTable === params.type
      ) {
        const { table } = params;
        fieldSet.add(`${table.mainModel}.${table.field}`);
      } else if (
        FieldSceneType.WidgetBarcode === params.type ||
        FieldSceneType.WidgetQrcode === params.type ||
        FieldSceneType.WidgetText === params.type
      ) {
        const { widget } = params;
        if (widget.valueType === PaperWidgeValueType.Field) {
          // 组件里绑定字段的情况
          fieldSet.add(`${widget.modelKey}.${widget.value}`);
        } else if (widget.valueType === PaperWidgeValueType.Formula) {
          // 组件里绑定表达式的情况
          if (widget.value) {
            const { parseInfos } = getParseFormulaVarInfos(widget.value);

            parseInfos.forEach((parseInfo: IParseFormulaVar) => {
              const { type, processed, hashValue } = parseInfo;
              const prefixMap: Record<string, string | undefined> = {
                plain: mainModelKey,
                underscore: widget.modelKey,
                hash: hashValue,
              };
              const prefix = prefixMap[type];

              if (prefix) {
                fieldSet.add(`${prefix}.${processed}`);
              }
              console.log('表达式里的字段', prefix + '.' + processed);
            });
          }
        }
      }
    });
  });
  return Array.from(fieldSet);
}

/**
 * 替换公式里的字段key
 */
export function replaceFormulaFields(opts: {
  expr: string;
  oldKey: string;
  newKey: string;
  isSubModel?: boolean;
}) {
  const { expr, oldKey, newKey, isSubModel } = opts;
  const ast = esprima.parse(expr);
  estraverse.traverse(ast, {
    enter: function (node: any) {
      if (isSubModel && node.type === esprima.Syntax.MemberExpression) {
        const id = deepCalcName(node);
        if (id === `_.${oldKey}`) {
          Object.assign(node, {
            name: `_.${newKey}`,
            type: esprima.Syntax.Identifier,
          });
        }
      } else if (!isSubModel && node.type === esprima.Syntax.Identifier) {
        if (node.name === oldKey) {
          Object.assign(node, {
            name: newKey,
          });
        }
      }
    },
  });
  const result = escodegen.generate(ast, {
    format: {
      semicolons: false,
    },
  });
  return result;
}

/** 替换所有绑定字段的key */
export function replaceAllFieldKeys(opts: {
  paper: IPaper;
  oldKey: string;
  newKey: string;
  modelKey: string;
}) {
  const { paper, oldKey, newKey, modelKey } = opts;
  const replaceFieldMeta = (fieldMeta: IBindField) => {
    if (fieldMeta.model === modelKey && fieldMeta.field === oldKey) {
      fieldMeta.field = newKey;
    }
  };

  /** 计算字段里的表达式里的字段 */
  const parseFieldFormula = (item: FieldWidgetContainer) => {
    if (!hasNumberFieldFormula(item)) {
      return;
    }
    const expr = item.fieldWidget.expr!;
    const subModel = item.fieldMeta.model!;
    if ([subModel, paper.mainModelKey].includes(modelKey)) {
      console.log('替换数值字段里的字段前', expr);
      const newExpr = replaceFormulaFields({
        expr: expr!,
        oldKey: oldKey,
        newKey: newKey,
        isSubModel: modelKey !== paper.mainModelKey,
      });
      item.fieldWidget.expr = newExpr;
      console.log('替换数值字段里的字段前', newExpr);
    }
  };

  const parseFieldContainer = (item: FieldWidgetContainer) => {
    if (!(item.fieldMeta && item.fieldWidget)) {
      return;
    }
    replaceFieldMeta(item.fieldMeta!);
    if (hasNumberFieldFormula(item)) {
      // 处理数值字段上配置的公式表达式
      parseFieldFormula(item);
    }

    // 布尔类型值的引入字段
    if (item.fieldWidget.category === CellWidgetCategory.Boolean) {
      const booleanWidget = item.fieldWidget as CellWidget.Boolean;
      if (booleanWidget.trueAttachFields?.length) {
        booleanWidget.trueAttachFields.forEach((x) => {
          parseFieldContainer(x);
        });
      }
      if (booleanWidget.falseAttachFields?.length) {
        booleanWidget.falseAttachFields.forEach((x) => {
          parseFieldContainer(x);
        });
      }
    }

    // 枚举类型值的引入字段
    if (item.fieldWidget.category === CellWidgetCategory.Enum) {
      const enumWidget = item.fieldWidget as CellWidget.Enum;
      if (enumWidget.options?.length) {
        enumWidget.options.forEach((option) => {
          if (option.attachFields?.length) {
            option.attachFields.forEach((y) => {
              parseFieldContainer(y);
            });
          }
        });
      }
    }
  };

  scanField(paper, (params) => {
    if (params.type === FieldSceneType.CellField) {
      const { cell } = params;
      parseFieldContainer(cell);
    } else if (params.type === FieldSceneType.CellMultiFields) {
      const { cell } = params;
      cell.multiFieldsContent!.forEach((item) => {
        parseFieldContainer(item);
      });
    } else if (params.type === FieldSceneType.WidgetRangeLimit) {
      const { widget } = params;
      [
        widget.showTypeField,
        widget.lowerLimitField,
        widget.upperLimitField,
        widget.standardValueField,
      ].forEach((field) => {
        if (field) {
          replaceFieldMeta(field);
        }
      });
    } else if (params.type === FieldSceneType.WidgetPower) {
      const { widget } = params;
      [widget.valueField, widget.baseValueField, widget.exponentValueField].forEach((field) => {
        if (field) {
          replaceFieldMeta(field);
        }
      });
    } else if (
      FieldSceneType.DynamicTable === params.type ||
      FieldSceneType.FixedTable === params.type
    ) {
      const { table } = params;
      // 表格绑定的关联字段的替换
      if (table.mainModel === modelKey && table.field === oldKey) {
        table.field = newKey;
      }
    } else if (
      FieldSceneType.WidgetBarcode === params.type ||
      FieldSceneType.WidgetQrcode === params.type ||
      FieldSceneType.WidgetText === params.type
    ) {
      const { widget } = params;
      if (widget.valueType === PaperWidgeValueType.Field) {
        // 组件里绑定字段的情况
        if (widget.modelKey === modelKey && widget.value === oldKey) {
          widget.value = newKey;
        }
      } else if (widget.valueType === PaperWidgeValueType.Formula) {
        // 组件里绑定表达式的情况
        if (widget.value && [widget.modelKey, paper.mainModelKey].includes(modelKey)) {
          console.log('替换公式里的字段前', widget.value);
          const newExpr = replaceFormulaFields({
            expr: widget.value,
            oldKey,
            newKey,
            isSubModel: modelKey !== paper.mainModelKey,
          });
          console.log('替换公式里的字段后', newExpr);
          widget.value = newExpr;
        }
      }
    }
  });
}

/** 计算已存在的字段 */
export function calcExistedFields(models: IModelMetaMap) {
  const fieldSet = new Set<string>();
  Object.values(models).forEach((model) => {
    model.fields.forEach((field) => {
      fieldSet.add(`${model.meta.key}.${field.key}`);
    });
  });
  return Array.from(fieldSet);
}

/**
 * 合并模型信息
 * @export
 * @param existedModel 接口返回的信息
 * @param newModel 暂存的临时信息
 */
export function mergeModels(existedModel: IModelMetaMap, stashedModel: IModelMetaMap) {
  Object.keys(stashedModel).forEach((key) => {
    if (!existedModel[key]) {
      // 不存在的模型直接补充进去
      existedModel[key] = stashedModel[key];
    } else {
      stashedModel[key].fields.forEach((field) => {
        // 不存在的暂存字段补充进去
        const existField = existedModel[key].fields.find((f) => f.key === field.key);
        if (!existField) {
          existedModel[key].fields.push(field);
        } else {
          // 已存在的字段，更新名称等信息
          const stashedField = field;
          if (existField?.name !== stashedField.name) {
            existField.name = stashedField.name;
          }
        }
      });
    }
  });
}

const FIELD_TYPE_PREFIX_MAP = new Map<FIELD_TYPE, string>([
  [FIELD_TYPE.TEXT, 'f_txt_'],
  [FIELD_TYPE.LONG_TEXT, 'f_ltxt_'],
  [FIELD_TYPE.INTEGER, 'f_it_'],
  [FIELD_TYPE.LONG, 'f_lg_'],
  [FIELD_TYPE.DOUBLE, 'f_dou_'],
  [FIELD_TYPE.DECIMAL, 'f_dcm_'],
  [FIELD_TYPE.DATE, 'f_d_'],
  [FIELD_TYPE.TIME, 'f_t_'],
  [FIELD_TYPE.DATE_TIME, 'f_dt_'],
  [FIELD_TYPE.OPTION, 'f_renu_'],
  [FIELD_TYPE.OPTION_MULTI, 'f_menu_'],
  [FIELD_TYPE.USER, 'f_rmem_'],
  [FIELD_TYPE.USER_MULTI, 'f_mmem_'],
  [FIELD_TYPE.ORG, 'f_rdpt_'],
  [FIELD_TYPE.ORG_MULTI, 'f_mdpt_'],
  [FIELD_TYPE.BOOLEAN, 'f_bl_'],
  [FIELD_TYPE.IMAGE, 'f_pic_'],
  [FIELD_TYPE.SIGNATURE, 'f_sig_'],
  [FIELD_TYPE.ATTACHMENT, 'f_file_'],
]);

const MASTER_SLAVE_PREFIX_MAP = {
  fixed: 'f_ftb_',
  dynamic: 'f_dtb_',
} as const;

// 公共字段元数据生成方法
function generateFieldMeta(key: string, type: string) {
  return {
    id: uuid2(32).toLowerCase(),
    key,
    name: `${$t(`sys.model.${type}`)}_${uuid2(8).toLowerCase()}`,
  };
}

/**
 * 获取自动生成的字段key和名称
 * @export
 * @param type
 * @param [tableType]
 * @return {*}
 */
export function calcAutoFieldInfo(opts: {
  type: FIELD_TYPE;
  tableType?: 'fixed' | 'dynamic';
  modelMeta: {
    meta: IModel;
    fields: FieldMetaDTO[];
  };
}) {
  const { type, tableType, modelMeta } = opts;

  // 处理主从表类型
  if (type === FIELD_TYPE.MASTERSLAVE) {
    const prefix = MASTER_SLAVE_PREFIX_MAP[tableType!];
    return generateFieldMeta(prefix + uuid2(8).toLowerCase(), type);
  }

  // 处理自动编号字段 - 直接使用类型名称作为前缀
  if (OnlineFormAutoFieldTypes.includes(type)) {
    const typePrefix = `${type.toLowerCase()}_`;
    const numberedFields = modelMeta.fields.filter((field) => field.key?.startsWith(typePrefix));

    const maxNum = numberedFields.reduce((max, field) => {
      const match = field.key?.match(/(\d+)/);
      return match ? Math.max(max, parseInt(match[1], 10)) : max;
    }, 0);

    const fieldKey = `${typePrefix}${maxNum + 1}_`;
    return generateFieldMeta(fieldKey, type);
  }

  // 处理普通字段 - 从映射表中获取前缀
  const prefix = FIELD_TYPE_PREFIX_MAP.get(type) || `${type.toLowerCase()}_`;
  return generateFieldMeta(prefix + uuid2(8).toLowerCase(), type);
}
