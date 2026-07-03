import { FormComponents, Dependency_ENUM, ASSIGNMENTSTRATEGY_ENUM } from '/@page-designer/enum';
import { UploadFile } from '/@page-designer/types/web';
//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: PartialByKeys<UploadFile, 'platform'> = {
  id: '',
  platform: undefined,
  name: '',
  alias: '',
  type: FormComponents.UploadImage,
  icon: '',
  props: {
    maxSize: 20,
    maxCount: 10,
    template: '',
    dragger: true,
    required: false,
    fieldRequired: false,
    displayMaxNum: 5,
    enableAutofill: false,
    autofillRules: [],
    field: '',
    fieldId: '',
    label: '',
    modelKey: '',
    fieldType: undefined,
    bindModelKey: undefined,
    disabled: false,
    explain: '',
    showExplain: false,
    displayLabelText: true,
    readonly: false,
    fieldReadonly: false,
    notSubmitInHide: true,
    ////显隐配置start
    hidden: false,
    // displayType: DisplayType.CONFIG,
    // displayRule: '',
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
  },
  style: {},
  events: {},
  formItem: true,
  i18n: {},
};
