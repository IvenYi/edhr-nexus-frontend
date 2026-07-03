import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import {
  DisplayType,
  FormComponents,
  PropGroup,
  ASSIGNMENTSTRATEGY_ENUM,
  Dependency_ENUM,
  Platform,
} from '/@page-designer/enum';
import { hiddenButtonProps } from './button-props-func';
import { FIELD_TYPE, MaterialEnum } from '/@/enums/appEnum';
import { padVTableSupportEditFieldTypes } from '../field/form/utils';

export const displayProps: LowCodeWidget.DisplayProps = {
  deviceConnectivity:false,
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
};
const deviceFields = [
  FIELD_TYPE.TEXT,
  FIELD_TYPE.LONG_TEXT,
  FIELD_TYPE.INTEGER,
  FIELD_TYPE.LONG,
  FIELD_TYPE.DOUBLE,
  FIELD_TYPE.DECIMAL,
  FIELD_TYPE.BOOLEAN,
  FIELD_TYPE.DATE,
  FIELD_TYPE.DATE_TIME,
  FIELD_TYPE.MASTERSLAVE,
];
export const displayEditor: LowCodeWidget.PropEditor[] = [
  {
    component: 'dependency-editor',
    name: 'componentDependency',
    label: '',
    group: PropGroup.COMPONENTDEPENDENCY,
    hidden: (widget) => {
      if (widget.materialType === MaterialEnum.MaterialEmbedTableField) {
        return true;
      }
      if (widget.type === FormComponents.Form && widget.preLocation) {
        return true;
      }
      return hiddenButtonProps(widget) || widget.props.field === 'operating_state_';
    },
  },
  {
    component: 'switch-editor',
    name: 'notSubmitInHide',
    label: 'sys.pageDesigner.submitWhenHidden',
    group: PropGroup.FIELD_CONFIG,
    hidden(widget: LowCodeWidget.FieldSchema) {
      return (
        !widget.isField ||
        !widget.props.field ||
        widget.props.bindFieldKey ||
        widget.props.fieldReadonly ||
        widget.materialType === MaterialEnum.cardListFormField ||
        [
          FIELD_TYPE.EXPRESSION_CONDITION,
          FIELD_TYPE.SERIALRULE,
          FIELD_TYPE.LABEL_TEMPLATE,
        ].includes(widget.props.fieldType) ||
        !padVTableSupportEditFieldTypes.includes(widget.props.fieldType)
      );
    },
  },
  {
    component: 'switch-editor',
    name: 'deviceConnectivity',
    label: 'sys.pageDesigner.deviceConnectivity',
    group: PropGroup.FIELD_CONFIG,
    hidden: (widget) => {
      return (
        widget.platform !== Platform.WEB ||
        ![MaterialEnum.MaterialFormField].includes(widget.materialType) ||
        !deviceFields.includes(widget.props.fieldType)
      );
    },
  },
];
