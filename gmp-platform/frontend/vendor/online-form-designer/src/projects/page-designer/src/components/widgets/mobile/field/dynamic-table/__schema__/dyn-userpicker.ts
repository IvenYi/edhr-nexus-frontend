import { FormComponents, BindCmpStyleEnum, CURRENCY_ENUM } from '/@page-designer/enum';
import { Userpicker } from '/@page-designer/types/web';
import formItemProps from './dyn-common';

export default {
  id: '',
  platform: undefined,
  name: '',
  alias: '',
  type: FormComponents.Userpicker,
  icon: '',
  props: {
    clearable: true,
    placeholder: '${sys.chooseText}',
    required: false,
    fieldRequired: false,
    defaultMain: undefined,
    selectType: BindCmpStyleEnum.CMP_DROPDOWN_SELECT,
    enableAutofill: false,
    autofillRules: [],
    ...formItemProps,
    fieldType: undefined,
    enableDepScope: false,
    departmentScope: '',
  },
  style: {},
  events: {},
  formItem: true,
  i18n: {},
} as PartialByKeys<Userpicker, 'platform'>;
