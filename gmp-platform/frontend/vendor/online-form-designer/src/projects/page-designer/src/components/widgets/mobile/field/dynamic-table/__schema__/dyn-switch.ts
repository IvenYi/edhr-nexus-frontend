import { FormComponents, BindCmpStyleEnum } from '/@page-designer/enum';
import { Switch } from '/@page-designer/types/web';
import formItemProps from './dyn-common';

export default {
  id: '',
  platform: undefined,
  name: '',
  alias: '',
  type: FormComponents.Switch,
  icon: '',
  props: {
    defaultValue: undefined,
    ...formItemProps,
    bindCompStyleType: BindCmpStyleEnum.CMP_RADIO,
    embeddedSearch: true,
  },
  style: {},
  events: {},
  formItem: true,
  i18n: {},
} as PartialByKeys<Switch, 'platform'>;
