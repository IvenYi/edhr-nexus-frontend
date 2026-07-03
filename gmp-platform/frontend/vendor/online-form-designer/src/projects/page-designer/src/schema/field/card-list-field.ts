import {
  PropGroup,
  FormComponents,
  StyleGroup,
  TagTypeEnum,
  BindCmpStyleTypeEnum,
  BindCmpStyleEnum,
  TIMETYPE_ENUM,
  TIMETYPE_LANG_ENUM,
  CURRENCY_ENUM,
  CURRENCY_LANG_ENUM,
  TextDecoration,
  ProgressTypeEnum,
  tagEnum,
} from '/@page-designer/enum';
import { SignatureTypeEnum } from '/@/projects/page-designer/src/enum';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { FIELD_TYPE, MaterialEnum } from '@/enums/appEnum';
import { displayEditor } from '../common-config/display-editor-config';
import commonFieldEditorConfig from '../common-config/common-field-editor-config';
import { buildShortUUID } from '/@/utils/uuid';

export function runPropEditor(selectedRef, propEditorList, isCard) {
  // 文本、长文本、整数、长整数、小数、精度小数、布尔、枚举关联、枚举多选、模型关联、模型多选
  if (
    [
      FIELD_TYPE.TEXT,
      FIELD_TYPE.LONG_TEXT,
      FIELD_TYPE.INTEGER,
      FIELD_TYPE.LONG,
      FIELD_TYPE.DOUBLE,
      FIELD_TYPE.DECIMAL,
      FIELD_TYPE.BOOLEAN,
      FIELD_TYPE.ENUM,
      FIELD_TYPE.ENUM_MULTI,
      FIELD_TYPE.REF,
      FIELD_TYPE.REF_MULTI,
      FIELD_TYPE.TRANSACTION,
      FIELD_TYPE.RDO_REF,
    ].includes(selectedRef.props.fieldType) &&
    isCard
  ) {
    return propEditorList;
  }
  if (selectedRef.type === FormComponents.EXPRESSION || selectedRef.type === FormComponents.AGG) {
    return propEditorList;
  }

  const propArr = [...commonFieldEditorConfig.basicFieldEditor, ...displayEditor];
  if (selectedRef.type === FormComponents.Signature) {
    propArr.push(
      {
        component: 'select-editor',
        name: 'signatureType',
        label: 'sys.pageDesigner.signatureType',
        group: PropGroup.FIELD_CONFIG,
        _config: {
          showSearch: true,
          options: Object.keys(SignatureTypeEnum).map((key) => {
            return {
              label: 'sys.pageDesigner.' + SignatureTypeEnum[key],
              value: SignatureTypeEnum[key],
            };
          }),
        },
        hidden: (widget) => {
          return widget.props.fieldType !== FIELD_TYPE.SIGNATURE;
        },
      },
      {
        component: 'datetime-style-editor',
        name: 'displayStyle',
        label: 'sys.pageDesigner.displayStyle',
        group: PropGroup.FIELD_CONFIG,
        hidden: (widget) => {
          return (
            widget.props.fieldType !== FIELD_TYPE.SIGNATURE ||
            widget.props.signatureType !== SignatureTypeEnum.SIGNATURE_DATETIME
          );
        },
      },
      {
        component: 'date-style-editor',
        name: 'displayStyle',
        label: 'sys.pageDesigner.displayStyle',
        group: PropGroup.FIELD_CONFIG,
        hidden: (widget) => {
          return (
            widget.props.fieldType !== FIELD_TYPE.SIGNATURE ||
            widget.props.signatureType !== SignatureTypeEnum.SIGNATURE_DATE
          );
        },
      },
    );
  }
  if (selectedRef.type === FormComponents.UploadImage && !isCard) {
    propArr.push({
      component: 'max-display-editor',
      name: 'displayMaxNum',
      label: 'sys.pageDesigner.displayMaxNum',
      group: PropGroup.SHOW,
      // dependentProps: ['readonly'],
      _config: {
        min: 1,
        max: 20,
        precision: 0,
      },
      // hidden: (widget) => {
      //   if (widget.props.fieldType !== FIELD_TYPE.IMAGE) {
      //     return true;
      //   }
      // },
    });
  }
  if (
    [
      FormComponents.Switch,
      FormComponents.Select,
      FormComponents.Radio,
      FormComponents.Checkbox,
      FormComponents.Input,
      FormComponents.ElectronicSignature,
      FormComponents.Inputnumber,
      // FormComponents.Department,
    ].includes(selectedRef.type)
  ) {
    propArr.push(
      ...commonFieldEditorConfig.getBindCmpTypeEditor({
        name: 'bindCompStyleType',
        hiddenCallback: (widget) => {
          return [FIELD_TYPE.LONG_TEXT, FIELD_TYPE.TEXT].includes(widget.props.fieldType);
        },
        type: (widget) => {
          if ([FIELD_TYPE.LONG_TEXT].includes(widget.props.fieldType)) {
            return BindCmpStyleTypeEnum.BindLongText;
          } else if (FIELD_TYPE.BOOLEAN === widget.props.fieldType) {
            return BindCmpStyleTypeEnum.BindBool;
          } else if ([FIELD_TYPE.USER].includes(widget.props.fieldType)) {
            return BindCmpStyleTypeEnum.BindPerson;
          } else if ([FIELD_TYPE.ORG].includes(widget.props.fieldType)) {
            return BindCmpStyleTypeEnum.BindDept;
          } else if ([FIELD_TYPE.REF, FIELD_TYPE.ENUM].includes(widget.props.fieldType)) {
            return BindCmpStyleTypeEnum.BindLink;
          } else if (
            [
              FIELD_TYPE.REF_MULTI,
              FIELD_TYPE.ENUM_MULTI,
              FIELD_TYPE.USER_MULTI,
              FIELD_TYPE.ORG_MULTI,
            ].includes(widget.props.fieldType)
          ) {
            return BindCmpStyleTypeEnum.BindMulti;
          } else if ([FIELD_TYPE.LONG, FIELD_TYPE.INTEGER].includes(widget.props.fieldType)) {
            return BindCmpStyleTypeEnum.BindNum;
          } else if ([FIELD_TYPE.DECIMAL].includes(widget.props.fieldType)) {
            return BindCmpStyleTypeEnum.BindDecimal;
          }
        },
      }),
    );

    if (FormComponents.Inputnumber === selectedRef.type) {
      propArr.push(
        ...[
          {
            component: 'select-editor',
            name: 'displayTimeType',
            label: 'sys.pageDesigner.timeType',
            group: PropGroup.FIELD_CONFIG,
            hidden: (widget) => {
              return widget.props.bindCompStyleType !== BindCmpStyleEnum.CMP_TIME;
            },
            _config: {
              showSearch: true,
              placeholder: 'sys.pageDesigner.timeType',
              clearable: false,
              options: Object.keys(TIMETYPE_ENUM).map((key) => {
                return {
                  label: 'sys.component.time.' + TIMETYPE_LANG_ENUM[key],
                  value: TIMETYPE_ENUM[key],
                };
              }),
            },
          },
          // 显示币种内容
          {
            component: 'select-editor',
            name: 'currency',
            label: '',
            group: PropGroup.FIELD_CONFIG,
            hidden: (widget) => {
              return widget.props.bindCompStyleType !== BindCmpStyleEnum.CMP_CURRENCY;
            },
            _config: {
              showSearch: true,
              placeholder: 'sys.chooseText',
              clearable: false,
              options: Object.keys(CURRENCY_ENUM).map((key) => {
                return {
                  label: 'sys.pageDesigner.' + CURRENCY_LANG_ENUM[key],
                  value: CURRENCY_ENUM[key],
                };
              }),
            },
          },
        ],
      );
    }
  }
  return propArr;
}

export function runStyleEditor(): LowCodeWidget.StyleEditor[] {
  return [
    {
      component: 'position-editor',
      name: 'position',
      label: 'sys.pageDesigner.position',
      group: StyleGroup.LAYOUT,
    },
    {
      component: 'number-editor',
      name: 'width',
      label: 'sys.width',
      group: StyleGroup.LAYOUT,
    },
    {
      component: 'number-editor',
      name: 'height',
      label: 'sys.height',
      group: StyleGroup.LAYOUT,
    },
    {
      component: 'font-editor',
      name: 'labelFont',
      label: 'sys.name',
      group: StyleGroup.STYLE,
    },
    {
      component: 'font-editor',
      name: 'contentFont',
      label: 'sys.content',
      group: StyleGroup.STYLE,
      hidden(widget) {
        return [FIELD_TYPE.ATTACHMENT, FIELD_TYPE.IMAGE, FIELD_TYPE.DATA_TABLE_FORMULA].includes(
          widget.props.fieldType as FIELD_TYPE,
        );
      },
      _config: {
        hiddenColor: true, //隐藏颜色
      },
    },
    {
      component: 'boolean-editor',
      name: 'tagStyleOpen',
      label: 'sys.pageDesigner.tagStyle',
      group: StyleGroup.STYLE,
      hidden(widget) {
        if (
          [
            FIELD_TYPE.ATTACHMENT,
            FIELD_TYPE.IMAGE,
            FIELD_TYPE.RDO_REF,
            FIELD_TYPE.DATA_TABLE_FORMULA,
          ].includes(widget.props.fieldType)
        ) {
          return true;
        }
        if ([FormComponents.Switch, FormComponents.EXPRESSION].includes(widget.type)) {
          return widget.props.bindCompStyleType === BindCmpStyleEnum.CMP_BOOLEAN;
        }

        return false;
      },
      _config: {
        showType: 'checkbox',
        options: [
          {
            label: 'sys.pageDesigner.configureContentAsLabelStyle',
            value: true,
          },
        ],
      },
      changeCallback: (widget, value) => {
        if (value && !widget.style.tagStyle) {
          widget.style.tagStyle = {
            color: '',
            tagType: TagTypeEnum.RADIUS,
          };
        }
      },
    },
    {
      component: 'tag-editor',
      name: 'tagStyle',
      group: StyleGroup.STYLE,
      hidden: (widget) => {
        if (
          [FormComponents.Switch, FormComponents.EXPRESSION].includes(widget.type) &&
          widget.props.bindCompStyleType === BindCmpStyleEnum.CMP_BOOLEAN
        ) {
          return true;
        }

        if (widget.props?.fieldType === FIELD_TYPE.DATA_TABLE_FORMULA) {
          return true;
        }
        return !widget.style.tagStyleOpen;
      },
    },
    {
      component: 'column-tag-editor',
      name: 'columnFontStyleByRule',
      label: '',
      group: StyleGroup.STYLE,
      _config: {
        generator: getFontStyleRule,
      },
      hidden(widget) {
        return widget.props?.fieldType !== FIELD_TYPE.DATA_TABLE_FORMULA;
      },
    },
  ];
}
export function runEventEditor() {
  return [];
}

/**添加样式规则 */
function getFontStyleRule() {
  return {
    id: buildShortUUID('content'),
    displayRule: '',
    contentFont: {
      fontSize: '',
      bold: false,
      italic: false,
      textDecoration: TextDecoration.NONE,
      color: '',
      align: 'left',
    },
    tagStyle: {
      color: '#0DAA9C',
      tagType: TagTypeEnum.RADIUS,
      progressBarType: ProgressTypeEnum.CIRCLE,
    },
    progressStyle: {
      color: '#0DAA9C',
      tagType: ProgressTypeEnum.CIRCLE,
    },
    tagType: tagEnum.TAG,
    tagStyleOpen: false,
  };
}
