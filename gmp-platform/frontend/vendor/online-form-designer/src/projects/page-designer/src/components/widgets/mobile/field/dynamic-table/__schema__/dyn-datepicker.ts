import { FormComponents, BindCmpStyleEnum, CURRENCY_ENUM } from '/@page-designer/enum';
import { Datepicker } from '/@page-designer/types/web';
import formItemProps from './dyn-common';

export default {
  id: '',
  platform: undefined,
  name: '',
  alias: '',
  type: FormComponents.Datepicker,
  icon: '',
  props: {
    placeholder: '${sys.chooseText}',
    required: false,
    fieldRequired: false,
    clearable: true,
    startDate: '',
    endDate: '',
    separator: '-',
    format: 'YYYY-MM-DD',
    defaultSysDate: undefined,
    range: undefined,
    dateType: 'YYYY-MM-DD',
    ...formItemProps,
  },
  style: {},
  events: {},
  formItem: true,
  i18n: {},
} as PartialByKeys<Datepicker, 'platform'>;
