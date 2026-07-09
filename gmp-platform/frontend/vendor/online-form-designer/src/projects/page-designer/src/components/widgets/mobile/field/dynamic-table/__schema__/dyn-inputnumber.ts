import { FormComponents, BindCmpStyleEnum, CURRENCY_ENUM } from '/@page-designer/enum';
import { InputNumber } from '/@page-designer/types/web';
import formItemProps from './dyn-common';

export default {
  id: '',
  platform: undefined,
  name: '',
  alias: '',
  type: FormComponents.Inputnumber,
  icon: '',
  props: {
    ...formItemProps,
    defaultValue: undefined,
    placeholder: '${sys.inputText}',
    required: false,
    fieldRequired: false,
    precision: 0,
    maxValue: undefined,
    minValue: undefined,
    maxValueExpression: '',
    minValueExpression: '',
    getFocus: false,
    clearable: false,
    fieldType: undefined,
    displayCurrency: false,
    separator: false,
    currency: CURRENCY_ENUM['￥'],
    bindCompStyleType: BindCmpStyleEnum.CMP_NUMBER,
  },
  style: {},
  events: {},
  formItem: true,
  i18n: {},
} as PartialByKeys<InputNumber, 'platform'>;
