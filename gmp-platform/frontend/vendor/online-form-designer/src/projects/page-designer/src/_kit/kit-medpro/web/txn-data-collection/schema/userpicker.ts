import {
  FormComponents,
  BindCmpStyleEnum,
  DisplayType,
  Dependency_ENUM,
  ASSIGNMENTSTRATEGY_ENUM,
} from '/@page-designer/enum';
import { Userpicker } from '/@page-designer/types/web';
import { FIELD_TYPE } from '/@/enums/appEnum';

//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: PartialByKeys<Userpicker, 'platform'> = {
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
    field: 'value_',
    fieldId: '',
    label: '',
    modelKey: '',
    fieldType: FIELD_TYPE.USER,
    bindModelKey: undefined,
    disabled: false,
    explain: '',
    showExplain: false,
    displayLabelText: true,
    readonly: false,
    fieldReadonly: false,
    notSubmitInHide: true,
    hidden: false,
    displayType: DisplayType.CONFIG,
    displayRule: '',
    componentDependency: {
      sortDependency: [],
      configDependency: {
        /**隐藏 */
        [Dependency_ENUM.HIDDEN]: {
          expression: '',
        },
        /**只读 */
        [Dependency_ENUM.READONLY]: {
          expression: '',
        },
        /**禁用 */
        [Dependency_ENUM.DISABLED]: {
          expression: '',
        },
        /**必填 */
        [Dependency_ENUM.REQUIRED]: {
          expression: '',
        },
        [Dependency_ENUM.ASSIGNMENT]: {
          expression: '',
          strategy: ASSIGNMENTSTRATEGY_ENUM.alwaysCover,
        },
      },
    },
    enableDepScope: false,
    departmentScope: '',
  },
  style: {},
  events: {},
  formItem: true,
  i18n: {},
};
