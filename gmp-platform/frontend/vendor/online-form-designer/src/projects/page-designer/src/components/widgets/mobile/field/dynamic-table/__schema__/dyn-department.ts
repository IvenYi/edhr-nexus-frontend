import { FormComponents, BindCmpStyleEnum, CURRENCY_ENUM } from '/@page-designer/enum';
import { Department } from '/@page-designer/types/web';
import formItemProps from './dyn-common';

export default {
  id: '',
  platform: undefined,
  name: '',
  alias: '',
  type: FormComponents.Department,
  icon: '',
  props: {
    clearable: true,
    placeholder: '${sys.chooseText}',
    required: false,
    fieldRequired: false,
    defaultMain: undefined,
    selectType: BindCmpStyleEnum.CMP_TREE_SELECTION,
    enableAutofill: false,
    autofillRules: [],
    ...formItemProps,
    fieldType: undefined,
  },
  style: {},
  events: {},
  formItem: true,
  i18n: {},
} as PartialByKeys<Department, 'platform'>;
