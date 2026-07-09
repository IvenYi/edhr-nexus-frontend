import { FIELD_TYPE, MaterialEnum } from '/@/enums/appEnum';
import { basicAttrsUtils, transformField2Component } from '@gct/runtime';
import { ReturnTypeEnum, EntityFormulaReturnTypeEnum } from '/@/components/Expression/types';

export { basicAttrsUtils, transformField2Component };

/** 树转一维数组 */
export function flatten(array = [], path, inSubTable) {
  return [].concat(
    ...array.map((item: any) => {
      const key =
        item.materialType === MaterialEnum.MaterialSubTableModalField
          ? `modalfield_${item.id}`
          : item.id;

      const pathstr = /^modalBody_/.test(item.id) ? 'undefined' : key;
      item.path = `${path}|${pathstr}`;

      // 是否在子表中
      item.inSubTable = inSubTable || (/^modal_/.test(item.id) && item.props.isSubTableModal);
      const children = [...(item.children || [])];
      if (item.type === 'workflow-nodes') {
        /**工作流节点特殊逻辑处理 */
        children.push(item.props.specModalInfo);
        children.push(item.props.workflowModalInfo);
      }
      return [].concat(
        {
          id: item.id,
          key: key,
          name: item.name,
          customName: item.alias,
          path: item.path,
          type: item.type,
          inSubTable: item.inSubTable,
        } as any,
        flatten(children, item.path, item.inSubTable),
      );
    }),
  );
}

/**
 * 字段填充映射处理
 */
export const transformMappingField = (fieldType: FIELD_TYPE) => {
  return {
    [FIELD_TYPE.TEXT]: {
      filterArr: [FIELD_TYPE.TEXT],
    },
    [FIELD_TYPE.LONG_TEXT]: {
      filterArr: [FIELD_TYPE.TEXT, FIELD_TYPE.LONG_TEXT],
    },
    [FIELD_TYPE.INTEGER]: {
      filterArr: [FIELD_TYPE.INTEGER],
    },
    [FIELD_TYPE.LONG]: {
      filterArr: [FIELD_TYPE.INTEGER, FIELD_TYPE.LONG],
    },
    [FIELD_TYPE.DOUBLE]: {
      filterArr: [FIELD_TYPE.DOUBLE, FIELD_TYPE.DECIMAL],
    },
    [FIELD_TYPE.DECIMAL]: {
      filterArr: [FIELD_TYPE.DECIMAL],
    },
    [FIELD_TYPE.BOOLEAN]: {
      filterArr: [FIELD_TYPE.BOOLEAN],
    },
    [FIELD_TYPE.DATE]: {
      filterArr: [FIELD_TYPE.DATE],
    },
    [FIELD_TYPE.TIME]: {
      filterArr: [FIELD_TYPE.TIME],
    },
    [FIELD_TYPE.DATE_TIME]: {
      filterArr: [FIELD_TYPE.DATE_TIME],
    },
    [FIELD_TYPE.IMAGE]: {
      filterArr: [FIELD_TYPE.IMAGE],
    },
    [FIELD_TYPE.ATTACHMENT]: {
      filterArr: [FIELD_TYPE.ATTACHMENT],
    },
    [FIELD_TYPE.MASTERSLAVE]: {
      filterArr: [FIELD_TYPE.MASTERSLAVE],
      equal: true,
    },
    [FIELD_TYPE.USER]: {
      filterArr: [FIELD_TYPE.USER],
    },
    [FIELD_TYPE.USER_MULTI]: {
      filterArr: [FIELD_TYPE.USER, FIELD_TYPE.USER_MULTI],
    },
    [FIELD_TYPE.ORG]: {
      filterArr: [FIELD_TYPE.ORG],
    },
    [FIELD_TYPE.ORG_MULTI]: {
      filterArr: [FIELD_TYPE.ORG, FIELD_TYPE.ORG_MULTI],
    },
    [FIELD_TYPE.ENUM]: {
      filterArr: [FIELD_TYPE.ENUM],
      equal: true,
    },
    [FIELD_TYPE.ENUM_MULTI]: {
      filterArr: [FIELD_TYPE.ENUM, FIELD_TYPE.ENUM_MULTI],
      equal: true,
    },
    [FIELD_TYPE.REF]: {
      filterArr: [FIELD_TYPE.REF],
      equal: true,
    },
    [FIELD_TYPE.REF_MULTI]: {
      filterArr: [FIELD_TYPE.REF, FIELD_TYPE.REF_MULTI],
      equal: true,
    },
    [FIELD_TYPE.RDO_REF]: {
      filterArr: [FIELD_TYPE.RDO_REF],
      equal: true,
    },
    [FIELD_TYPE.LABEL_TEMPLATE_REF]: {
      filterArr: [FIELD_TYPE.LABEL_TEMPLATE_REF],
    },
    [FIELD_TYPE.DOCUMENT_TEMPLATE]: {
      filterArr: [FIELD_TYPE.DOCUMENT_TEMPLATE],
    },
    [FIELD_TYPE.SERIALRULE]: {
      filterArr: [FIELD_TYPE.SERIALRULE],
    },
    [FIELD_TYPE.PRINTER]: {
      filterArr: [FIELD_TYPE.PRINTER],
    },
    [FIELD_TYPE.MESSAGE_TMPL]: {
      filterArr: [FIELD_TYPE.MESSAGE_TMPL],
    },
    [FIELD_TYPE.RANGE_USER]: {
      filterArr: [FIELD_TYPE.RANGE_USER],
    },
    [FIELD_TYPE.SIGNATURE]: {
      filterArr: [FIELD_TYPE.SIGNATURE],
    },
    [FIELD_TYPE.ONLINE_FORM_TEMPLATE]: {
      filterArr: [FIELD_TYPE.ONLINE_FORM_TEMPLATE],
    },
    [FIELD_TYPE.E_DHR_TEMPLATE]: {
      filterArr: [FIELD_TYPE.E_DHR_TEMPLATE],
    },
    // [FIELD_TYPE.ONLINE_FORM]: {
    //   filterArr: [FIELD_TYPE.ONLINE_FORM],
    // },
    [FIELD_TYPE.ESOP]: {
      filterArr: [FIELD_TYPE.ESOP],
    },
  }[fieldType];
};

/**
 * 转换原始的returnType为字段类型
 */
export const convertMappingType = (type) => {
  const convertArr = [
    {
      old: ReturnTypeEnum.String,
      new: EntityFormulaReturnTypeEnum.LongText,
    },
    {
      old: ReturnTypeEnum.Number,
      new: EntityFormulaReturnTypeEnum.Double,
    },
    {
      old: ReturnTypeEnum.Boolen,
      new: EntityFormulaReturnTypeEnum.Boolen,
    },
  ];
  return convertArr.find((i) => i.old == type)?.new || type;
};

/**
 * 自动填充映射处理
 */
export const transformMappingField4Auto = (fieldType: FIELD_TYPE) => {
  return {
    [FIELD_TYPE.TEXT]: {
      filterArr: [FIELD_TYPE.TEXT, FIELD_TYPE.LONG_TEXT],
    },
    [FIELD_TYPE.LONG_TEXT]: {
      filterArr: [FIELD_TYPE.LONG_TEXT],
    },
    [FIELD_TYPE.INTEGER]: {
      filterArr: [
        FIELD_TYPE.INTEGER,
        FIELD_TYPE.LONG,
        FIELD_TYPE.DOUBLE,
        FIELD_TYPE.TEXT,
        FIELD_TYPE.LONG_TEXT,
      ],
    },
    [FIELD_TYPE.LONG]: {
      filterArr: [FIELD_TYPE.LONG, FIELD_TYPE.TEXT, FIELD_TYPE.LONG_TEXT, FIELD_TYPE.DOUBLE],
    },
    [FIELD_TYPE.DOUBLE]: {
      filterArr: [FIELD_TYPE.DOUBLE, FIELD_TYPE.TEXT, FIELD_TYPE.LONG_TEXT],
    },
    [FIELD_TYPE.DECIMAL]: {
      filterArr: [FIELD_TYPE.DECIMAL, FIELD_TYPE.TEXT, FIELD_TYPE.LONG_TEXT],
    },
    // [FIELD_TYPE.BOOLEAN]: {
    //   filterArr: [FIELD_TYPE.BOOLEAN],
    // },
    [FIELD_TYPE.DATE]: {
      filterArr: [FIELD_TYPE.DATE],
    },
    [FIELD_TYPE.TIME]: {
      filterArr: [FIELD_TYPE.TIME],
    },
    [FIELD_TYPE.DATE_TIME]: {
      filterArr: [FIELD_TYPE.DATE_TIME, FIELD_TYPE.DATE, FIELD_TYPE.TIME],
    },
    [FIELD_TYPE.IMAGE]: {
      filterArr: [FIELD_TYPE.IMAGE],
    },
    [FIELD_TYPE.ATTACHMENT]: {
      filterArr: [FIELD_TYPE.ATTACHMENT],
    },
    [FIELD_TYPE.MASTERSLAVE]: {
      filterArr: [FIELD_TYPE.MASTERSLAVE],
      equal: true,
    },
    [FIELD_TYPE.USER]: {
      filterArr: [FIELD_TYPE.USER, FIELD_TYPE.USER_MULTI],
    },
    [FIELD_TYPE.USER_MULTI]: {
      filterArr: [FIELD_TYPE.USER_MULTI],
    },
    [FIELD_TYPE.ORG]: {
      filterArr: [FIELD_TYPE.ORG, FIELD_TYPE.ORG_MULTI],
    },
    [FIELD_TYPE.ORG_MULTI]: {
      filterArr: [FIELD_TYPE.ORG_MULTI],
    },
    [FIELD_TYPE.ENUM]: {
      filterArr: [FIELD_TYPE.ENUM, FIELD_TYPE.ENUM_MULTI],
      equal: true,
    },
    [FIELD_TYPE.ENUM_MULTI]: {
      filterArr: [FIELD_TYPE.ENUM_MULTI],
      equal: true,
    },
    [FIELD_TYPE.REF]: {
      filterArr: [FIELD_TYPE.REF, FIELD_TYPE.REF_MULTI],
      equal: true,
    },
    [FIELD_TYPE.REF_MULTI]: {
      filterArr: [FIELD_TYPE.REF_MULTI],
      equal: true,
    },
    [FIELD_TYPE.RDO_REF]: {
      filterArr: [FIELD_TYPE.RDO_REF],
      equal: true,
    },
    [FIELD_TYPE.ESOP]: {
      filterArr: [FIELD_TYPE.ESOP],
    },
    [FIELD_TYPE.TRANSACTION]: {
      filterArr: [FIELD_TYPE.TRANSACTION],
    },
    [FIELD_TYPE.LABEL_TEMPLATE_REF]: {
      filterArr: [FIELD_TYPE.LABEL_TEMPLATE_REF],
    },
    [FIELD_TYPE.DOCUMENT_TEMPLATE]: {
      filterArr: [FIELD_TYPE.DOCUMENT_TEMPLATE],
    },
    [FIELD_TYPE.SERIALRULE]: {
      filterArr: [FIELD_TYPE.SERIALRULE],
    },
    [FIELD_TYPE.PRINTER]: {
      filterArr: [FIELD_TYPE.PRINTER],
    },
    [FIELD_TYPE.MESSAGE_TMPL]: {
      filterArr: [FIELD_TYPE.MESSAGE_TMPL],
    },
    [FIELD_TYPE.RANGE_USER]: {
      filterArr: [FIELD_TYPE.RANGE_USER],
    },
    // [FIELD_TYPE.SIGNATURE]: {
    //   filterArr: [FIELD_TYPE.SIGNATURE],
    // },
    [FIELD_TYPE.ONLINE_FORM_TEMPLATE]: {
      filterArr: [FIELD_TYPE.ONLINE_FORM_TEMPLATE],
    },
    [FIELD_TYPE.E_DHR_TEMPLATE]: {
      filterArr: [FIELD_TYPE.E_DHR_TEMPLATE],
    },
    // [FIELD_TYPE.ONLINE_FORM]: {
    //   filterArr: [FIELD_TYPE.ONLINE_FORM],
    // },
  }[fieldType];
};

// pad 端支持表格行编辑的字段类型
export const padVTableSupportEditFieldTypes = [
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
  FIELD_TYPE.USER,
  FIELD_TYPE.USER_MULTI,
  FIELD_TYPE.SERIAL,
];
