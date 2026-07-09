import { isEmpty } from 'lodash-es';
import { FIELD_TYPE } from '/@/enums/appEnum';
import { BindCmpStyleEnum, RangeValidateMode } from '@gct/nocode-base';

/** 动态表单类型枚举 */
enum DYN_F_TYPE {
  /** 布尔值 */
  Boolean = 'boolean',
  /** 精度小数 */
  Decimal = 'decimal',
  /** 整数 */
  Integer = 'integer',
  /** 字符串 */
  String = 'string',
  /** 暂时注释 模型对象 */
  // object = 'object',
  /** 人员 */
  User = 'user',
  /** 部门 */
  Org = 'org',
  /** 日期 */
  Date = 'date',
  /** 日期时间 */
  Date_time = 'date_time',
  /** 图片 */
  Image = 'image',
}

/** 显示方式类型枚举 */
enum DYN_DISPLAY_TYPE {
  /** 单行文本 */
  Input = 'input',
  /** 多行文本 */
  TEXTAREA = 'textarea',  
  /** 多选 */
  Checkbox = 'checkbox',
  /** 单选 */
  Radio = 'radio',
  /** 下拉选择 */
  Select = 'select',
}

const basicAttrsUtils = {
  required: [
    {
      from: 'required_',
      to: 'newSpecificConfig.newRequired',
      transform: (value) => Boolean(value),
    },
    {
      from: '_',
      to: 'newSpecificConfig.newFieldName',
      transform: (value) => '值',
    },
    {
      from: '_',
      to: 'newSpecificConfig.newModelName',
      transform: (value, fieldType: FIELD_TYPE, rowFormData, widgetProps) => {
        return widgetProps?.tempModelName;
      },
    },
  ],
  placeholder: [
    {
      from: 'tip_text_',
      to: 'placeholder',
    },
  ],
  showType: [
    {
      from: 'show_type_',
      to: 'bindCompStyleType', // 显示方式 单行文本 下拉列表框
      transform: (value) => {
        if (value === DYN_DISPLAY_TYPE.Select) {
          return BindCmpStyleEnum.CMP_SELECT_LIST;
        }

        if (value === DYN_DISPLAY_TYPE.Radio) {
          return BindCmpStyleEnum.CMP_RADIO;
        }

        if (value === DYN_DISPLAY_TYPE.Checkbox) {
          return BindCmpStyleEnum.CMP_CHECKBOX;
        }
        if (value === DYN_DISPLAY_TYPE.TEXTAREA) {
          return BindCmpStyleEnum.CMP_TEXTAREA;
        }
        return BindCmpStyleEnum.CMP_TEXT;
      },
    },
  ],
  options: [
    {
      from: 'options_',
      to: 'optionString',
    },
  ],
  pattern: [
    {
      from: '_',
      to: 'enableCustomFormat',
      transform: (value, fieldType: FIELD_TYPE, rowFormData) => {
        return !isEmpty(rowFormData.pattern_);
      },
    },
    {
      from: 'pattern_',
      to: 'customFormat',
    },
    {
      from: '_',
      to: 'format',
      transform: (value, fieldType: FIELD_TYPE) => {
        if (fieldType === FIELD_TYPE.DATE) {
          return 'YYYY-MM-DD';
        } else if (fieldType === FIELD_TYPE.DATE_TIME) {
          return 'YYYY-MM-DD HH:mm:ss';
        }
      },
    },
    {
      from: '_',
      to: 'dateType',
      transform: (value, fieldType: FIELD_TYPE) => {
        if (fieldType === FIELD_TYPE.DATE) {
          return 'YYYY-MM-DD';
        } else if (fieldType === FIELD_TYPE.DATE_TIME) {
          return 'YYYY-MM-DD HH:mm:ss';
        }
      },
    },
  ],
};

export interface IDynConfig {
  /** 对应接口属性值的key */
  infValKey: string;
  /** 字段类型 */
  fieldType: FIELD_TYPE;
  /** 设置schema prop属性值 */
  attrsTransform: any;
  /** 监听内容属性名 */
  watchs?: string[];
}

type IDynCompUtils = {
  [key in DYN_F_TYPE]: IDynConfig;
};

export const DynCompUtils: IDynCompUtils = {
  [DYN_F_TYPE.String]: {
    infValKey: 'text_value_',
    fieldType: FIELD_TYPE.TEXT,
    attrsTransform: [
      ...basicAttrsUtils.required,
      ...basicAttrsUtils.placeholder,
      ...basicAttrsUtils.showType,
      ...basicAttrsUtils.options,
      {
        from: 'regex_',
        to: 'regex',
      },
    ],
  },
  [DYN_F_TYPE.Integer]: {
    infValKey: 'int_value_',
    fieldType: FIELD_TYPE.INTEGER,
    attrsTransform: [
      ...basicAttrsUtils.required,
      ...basicAttrsUtils.placeholder,
      ...basicAttrsUtils.showType,
      ...basicAttrsUtils.options,
      {
        from: 'validate_range_',
        to: 'enableRangeValidate',
        transform: (value, fieldType: FIELD_TYPE, rowFormData) => rowFormData?.validate_range_,
      },
      {
        from: 'max_int_',
        to: 'maxValue',
        transform: (value, fieldType: FIELD_TYPE, rowFormData) => {
          const _val_ = parseInt(value);
          // 开启上下限校验
          return rowFormData?.validate_range_ && !isNaN(_val_) ? _val_ : undefined;
        },
      },
      {
        from: 'max_int_',
        to: 'maxValidateMode',
        transform: (value, fieldType: FIELD_TYPE, rowFormData) => {
          const _val_ = parseInt(value);
          // 开启上下限校验
          return rowFormData?.validate_range_ && !isNaN(_val_)
            ? RangeValidateMode.Fixed_Number
            : RangeValidateMode.No_Validate;
        },
      },
      {
        from: 'min_int_',
        to: 'minValue',
        transform: (value, fieldType: FIELD_TYPE, rowFormData) => {
          const _val_ = parseInt(value);
          // 开启上下限校验
          return rowFormData?.validate_range_ && !isNaN(_val_) ? _val_ : undefined;
        },
      },
      {
        from: 'min_int_',
        to: 'minValidateMode',
        transform: (value, fieldType: FIELD_TYPE, rowFormData) => {
          const _val_ = parseInt(value);
          // 开启上下限校验
          return rowFormData?.validate_range_ && !isNaN(_val_)
            ? RangeValidateMode.Fixed_Number
            : RangeValidateMode.No_Validate;
        },
      },
    ],
  },
  [DYN_F_TYPE.Decimal]: {
    infValKey: 'double_value_',
    fieldType: FIELD_TYPE.DECIMAL,
    attrsTransform: [
      ...basicAttrsUtils.required,
      ...basicAttrsUtils.placeholder,
      ...basicAttrsUtils.showType,
      ...basicAttrsUtils.options,
      {
        from: 'validate_range_',
        to: 'enableRangeValidate',
        transform: (value, fieldType: FIELD_TYPE, rowFormData) => rowFormData?.validate_range_,
      },
      {
        from: 'max_decimal_',
        to: 'maxValue',
        transform: (value, fieldType: FIELD_TYPE, rowFormData) => {
          const _val_ = parseFloat(value);
          // 开启上下限校验
          return rowFormData?.validate_range_ && !isNaN(_val_) ? _val_ : undefined;
        },
      },

      {
        from: 'max_decimal_',
        to: 'maxValidateMode',
        transform: (value, fieldType: FIELD_TYPE, rowFormData) => {
          const _val_ = parseInt(value);
          // 开启上下限校验
          return rowFormData?.validate_range_ && !isNaN(_val_)
            ? RangeValidateMode.Fixed_Number
            : RangeValidateMode.No_Validate;
        },
      },

      {
        from: 'min_decimal_',
        to: 'minValue',
        transform: (value, fieldType: FIELD_TYPE, rowFormData) => {
          const _val_ = parseFloat(value);
          // 开启上下限校验
          return rowFormData?.validate_range_ && !isNaN(_val_) ? _val_ : undefined;
        },
      },

      {
        from: 'min_decimal_',
        to: 'minValidateMode',
        transform: (value, fieldType: FIELD_TYPE, rowFormData) => {
          const _val_ = parseInt(value);
          // 开启上下限校验
          return rowFormData?.validate_range_ && !isNaN(_val_)
            ? RangeValidateMode.Fixed_Number
            : RangeValidateMode.No_Validate;
        },
      },
      {
        from: 'digits_',
        to: 'newSpecificConfig.newPrecision',
        transform: (value) => {
          const _val_ = parseInt(value);
          return isNaN(_val_) ? undefined : _val_;
        },
      },
    ],
  },
  [DYN_F_TYPE.Boolean]: {
    infValKey: 'bool_value_',
    fieldType: FIELD_TYPE.BOOLEAN,

    attrsTransform: [
      ...basicAttrsUtils.required,
      ...basicAttrsUtils.placeholder,
      ...basicAttrsUtils.showType,
      {
        from: '_',
        to: 'newSpecificConfig.newOptions',
        transform: (value, fieldType: FIELD_TYPE, rowFormData) => {
          return [
            {
              label: rowFormData.true_text_ || '真',
              value: true,
              refFields: [],
              _item: {},
            },
            {
              label: rowFormData.false_text_ || '假',
              value: false,
              refFields: [],
              _item: {},
            },
          ];
        },
      },
      {
        from: 'validate_true_',
        to: 'validateTrue',
      },
      {
        from: 'validate_false_',
        to: 'validateFalse',
      },
    ],
  },
  [DYN_F_TYPE.User]: {
    infValKey: 'user_value_',
    fieldType: FIELD_TYPE.USER,

    attrsTransform: [
      ...basicAttrsUtils.required,
      ...basicAttrsUtils.placeholder,
      {
        from: '_',
        to: 'newSpecificConfig.newOptions',
        transform: (value, fieldType: FIELD_TYPE, rowFormData, widgetProps) => {
          return widgetProps?.tempUserOptions ?? [];
        },
      },
    ],
  },
  [DYN_F_TYPE.Org]: {
    infValKey: 'org_value_',
    fieldType: FIELD_TYPE.ORG,
    attrsTransform: [
      ...basicAttrsUtils.required,
      ...basicAttrsUtils.placeholder,
      {
        from: '_',
        to: 'newSpecificConfig.newOptions',
        transform: (value, fieldType: FIELD_TYPE, rowFormData, widgetProps) => {
          return widgetProps?.tempOrgOptions ?? [];
        },
      },
    ],
  },
  [DYN_F_TYPE.Date]: {
    infValKey: 'date_value_',
    fieldType: FIELD_TYPE.DATE,
    attrsTransform: [
      ...basicAttrsUtils.required,
      ...basicAttrsUtils.placeholder,
      ...basicAttrsUtils.pattern,
    ],
  },
  [DYN_F_TYPE.Date_time]: {
    infValKey: 'date_time_value_',
    fieldType: FIELD_TYPE.DATE_TIME,
    attrsTransform: [
      ...basicAttrsUtils.required,
      ...basicAttrsUtils.placeholder,
      ...basicAttrsUtils.pattern,
    ],
  },
  [DYN_F_TYPE.Image]: {
    infValKey: 'image_value_',
    fieldType: FIELD_TYPE.IMAGE,
    attrsTransform: [...basicAttrsUtils.required, ...basicAttrsUtils.placeholder],
  },
};
