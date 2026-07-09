import { FormComponents, } from '/@page-designer/enum';
import { UploadFile } from '/@page-designer/types/web';
import formItemProps from './dyn-common';

export default {
  id: '',
  platform: undefined,
  name: '',
  alias: '',
  type: FormComponents.UploadImage,
  icon: '',
  props: {
    required: false,
    fieldRequired: false,
    ...formItemProps,
  },
  style: {},
  events: {},
  formItem: true,
  i18n: {},
} as PartialByKeys<UploadFile, 'platform'>;
