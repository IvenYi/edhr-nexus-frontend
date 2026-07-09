import { FIELD_TYPE, CreateType } from '/@/enums/appEnum';
import { BasicColumn } from '/@/components/Table';
import { useI18n } from '/@/hooks/web/useI18n';
import { EntityModelTypeEnum } from '/@app-designer/enum';
import { DataTemplateEnum } from '../type';

const { t } = useI18n();

export const dataTemplateColumns: BasicColumn[] = [
  {
    dataIndex: 'index',
    title: t('sys.index'),
    width: 72,
  },
  {
    dataIndex: 'name',
    title: '模板名称',
    align: 'left',
  },
  {
    dataIndex: 'key',
    title: '模板KEY',
    align: 'left',
  },
  {
    dataIndex: 'type',
    title: '模板类型',
    align: 'left',
  },
  {
    dataIndex: 'createUserName',
    title: t('sys.createUser'),
    align: 'left',
  },
  {
    dataIndex: 'createTime',
    title: t('sys.createTime'),
    align: 'left',
    minWidth: 170,
    width: 170,
  },
  {
    dataIndex: 'modifyUserName',
    title: t('sys.modifier'),
    align: 'left',
  },
  {
    dataIndex: 'modifyTime',
    title: t('sys.modifyTime'),
    align: 'left',
    minWidth: 170,
    width: 170,
  },
  {
    dataIndex: 'actions',
    title: t('sys.operation'),
    fixed: 'right',
    width: 180,
    align: 'left',
  },
];

export const COLUMN_FIELD = {
  id: '',
  aliasName: '',
  name: '',
  key: '',
  mappingType: '',
  type: '',
  createType: '',
  bindInfo: '',
  // numberFormats: [],
  // relationColumns: [],
  modelKey: '',
  // numberExportFormat: {
  //   currency: 0,
  //   exportFormat: 0,
  //   time: 0,
  // },
  checked: false,
  disabled: false,
  required: false,
  width: 200,
  slots: {
    header: 'header',
  },
};

export const PickKeys = [
  'id',
  'aliasName',
  'name',
  'key',
  'type',
  'createType',
  'modelKey',
  'mappingType',
  'required',
  'notNeedRequired',
  'bindInfo',
  'disabled',
];

export const USER_CONFIG_OPTS = [
  {
    id: 'fullname',
    key: 'fullname',
    name: t('sys.fullname'),
    type: 'string',
  },
  {
    id: 'username',
    key: 'username',
    name: t('sys.userName'),
    type: 'string',
  },
  {
    id: 'empNo',
    key: 'empNo',
    name: t('sys.empNo'),
    type: 'string',
  },
  {
    id: 'mobile',
    key: 'mobile',
    name: t('sys.mobile'),
    type: 'string',
  },
  {
    id: 'email',
    key: 'email',
    name: t('sys.email'),
    type: 'string',
  },
];

export const EXPORT_NUM_TYPE = [
  {
    value: 0,
    label: t('sys.pageDesigner.bindCmpStyle.bindNumber'),
    default: true,
  },
  {
    value: 1,
    label: t('sys.pageDesigner.bindCmpStyle.bindCurrency'),
  },
  {
    value: 2,
    label: t('sys.pageDesigner.bindCmpStyle.bindTime'),
  },
];

export const CURRENCY_OPTIONS = [
  {
    value: 0,
    label: t('sys.pageDesigner.chMoney'),
    default: true,
  },
  {
    value: 1,
    label: t('sys.pageDesigner.usMoney'),
  },
  {
    value: 2,
    label: t('sys.pageDesigner.sgpMoney'),
  },
];

export const TIME_OPTIONS = [
  {
    value: 0,
    label: t('sys.component.time.days'),
  },
  {
    value: 1,
    label: `${t('sys.component.time.days')} : ${t('sys.component.time.hour')}`,
  },
  {
    value: 2,
    label: `${t('sys.component.time.days')} : ${t('sys.component.time.hour')} : ${t(
      'sys.component.time.minute',
    )}`,
  },
  {
    value: 3,
    label: `${t('sys.component.time.days')} : ${t('sys.component.time.hour')} : ${t(
      'sys.component.time.minute',
    )} : ${t('sys.component.time.seconds')}`,
    default: true,
  },
  {
    value: 4,
    label: t('sys.component.time.hour'),
  },
  {
    value: 5,
    label: `${t('sys.component.time.hour')} : ${t('sys.component.time.minute')}`,
  },
  {
    value: 6,
    label: `${t('sys.component.time.hour')} : ${t('sys.component.time.minute')} : ${t(
      'sys.component.time.seconds',
    )}`,
  },
  {
    value: 7,
    label: t('sys.component.time.minute'),
  },
  {
    value: 8,
    label: `${t('sys.component.time.minute')} : ${t('sys.component.time.seconds')}`,
  },
  {
    value: 9,
    label: `${t('sys.component.time.seconds')}`,
  },
];

export const DATE_TIME_SEPARATOR = [
  {
    label: '-',
    value: '-',
    default: true,
  },
  {
    label: '/',
    value: '/',
  },
  {
    label: '.',
    value: '.',
  },
];

export const DATE_TIME_OPTIONS = {
  [FIELD_TYPE.DATE]: {
    '-': [
      { value: 0, label: 'yyyy' },
      { value: 1, label: 'yyyy-MM' },
      { value: 2, label: 'yyyy-MM-dd', default: true },
    ],
    '/': [
      { value: 0, label: 'yyyy' },
      { value: 3, label: 'yyyy/MM' },
      { value: 4, label: 'yyyy/MM/dd', default: true },
    ],
    '.': [
      { value: 0, label: 'yyyy' },
      { value: 5, label: 'yyyy.MM' },
      { value: 6, label: 'yyyy.MM.dd', default: true },
    ],
  },
  [FIELD_TYPE.DATE_TIME]: {
    '-': [
      { value: 0, label: 'yyyy-MM-dd HH' },
      { value: 1, label: 'yyyy-MM-dd HH:mm' },
      { value: 2, label: 'yyyy-MM-dd HH:mm:ss', default: true },
    ],
    '/': [
      { value: 3, label: 'yyyy/MM/dd HH' },
      { value: 4, label: 'yyyy/MM/dd HH:mm' },
      { value: 5, label: 'yyyy/MM/dd HH:mm:ss', default: true },
    ],
    '.': [
      { value: 6, label: 'yyyy.MM.dd HH' },
      { value: 7, label: 'yyyy.MM.dd HH:mm' },
      { value: 8, label: 'yyyy.MM.dd HH:mm:ss', default: true },
    ],
  },
  [FIELD_TYPE.TIME]: {
    0: [
      { value: 0, label: 'HH' },
      { value: 1, label: 'HH:mm' },
      { value: 2, label: 'HH:mm:ss', default: true },
    ],
  },
};

export const COMMON_FIELD = [
  FIELD_TYPE.TEXT,
  FIELD_TYPE.LONG_TEXT,
  FIELD_TYPE.INTEGER,
  FIELD_TYPE.LONG,
  FIELD_TYPE.DECIMAL,
  FIELD_TYPE.DOUBLE,
  FIELD_TYPE.DATE,
  FIELD_TYPE.TIME,
  FIELD_TYPE.DATE_TIME,
  FIELD_TYPE.IMAGE,
  FIELD_TYPE.ATTACHMENT,
  FIELD_TYPE.BOOLEAN,
  FIELD_TYPE.USER,
  FIELD_TYPE.USER_MULTI,
  FIELD_TYPE.ORG,
  FIELD_TYPE.ORG_MULTI,
  FIELD_TYPE.ENUM,
  FIELD_TYPE.ENUM_MULTI,
  FIELD_TYPE.REF,
  FIELD_TYPE.REF_MULTI,
  FIELD_TYPE.RDO_REF,
  FIELD_TYPE.ESOP,
  FIELD_TYPE.TRANSACTION,
  FIELD_TYPE.ONLINE_FORM_TEMPLATE,
  FIELD_TYPE.E_DHR_TEMPLATE,
];

export const IMPORT_MODEL_FIELD = [...COMMON_FIELD];

export const DYN_FORM_FIELD_BUILTIN = [
  'name_',
  'ref_master_id_',
  'type_',
  'validate_range_',
  'max_int_',
  'min_int_',
  'max_decimal_',
  'min_decimal_',
  'digits_',
  'true_text_',
  'false_text_',
  'validate_true_',
  'validate_false_',
  'model_object_',
  'options_',
  'pattern_',
  'regex_',
  'required_',
  'default_value_',
  'value_',
  'show_type_',
  'tip_text_',
  'int_value_',
  'double_value_',
  'text_value_',
  'bool_value_',
  'user_value_',
  'org_value_',
  'date_value_',
  'date_time_value_',
  'image_value_',
];

export const EXPORT_MODEL_FIELD = [
  ...COMMON_FIELD,
  FIELD_TYPE.AGG,
  FIELD_TYPE.EXPRESSION,
  FIELD_TYPE.SERIAL,
];

export const EXPORT_FIELD_SYS = [
  'id_',
  'tenant_id_',
  'create_time_',
  'create_user_id_',
  'create_org_id_',
  'modify_time_',
  'modify_user_id_',
  'modify_org_id_',
];

export const EXPORT_VIEW_FIELD = [
  FIELD_TYPE.TEXT,
  FIELD_TYPE.LONG_TEXT,
  FIELD_TYPE.INTEGER,
  FIELD_TYPE.LONG,
  FIELD_TYPE.DECIMAL,
  FIELD_TYPE.DOUBLE,
  FIELD_TYPE.DATE,
  FIELD_TYPE.TIME,
  FIELD_TYPE.DATE_TIME,
  FIELD_TYPE.IMAGE,
  FIELD_TYPE.ATTACHMENT,
  FIELD_TYPE.BOOLEAN,
  FIELD_TYPE.USER,
  FIELD_TYPE.USER_MULTI,
  FIELD_TYPE.ORG,
  FIELD_TYPE.ORG_MULTI,
  FIELD_TYPE.ENUM,
  FIELD_TYPE.ENUM_MULTI,
  FIELD_TYPE.REF,
  FIELD_TYPE.REF_MULTI,
  FIELD_TYPE.RDO_REF,
  FIELD_TYPE.AGG,
  FIELD_TYPE.EXPRESSION,
  FIELD_TYPE.SERIAL,
];

export const TEMPLATE_MODEL_MAPPING = {
  [DataTemplateEnum.IMPORT]: {
    [EntityModelTypeEnum.BASE]: {
      fields: {
        [CreateType.USER_DEFINED]: IMPORT_MODEL_FIELD,
        [CreateType.BUILTIN]: IMPORT_MODEL_FIELD,
      },
    },
    [EntityModelTypeEnum.NDO]: {
      fields: {
        [CreateType.USER_DEFINED]: IMPORT_MODEL_FIELD,
        [CreateType.BUILTIN]: [...IMPORT_MODEL_FIELD, 'name_', 'description_'],
        // [CreateType.BUILTIN]: ['name_', 'description_'],
      },
      disabled: {
        [CreateType.BUILTIN]: ['name_'],
      },
    },
    [EntityModelTypeEnum.RDO]: {
      fields: {
        [CreateType.USER_DEFINED]: IMPORT_MODEL_FIELD,
        // [CreateType.BUILTIN]: ['name_', 'version_', 'default_', 'description_'],
        [CreateType.BUILTIN]: [
          ...IMPORT_MODEL_FIELD,
          'name_',
          'version_',
          'default_',
          'description_',
        ],
      },
      disabled: {
        [CreateType.BUILTIN]: ['version_', 'default_'],
      },
    },
    [EntityModelTypeEnum.TREE]: {
      fields: {
        [CreateType.USER_DEFINED]: IMPORT_MODEL_FIELD,
        [CreateType.BUILTIN]: [...IMPORT_MODEL_FIELD, 'parent_id_'],
        // [CreateType.BUILTIN]: ['parent_id_'],
      },
    },
    [EntityModelTypeEnum.DYNAMIC_FORM]: {
      fields: {
        [CreateType.USER_DEFINED]: IMPORT_MODEL_FIELD,
        [CreateType.BUILTIN]: [
          ...IMPORT_MODEL_FIELD,
          FIELD_TYPE.PRIMARY_KEY,
          ...DYN_FORM_FIELD_BUILTIN,
        ],
        // [CreateType.BUILTIN]: DYN_FORM_FIELD_BUILTIN,
      },
    },
    // 这里写死不使用枚举！！！
    CHECK_LIST: {
      fields: {
        [CreateType.USER_DEFINED]: IMPORT_MODEL_FIELD,
        [CreateType.BUILTIN]: [
          ...IMPORT_MODEL_FIELD,
          FIELD_TYPE.PRIMARY_KEY,
          ...DYN_FORM_FIELD_BUILTIN,
        ],
      },
    },
  },
  [DataTemplateEnum.EXPORT]: {
    [EntityModelTypeEnum.BASE]: {
      fields: {
        [CreateType.USER_DEFINED]: EXPORT_MODEL_FIELD,
        [CreateType.BUILTIN]: EXPORT_MODEL_FIELD,
        [CreateType.SYSTEM]: EXPORT_FIELD_SYS,
      },
    },
    [EntityModelTypeEnum.NDO]: {
      fields: {
        [CreateType.USER_DEFINED]: EXPORT_MODEL_FIELD,
        [CreateType.BUILTIN]: [...EXPORT_MODEL_FIELD, 'name_', 'description_'],
        // [CreateType.BUILTIN]: ['name_', 'description_'],
        [CreateType.SYSTEM]: EXPORT_FIELD_SYS,
      },
    },
    [EntityModelTypeEnum.RDO]: {
      fields: {
        [CreateType.USER_DEFINED]: EXPORT_MODEL_FIELD,
        [CreateType.BUILTIN]: [
          ...EXPORT_MODEL_FIELD,
          'name_',
          'version_',
          'default_',
          'description_',
        ],
        // [CreateType.BUILTIN]: ['name_', 'version_', 'default_', 'description_'],
        [CreateType.SYSTEM]: EXPORT_FIELD_SYS,
      },
    },
    [EntityModelTypeEnum.TREE]: {
      fields: {
        [CreateType.USER_DEFINED]: EXPORT_MODEL_FIELD,
        [CreateType.BUILTIN]: [...EXPORT_MODEL_FIELD, 'parent_id_'],
        // [CreateType.BUILTIN]: ['parent_id_'],
        [CreateType.SYSTEM]: EXPORT_FIELD_SYS,
      },
    },
    [EntityModelTypeEnum.DYNAMIC_FORM]: {
      fields: {
        [CreateType.USER_DEFINED]: EXPORT_MODEL_FIELD,
        [CreateType.BUILTIN]: [...EXPORT_MODEL_FIELD, FIELD_TYPE.PRIMARY_KEY],
        [CreateType.SYSTEM]: EXPORT_FIELD_SYS,
      },
    },
    // 这里写死不使用枚举！！！
    CHECK_LIST: {
      fields: {
        [CreateType.USER_DEFINED]: EXPORT_MODEL_FIELD,
        [CreateType.BUILTIN]: [...EXPORT_MODEL_FIELD, FIELD_TYPE.PRIMARY_KEY],
        [CreateType.SYSTEM]: EXPORT_FIELD_SYS,
      },
    },
    ['QUERY']: {
      fields: EXPORT_VIEW_FIELD,
    },
  },
};
