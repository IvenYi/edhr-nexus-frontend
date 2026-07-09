import { BindCmpStyleEnum, FIELD_TYPE, FormComponents, ReturnTypeEnum } from '../enums';
import { get } from 'lodash-es';

export const basicAttrsUtils = {
  required: [
    {
      from: 'required',
      to: 'required',
      transform: (value) => Boolean(value),
    },
    {
      from: 'required',
      to: 'fieldRequired',
      transform: (value) => Boolean(value),
    },
  ],
  readonly: [
    {
      from: '_',
      to: 'readonly',
      transform: () => true,
    },
    {
      from: '_',
      to: 'fieldReadonly',
      transform: () => true,
    },
  ],
  bindFieldKey: [
    {
      from: 'fieldCodeChain',
      to: 'bindFieldKey',
      transform: (value) => {
        try {
          const fieldCodeChainObj = JSON.parse(value);
          if (fieldCodeChainObj) {
            return fieldCodeChainObj.bindFieldKey || '';
          }
        } catch (error) {
          return '';
        }
      },
    },
    {
      from: 'fieldCodeChain',
      to: 'bindFieldLink',
      transform: (value, widget) => {
        try {
          const fieldCodeChainObj = JSON.parse(value);
          if (fieldCodeChainObj) {
            return [...(fieldCodeChainObj.fieldLink || []), widget.key];
          }
        } catch (error) {
          return '';
        }
      },
    },
    {
      from: 'fieldCodeChain',
      to: 'refOriginField',
      transform: (value) => {
        try {
          const fieldCodeChainObj = JSON.parse(value);
          if (fieldCodeChainObj) {
            return (fieldCodeChainObj.fieldLink || []).join('.');
          }
        } catch (error) {
          return '';
        }
      },
    },
    {
      from: 'fieldCodeChain',
      to: 'refOriginModelKey',
      transform: (value) => {
        try {
          const fieldCodeChainObj = JSON.parse(value);
          if (fieldCodeChainObj) {
            return fieldCodeChainObj.modelLink[1];
          }
        } catch (error) {
          return '';
        }
      },
    },
    {
      from: 'fieldCodeChain',
      to: 'refOriginFieldType',
      transform: (value) => {
        try {
          const fieldCodeChainObj = JSON.parse(value);
          if (fieldCodeChainObj) {
            return fieldCodeChainObj.refOriginFieldType;
          }
        } catch (error) {
          return '';
        }
      },
    },
  ],
};

export const transformField2Component = (
  fieldType:
    | FIELD_TYPE
    | 'rdo_input'
    | 'workflow_nodes'
    | 'biz_process'
    | FormComponents.DynamicFormType
    | FormComponents.DynamicFormValue
    | FormComponents.DynamicFormOpts
    | FormComponents.DynamicFormShowType
    | FormComponents.DynamicTable,
) => {
  return {
    [FIELD_TYPE.LABEL_TEMPLATE]: {
      cmpKey: FormComponents.LabelTemplate,
      example: 'sys.pageDesigner.sampleText',
      attrsTransform: [...basicAttrsUtils.required],
    },
    [FIELD_TYPE.LABEL_TEMPLATE_REF]: {
      cmpKey: FormComponents.LabelTemplateRef,
      example: 'sys.pageDesigner.labelTmplOne',
      attrsTransform: [...basicAttrsUtils.required],
    },
    // [FIELD_TYPE.DOCUMENT_TEMPLATE]: {
    //   cmpKey: FormComponents.DocumentTemplate,
    //   example: 'sys.pageDesigner.documentTmplOne',
    //   attrsTransform: [...basicAttrsUtils.required],
    // },
    [FIELD_TYPE.ASSOCIATED_PRIMARY_KEY]: {
      cmpKey: FormComponents.Select,
      example: '0001',
      attrsTransform: [...basicAttrsUtils.readonly],
    },
    [FIELD_TYPE.PRIMARY_KEY]: {
      cmpKey: FormComponents.ReadonlyCmp,
      example: '0001',
    },
    [ReturnTypeEnum.Number]: {
      example: '1,234',
    },
    [ReturnTypeEnum.String]: {
      example: 'sys.pageDesigner.sampleText',
    },
    [FIELD_TYPE.TEXT]: {
      cmpKey: FormComponents.Input,
      attrsTransform: [
        ...basicAttrsUtils.required,
        {
          from: 'specificConfig.minValue',
          to: 'minlength',
        },
        {
          from: 'specificConfig.maxValue',
          to: 'maxlength',
        },
      ],
      example: 'sys.pageDesigner.sampleText',
    },
    [FIELD_TYPE.LONG_TEXT]: {
      cmpKey: FormComponents.Textarea,
      attrsTransform: [
        ...basicAttrsUtils.required,
        {
          from: 'specificConfig.minValue',
          to: 'minlength',
        },
        {
          from: 'specificConfig.maxValue',
          to: 'maxlength',
        },
      ],
      example: 'sys.pageDesigner.sampleText',
    },
    [FIELD_TYPE.INTEGER]: {
      cmpKey: FormComponents.Inputnumber,
      attrsTransform: [
        ...basicAttrsUtils.required,
        {
          from: 'specificConfig.minValue',
          to: 'minValue',
        },
        {
          from: 'specificConfig.maxValue',
          to: 'maxValue',
        },
      ],
      example: '1,234',
    },
    [FIELD_TYPE.LONG]: {
      cmpKey: FormComponents.Inputnumber,
      attrsTransform: [
        ...basicAttrsUtils.required,
        {
          from: 'specificConfig.minValue',
          to: 'minValue',
        },
        {
          from: 'specificConfig.maxValue',
          to: 'maxValue',
        },
      ],
      example: '1,234',
    },

    [FIELD_TYPE.DOUBLE]: {
      cmpKey: FormComponents.InputDouble,
      attrsTransform: [
        ...basicAttrsUtils.required,
        {
          from: 'specificConfig.minValue',
          to: 'minValue',
        },
        {
          from: 'specificConfig.maxValue',
          to: 'maxValue',
        },
      ],
      example: '1,234.56',
    },

    [FIELD_TYPE.DECIMAL]: {
      cmpKey: FormComponents.Inputnumber,
      attrsTransform: [
        {
          from: 'specificConfig.digits',
          to: 'precision',
        },
        ...basicAttrsUtils.required,
        {
          from: 'specificConfig.minValue',
          to: 'minValue',
        },
        {
          from: 'specificConfig.maxValue',
          to: 'maxValue',
        },
      ],
      example: '1,234.56',
    },
    [FIELD_TYPE.BOOLEAN]: {
      cmpKey: FormComponents.Switch,
      attrsTransform: [],
      example: ['sys.pageDesigner.sampleTrue', 'sys.pageDesigner.sampleFalse'],
    },
    [FIELD_TYPE.SERIAL]: {
      cmpKey: FormComponents.ReadonlyCmp,
      attrsTransform: [...basicAttrsUtils.readonly],
      example: '0001',
    },
    [FIELD_TYPE.IMAGE]: {
      cmpKey: FormComponents.UploadImage,
      attrsTransform: [...basicAttrsUtils.required],
    },
    [FIELD_TYPE.ATTACHMENT]: {
      cmpKey: FormComponents.UploadFile,
      attrsTransform: [...basicAttrsUtils.required],
      example: '',
    },
    [FIELD_TYPE.USER]: {
      cmpKey: FormComponents.Userpicker,
      attrsTransform: [...basicAttrsUtils.required],
      example: 'sys.pageDesigner.sampleUserOne',
    },
    [FIELD_TYPE.USER_MULTI]: {
      cmpKey: FormComponents.Userpicker,
      attrsTransform: [...basicAttrsUtils.required],
      // styleTransform: [
      //   {
      //     from: 'tagStyleOpen',
      //     to: 'tagStyleOpen',
      //     transform: () => true,
      //   },
      //   {
      //     from: 'tagStyle',
      //     to: 'tagStyle',
      //     transform: () => tagStyle,
      //   },
      // ],
      example: ['sys.pageDesigner.sampleUserOne', 'sys.pageDesigner.sampleUserTwo'],
    },
    [FIELD_TYPE.ORG]: {
      cmpKey: FormComponents.Department,
      attrsTransform: [...basicAttrsUtils.required],
      example: 'sys.pageDesigner.sampleDeptOne',
    },
    [FIELD_TYPE.ORG_MULTI]: {
      cmpKey: FormComponents.Department,
      attrsTransform: [...basicAttrsUtils.required],
      // styleTransform: [
      //   {
      //     from: 'tagStyleOpen',
      //     to: 'tagStyleOpen',
      //     transform: () => true,
      //   },
      //   {
      //     from: 'tagStyle',
      //     to: 'tagStyle',
      //     transform: () => tagStyle,
      //   },
      // ],
      example: ['sys.pageDesigner.sampleDeptOne', 'sys.pageDesigner.sampleDeptTwo'],
    },
    [FIELD_TYPE.ENUM]: {
      cmpKey: FormComponents.Select,
      attrsTransform: [...basicAttrsUtils.required],
      example: 'sys.pageDesigner.sampleEnumOne',
      exampleOptions: ['sys.pageDesigner.sampleEnumOne', 'sys.pageDesigner.sampleEnumTwo'],
    },
    [FIELD_TYPE.ENUM_MULTI]: {
      cmpKey: FormComponents.Select,
      attrsTransform: [
        ...basicAttrsUtils.required,
        {
          from: '_',
          to: 'multiple',
          transform: () => true,
        },
      ],
      // styleTransform: [
      //   {
      //     from: 'tagStyleOpen',
      //     to: 'tagStyleOpen',
      //     transform: () => true,
      //   },
      //   {
      //     from: 'tagStyle',
      //     to: 'tagStyle',
      //     transform: () => tagStyle,
      //   },
      // ],
      example: ['sys.pageDesigner.sampleEnumOne', 'sys.pageDesigner.sampleEnumTwo'],
      exampleOptions: ['sys.pageDesigner.sampleEnumOne', 'sys.pageDesigner.sampleEnumTwo'],
    },
    [FIELD_TYPE.REF]: {
      cmpKey: FormComponents.Select,
      attrsTransform: [
        ...basicAttrsUtils.required,
        {
          from: 'refModelType',
          to: 'refModelType',
        },
      ],
      example: 'sys.pageDesigner.sampleMastersonOne',
      exampleOptions: [
        'sys.pageDesigner.sampleMastersonOne',
        'sys.pageDesigner.sampleMastersonTwo',
      ],
    },
    [FIELD_TYPE.REF_MULTI]: {
      cmpKey: FormComponents.Select,
      attrsTransform: [
        ...basicAttrsUtils.required,
        {
          from: '_',
          to: 'multiple',
          transform: () => true,
        },
        {
          from: 'refModelType',
          to: 'refModelType',
        },
      ],
      example: ['sys.pageDesigner.sampleMastersonOne', 'sys.pageDesigner.sampleMastersonTwo'],
      exampleOptions: [
        'sys.pageDesigner.sampleMastersonOne',
        'sys.pageDesigner.sampleMastersonTwo',
      ],
    },
    [FIELD_TYPE.DATE]: {
      cmpKey: FormComponents.Datepicker,
      attrsTransform: [...basicAttrsUtils.required],
      example: '2019-11-07',
    },
    [FIELD_TYPE.DATE_TIME]: {
      cmpKey: FormComponents.DateTimepicker,
      attrsTransform: [...basicAttrsUtils.required],
      example: '2019-11-07 00:00:00',
    },
    [FIELD_TYPE.TIME]: {
      cmpKey: FormComponents.Timepicker,
      attrsTransform: [...basicAttrsUtils.required],
      example: '00:00:00',
    },
    [FIELD_TYPE.RDO_REF]: {
      cmpKey: FormComponents.RdoSelect,
      attrsTransform: [...basicAttrsUtils.required],
      example: 'sys.pageDesigner.sampleRdo',
    },
    [FIELD_TYPE.MASTERSLAVE]: {
      cmpKey: FormComponents.SubTable,
      attrsTransform: [
        ...basicAttrsUtils.required,
        {
          from: 'bindFieldKey',
          to: 'refMasterId',
        },
      ],
      example: 'sys.pageDesigner.sampleDeptRdo',
    },
    [FormComponents.DynamicTable]: {
      cmpKey: FormComponents.DynamicTable,
      attrsTransform: [
        ...basicAttrsUtils.required,
        {
          from: 'bindFieldKey',
          to: 'refMasterId',
        },
      ],
      example: 'sys.pageDesigner.sampleDeptRdo',
    },
    [FIELD_TYPE.EXPRESSION]: {
      cmpKey: FormComponents.EXPRESSION,
      attrsTransform: [
        ...basicAttrsUtils.readonly,
        {
          from: 'mappingType',
          to: 'returnType',
        },
        {
          from: 'mappingType',
          to: 'bindCompStyleType',
          transform: (val) => {
            if (val === 'text') {
              return BindCmpStyleEnum.CMP_TEXT;
            }
            if (val === 'long_text') {
              return BindCmpStyleEnum.CMP_TEXTAREA;
            }
            if (val === 'boolean') {
              return BindCmpStyleEnum.CMP_BOOLEAN;
            }

            if (['integer', 'long', 'decimal'].includes(val)) {
              return BindCmpStyleEnum.CMP_NUMBER;
            }

            return undefined;
          },
        },
        {
          from: 'specificConfig.digits',
          to: 'precision',
        },
        {
          from: 'specificConfig.expRealCompute',
          to: 'isRealCompute',
        },
        {
          from: 'specificConfig.expConfig',
          to: 'ruleConfig',
        },
        {
          from: 'specificConfig.expType',
          to: 'expType',
        },
        {
          from: 'specificConfig.true',
          to: 'truelabel',
        },
        {
          from: 'specificConfig.false',
          to: 'falselabel',
        },
      ],
    },
    [FIELD_TYPE.EXPRESSION_CONDITION]: {
      cmpKey: FormComponents.ExpressionCondition,
      attrsTransform: [...basicAttrsUtils.required],
      example: 'sys.pageDesigner.sampleCondition',
    },
    [FIELD_TYPE.AGG]: {
      cmpKey: FormComponents.AGG,
      attrsTransform: [
        ...basicAttrsUtils.readonly,
        {
          from: 'mappingType',
          to: 'returnType',
        },
        {
          from: 'mappingType',
          to: 'bindCompStyleType',
          transform: (val) => {
            if (['integer', 'long', 'decimal'].includes(val)) {
              return BindCmpStyleEnum.CMP_NUMBER;
            }

            return undefined;
          },
        },
        {
          from: 'mappingType',
          to: 'separator',
          transform: (val) => {
            if (['integer', 'long', 'decimal'].includes(val)) {
              return false;
            }

            if (['date', 'date_time'].includes(val)) {
              return '-';
            }
            return undefined;
          },
        },
        {
          from: 'mappingType',
          to: 'format',
          transform: (val) => {
            if ('date' === val) {
              return 'YYYY-MM-DD';
            }

            if ('date_time' === val) {
              return 'YYYY-MM-DD HH:mm:ss';
            }

            if ('time' === val) {
              return 'HH:mm:ss';
            }
            return undefined;
          },
        },
        {
          from: 'mappingType',
          to: 'dateType',
          transform: (val) => {
            if ('date' === val) {
              return 'YYYY-MM-DD';
            }

            if ('date_time' === val) {
              return 'YYYY-MM-DD HH:mm:ss';
            }
            return undefined;
          },
        },
        {
          from: 'mappingType',
          to: 'timeType',
          transform: (val) => {
            if ('time' === val) {
              return 'HH:mm:ss';
            }
            return undefined;
          },
        },
        {
          from: 'specificConfig.digits',
          to: 'precision',
        },
      ],
    },
    ['rdo_input']: {
      cmpKey: FormComponents.RdoInput,
      attrsTransform: [
        {
          from: '_',
          to: 'fieldId',
          transform: () => 'version_,name_,default_',
        },
      ],
      example: 'sys.pageDesigner.sampleText',
    },
    ['workflow_nodes']: {
      cmpKey: FormComponents.WorkflowNodes,
      attrsTransform: [...basicAttrsUtils.required],
      example: 'sys.pageDesigner.sampleText',
    },
    ['biz_process']: {
      cmpKey: FormComponents.BizProcess,
      attrsTransform: [...basicAttrsUtils.required],
      example: 'sys.pageDesigner.sampleBizProcess',
    },
    ['approval_process']: {
      cmpKey: FormComponents.ApprovalProcess,
      attrsTransform: [...basicAttrsUtils.required],
      example: 'sys.pageDesigner.sampleBizApprovalProcess',
    },
    [FIELD_TYPE.ESOP]: {
      cmpKey: FormComponents.ESOP,
      attrsTransform: [...basicAttrsUtils.required],
    },
    [FIELD_TYPE.TRANSACTION]: {
      cmpKey: FormComponents.Transaction,
      attrsTransform: [...basicAttrsUtils.required],
      example: 'sys.pageDesigner.sampleTransactionOne',
    },
    [FormComponents.DynamicFormType]: {
      cmpKey: FormComponents.DynamicFormType,
      attrsTransform: [
        ...basicAttrsUtils.required,
        {
          from: '_',
          to: 'placeholder',
          transform: () => '${sys.chooseText}',
        },
      ],
    },
    [FormComponents.DynamicFormValue]: {
      cmpKey: FormComponents.DynamicFormValue,
      attrsTransform: [
        ...basicAttrsUtils.required,
        {
          from: '_',
          to: 'placeholder',
          transform: () => '${sys.inputText}',
        },
      ],
    },
    [FormComponents.DynamicFormOpts]: {
      cmpKey: FormComponents.DynamicFormOpts,
      attrsTransform: [...basicAttrsUtils.required],
    },
    [FormComponents.DynamicFormShowType]: {
      cmpKey: FormComponents.DynamicFormShowType,
      attrsTransform: [
        ...basicAttrsUtils.required,
        {
          from: '_',
          to: 'placeholder',
          transform: () => '${sys.chooseText}',
        },
      ],
    },
    [FIELD_TYPE.SERIALRULE]: {
      cmpKey: FormComponents.SerialRule,
      attrsTransform: [...basicAttrsUtils.required],
    },
    [FIELD_TYPE.PRINTER]: {
      cmpKey: FormComponents.Printer,
      attrsTransform: [...basicAttrsUtils.required],
      example: 'sys.pageDesigner.printerOne',
      exampleOptions: ['sys.pageDesigner.printerOne', 'sys.pageDesigner.printerTwo'],
    },
    [FIELD_TYPE.MESSAGE_TMPL]: {
      cmpKey: FormComponents.Select,
      attrsTransform: [...basicAttrsUtils.required],
      example: 'sys.pageDesigner.messageTmplOne',
      exampleOptions: ['sys.pageDesigner.messageTmplOne', 'sys.pageDesigner.messageTmplTwo'],
    },
    [FIELD_TYPE.RANGE_USER]: {
      cmpKey: FormComponents.RangeUser,
      attrsTransform: [...basicAttrsUtils.required],
      example: ['sys.pageDesigner.rangeUserOne', 'sys.pageDesigner.rangeUserTwo'],
      exampleOptions: ['sys.pageDesigner.rangeUserOne', 'sys.pageDesigner.rangeUserTwo'],
    },
    [FIELD_TYPE.SIGNATURE]: {
      cmpKey: FormComponents.Signature,
      attrsTransform: [...basicAttrsUtils.required],
    },
    [FIELD_TYPE.ONLINE_FORM_TEMPLATE]: {
      cmpKey: FormComponents.TmplTreeSelect,
      attrsTransform: [...basicAttrsUtils.required],
      example: 'sys.pageDesigner.onlineFormTmplOne',
      exampleOptions: ['sys.pageDesigner.onlineFormTmplOne', 'sys.pageDesigner.onlineFormTmplTwo'],
    },
    [FIELD_TYPE.E_DHR_TEMPLATE]: {
      cmpKey: FormComponents.TmplTreeSelect,
      attrsTransform: [...basicAttrsUtils.required],
      example: 'sys.pageDesigner.eDhrTmplOne',
      exampleOptions: ['sys.pageDesigner.eDhrTmplOne', 'sys.pageDesigner.eDhrTmplTwo'],
    },
    // [FIELD_TYPE.ONLINE_FORM]: {
    //   cmpKey: FormComponents.OnlineForm,
    //   attrsTransform: [...basicAttrsUtils.required],
    // },
    [FIELD_TYPE.DATA_TABLE_FORMULA]: {
      cmpKey: FormComponents.DataTableFormula,
      attrsTransform: [
        ...basicAttrsUtils.readonly,
        {
          from: 'mappingType',
          to: 'returnType',
        },
        {
          from: 'specificConfig.formulaConfig.exp',
          to: 'formula',
        },
        {
          from: 'specificConfig.formulaConfig.expression',
          to: 'expression',
        },
        {
          from: 'modelKey',
          to: 'model',
        },
        {
          from: 'specificConfig.formulaConfig.showQrCode',
          to: 'showQrCode',
        },
        {
          from: 'specificConfig.formulaConfig.digits',
          to: 'digits',
        },
        {
          from: 'specificConfig.formulaConfig.truelabel',
          to: 'truelabel',
        },
        {
          from: 'specificConfig.formulaConfig.falselabel',
          to: 'falselabel',
        },
      ],
      example: 'sys.pageDesigner.sampleText',
    },
    [FIELD_TYPE.READONLYCMP]: {
      cmpKey: FormComponents.ReadonlyCmp,
      attrsTransform: [...basicAttrsUtils.required],
      example: 'sys.pageDesigner.sampleText',
    },
  }[fieldType];
};

const FieldPropsMap = {
  [FIELD_TYPE.TEXT]: {
    attrsTransform: [
      {
        from: 'specificConfig.minValue',
        to: 'minlength',
      },
      {
        from: 'specificConfig.maxValue',
        to: 'maxlength',
      },
    ],
  },
  [FIELD_TYPE.LONG_TEXT]: {
    attrsTransform: [
      {
        from: 'specificConfig.minValue',
        to: 'minlength',
      },
      {
        from: 'specificConfig.maxValue',
        to: 'maxlength',
      },
    ],
  },
  [FIELD_TYPE.INTEGER]: {
    attrsTransform: [
      {
        from: 'specificConfig.minValue',
        to: 'minValue',
      },
      {
        from: 'specificConfig.maxValue',
        to: 'maxValue',
      },
    ],
  },
  [FIELD_TYPE.LONG]: {
    attrsTransform: [
      {
        from: 'specificConfig.minValue',
        to: 'minValue',
      },
      {
        from: 'specificConfig.maxValue',
        to: 'maxValue',
      },
    ],
  },

  [FIELD_TYPE.DOUBLE]: {
    attrsTransform: [
      {
        from: 'specificConfig.minValue',
        to: 'minValue',
      },
      {
        from: 'specificConfig.maxValue',
        to: 'maxValue',
      },
    ],
  },

  [FIELD_TYPE.DECIMAL]: {
    attrsTransform: [
      {
        from: 'specificConfig.digits',
        to: 'precision',
      },
      {
        from: 'specificConfig.minValue',
        to: 'minValue',
      },
      {
        from: 'specificConfig.maxValue',
        to: 'maxValue',
      },
    ],
  },
};
/**
 * @description: 处理字段属性转换
 * 运行时同步字段
 */
export const transformPropsField = (fieldType: FIELD_TYPE, Props: Object) => {
  const { attrsTransform = [] } = FieldPropsMap[fieldType] || {};
  const attrs = attrsTransform.reduce((curr, row) => {
    const value = get(Props, row.from);
    curr[row.to] = value;
    return curr;
  }, {});
  return attrs;
};
