import { FormComponents, BindCmpStyleEnum } from '/@page-designer/enum';
import { Input } from '/@page-designer/types/web';
import formItemProps from './dyn-common';

export default {
  id: '',
  platform: undefined,
  name: '',
  alias: '',
  type: FormComponents.Input,
  icon: '',
  props: {
    defaultValue: undefined,
    placeholder: '${sys.inputText}',
    required: false,
    fieldRequired: false,
    reg: '',
    regHint: '',
    regSwitch: true,
    getFocus: false,
    clearable: false,
    maxlength: undefined,
    minlength: undefined,
    ...formItemProps,
    bindCompStyleType: BindCmpStyleEnum.CMP_TEXT,
    fieldType: undefined,
    embeddedSearch: true,
  },
  style: {},
  events: {},
  formItem: true,
  i18n: {},
} as PartialByKeys<Input, 'platform'>;
