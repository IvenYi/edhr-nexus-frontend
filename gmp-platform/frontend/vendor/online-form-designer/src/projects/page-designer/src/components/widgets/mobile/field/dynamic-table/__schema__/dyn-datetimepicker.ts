import { FormComponents, BindCmpStyleEnum, CURRENCY_ENUM } from '/@page-designer/enum';
import { DateTimepicker } from '/@page-designer/types/web';
import formItemProps from './dyn-common';

export default {
  id: '',
  platform: undefined,
  name: '',
  alias: '',
  type: FormComponents.DateTimepicker,
  icon: '',
  props: {
    placeholder: '${sys.chooseText}',
    required: false,
    fieldRequired: false,
    clearable: true,
    startDate: '',
    endDate: '',
    separator: '-',
    format: 'YYYY-MM-DD HH:mm:ss',
    defaultSysDate: undefined,
    range: undefined,
    dateType: 'YYYY-MM-DD HH:mm:ss',
    ...formItemProps,
  },
  style: {},
  events: {},
  formItem: true,
  i18n: {},
} as PartialByKeys<DateTimepicker, 'platform'>;
