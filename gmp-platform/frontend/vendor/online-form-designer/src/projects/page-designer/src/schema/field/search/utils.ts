import { FIELD_TYPE } from '@/enums/appEnum';
import { SearchComponents } from '/@page-designer/enum';
import { SEARCH_TYPE } from '/@page-designer/schema/common';

export const basicSearchAttrsUtils = {
  ope: [
    {
      from: 'fieldType',
      to: 'ope',
      transform: (value: FIELD_TYPE) => {
        return [...(SEARCH_TYPE[value!]?.default || [])];
      },
    },
  ],
};

export const transformField2SearchComponent = (fieldType: FIELD_TYPE) => {
  return {
    [FIELD_TYPE.PRIMARY_KEY]: {
      searchCmpKey: SearchComponents.SearchInput,
      attrsTransform: [],
    },
    [FIELD_TYPE.ASSOCIATED_PRIMARY_KEY]: {
      searchCmpKey: SearchComponents.SearchSelect,
      attrsTransform: [],
    },
    [FIELD_TYPE.TEXT]: {
      searchCmpKey: SearchComponents.SearchInput,
      attrsTransform: [],
    },
    [FIELD_TYPE.LONG_TEXT]: {
      searchCmpKey: SearchComponents.SearchInput,
      attrsTransform: [],
    },
    [FIELD_TYPE.SERIAL]: {
      searchCmpKey: SearchComponents.SearchInput,
      attrsTransform: [],
    },
    [FIELD_TYPE.DATE]: {
      searchCmpKey: SearchComponents.SearchDate,
      attrsTransform: [],
    },
    [FIELD_TYPE.DATE_TIME]: {
      searchCmpKey: SearchComponents.SearchDateTime,
      attrsTransform: [],
    },
    [FIELD_TYPE.TIME]: {
      searchCmpKey: SearchComponents.SearchTime,
      attrsTransform: [],
    },
    [FIELD_TYPE.INTEGER]: {
      searchCmpKey: SearchComponents.SearchNumberInput,
      attrsTransform: [],
    },
    [FIELD_TYPE.DOUBLE]: {
      searchCmpKey: SearchComponents.SearchStringNumberInput,
      attrsTransform: [],
    },
    [FIELD_TYPE.LONG]: {
      searchCmpKey: SearchComponents.SearchNumberInput,
      attrsTransform: [],
    },
    [FIELD_TYPE.DECIMAL]: {
      searchCmpKey: SearchComponents.SearchStringNumberInput,
      attrsTransform: [],
    },
    [FIELD_TYPE.BOOLEAN]: {
      searchCmpKey: SearchComponents.SearchSwitch,
      attrsTransform: [],
    },
    [FIELD_TYPE.ENUM]: {
      searchCmpKey: SearchComponents.SearchSelect,
      attrsTransform: [],
    },
    [FIELD_TYPE.ENUM_MULTI]: {
      searchCmpKey: SearchComponents.SearchSelect,
      attrsTransform: [],
    },
    [FIELD_TYPE.ORG_MULTI]: {
      searchCmpKey: SearchComponents.SearchSelectDepartment,
      attrsTransform: [],
    },
    [FIELD_TYPE.USER_MULTI]: {
      searchCmpKey: SearchComponents.SearchUserSelect,
      attrsTransform: [],
    },
    [FIELD_TYPE.ORG]: {
      searchCmpKey: SearchComponents.SearchSelectDepartment,
      attrsTransform: [],
    },
    [FIELD_TYPE.USER]: {
      searchCmpKey: SearchComponents.SearchUserSelect,
      attrsTransform: [],
    },
    [FIELD_TYPE.REF_MULTI]: {
      searchCmpKey: SearchComponents.SearchSelect,
      attrsTransform: [
        {
          from: 'refModelType',
          to: 'refModelType',
        },
      ],
    },
    [FIELD_TYPE.REF]: {
      searchCmpKey: SearchComponents.SearchSelect,
      attrsTransform: [
        {
          from: 'refModelType',
          to: 'refModelType',
        },
      ],
    },
    [FIELD_TYPE.RDO_REF]: {
      searchCmpKey: SearchComponents.SearchRdoSelect,
      attrsTransform: [],
    },
    [FIELD_TYPE.TRANSACTION]: {
      searchCmpKey: SearchComponents.SearchTransaction,
      attrsTransform: [],
    },
    [FIELD_TYPE.PRINTER]: {
      searchCmpKey: SearchComponents.SearchPrinter,
      attrsTransform: [],
    },
    [FIELD_TYPE.RANGE_USER]: {
      searchCmpKey: SearchComponents.SearchSelectRangUser,
      attrsTransform: [],
    },
    [FIELD_TYPE.MESSAGE_TMPL]: {
      searchCmpKey: SearchComponents.SearchSelect,
      attrsTransform: [],
    },
    [FIELD_TYPE.LABEL_TEMPLATE_REF]: {
      searchCmpKey: SearchComponents.SearchTmplTreeSelect,
      attrsTransform: [],
    },
    [FIELD_TYPE.DOCUMENT_TEMPLATE]: {
      searchCmpKey: SearchComponents.SearchTmplTreeSelect,
      attrsTransform: [],
    },
    [FIELD_TYPE.ONLINE_FORM_TEMPLATE]: {
      searchCmpKey: SearchComponents.SearchTmplTreeSelect,
      attrsTransform: [],
    },
    [FIELD_TYPE.E_DHR_TEMPLATE]: {
      searchCmpKey: SearchComponents.SearchTmplTreeSelect,
      attrsTransform: [],
    },
    [FIELD_TYPE.Biz_Process]: {
      searchCmpKey: SearchComponents.SearchBizProcess,
      attrsTransform: [],
    },
  }[fieldType];
};
