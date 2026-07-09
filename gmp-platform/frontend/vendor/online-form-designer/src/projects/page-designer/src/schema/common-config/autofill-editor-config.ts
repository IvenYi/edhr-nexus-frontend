import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { PropGroup } from '/@page-designer/enum';
import { FIELD_TYPE } from '@/enums/appEnum';

const SHOW_FIELD_TYPE = [
  FIELD_TYPE.REF,
  FIELD_TYPE.USER,
  FIELD_TYPE.ORG,
  FIELD_TYPE.RDO_REF,
  FIELD_TYPE.ATTACHMENT,
  FIELD_TYPE.ESOP,
];

const getAutofillEditor = ({ groupName }: { groupName: PropGroup }): LowCodeWidget.PropEditor[] => {
  return [
    {
      component: 'switch-editor',
      name: 'enableAutofill',
      label: 'sys.pageDesigner.dataFill',
      group: groupName,
      hidden: (widget) => {
        if (widget.props.bindFieldKey || widget.props.fieldReadonly) {
          return true;
        }
        //如果不是这些字段类型,或者是多选模式则隐藏
        return !SHOW_FIELD_TYPE.includes(widget.props.fieldType) || !!widget.props.multiple;
      },
    },
    {
      component: 'autofill-editor',
      name: 'autofillRules',
      label: '',
      group: groupName,
      hidden: (widget) => {
        if (widget.props.bindFieldKey || widget.props.fieldReadonly) {
          return true;
        }
        return (
          // 如果不是这些字段类型/是多选模式/或者没开启自动填充 则隐藏
          !SHOW_FIELD_TYPE.includes(widget.props.fieldType) ||
          widget.props.enableAutofill === false ||
          !!widget.props.multiple
        );
      },
    },
  ];
};

export default getAutofillEditor;
