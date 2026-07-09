import { has } from 'lodash-es';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { FIELD_TYPE, MaterialEnum } from '/@/enums/appEnum';
import {
  PropGroup,
  BindCmpStyleTypeEnum,
  Platform,
  BindCmpStyleEnum,
  FormComponents,
} from '/@page-designer/enum';
import { changeCmpData } from '../utils';
import { useScope } from '/@page-designer/hooks/useScope';
import { findNodeAll } from '/@/utils/helper/treeHelper';
import { EntityModelTypeEnum } from '/@/projects/app-designer/src/enum';
import { LowCodeModal } from '../../types/modal-types';
import { isFormFieldType } from '/@page-designer/schema/utils';
import { useDesigner } from '/@page-designer/hooks/useDesigner';
import { getModelComprehensiveEnumInfoByModelCategory } from '/@/apis/gct-apaas/ModelComprehensiveController';

/** 字段名称和显示标题config */
const basicFieldEditor: LowCodeWidget.PropEditor[] = [
  // 字段模型链路
  // {
  //   component: 'field-pathchain-editor',
  //   name: 'fieldCodeChain',
  //   label: '',
  //   group: PropGroup.BASIC,
  // },
  // 字段名称
  {
    component: 'custom-name-editor',
    name: 'label',
    label: 'sys.pageDesigner.fieldTitle',
    formItemStyle: { marginBottom: '12px' },
    group: PropGroup.BASIC,
    changeCallback(widget) {
      widget.alias = widget.props.label;
    },
    _config: {
      formItemCheckbox: {
        label: 'sys.pageDesigner.displayLabelText',
        propsKey: 'displayLabelText',
      },
    },
  },
  // 显示标题
  // {
  //   component: 'checkbox-editor',
  //   name: 'displayLabelText',
  //   label: '',
  //   group: PropGroup.BASIC,
  // },
];

/** 暗提示config */
const placeholderEditor: LowCodeWidget.PropEditor[] = [
  {
    component: 'text-editor',
    name: 'placeholder',
    label: 'sys.pageDesigner.fieldPlaceholder',
    group: PropGroup.FIELD_CONFIG,
    _config: {
      i18n: true,
      showCount: true,
      maxlength: 32,
    },
    hidden(widget) {
      return (
        widget.props.bindFieldKey ||
        widget.props.bindCompStyleType === BindCmpStyleEnum.CMP_TIME ||
        widget.props.readonly ||
        widget.props.fieldReadonly ||
        widget.materialType === FormComponents.Descriptions
      );
    },
  },
];

/** 获取输入属性config */
const getInputAttrEditor = (needFieldAttrs: string[]): LowCodeWidget.PropEditor[] => {
  return [
    // 输入属性
    {
      component: 'input-attr-editor',
      name: '',
      label: 'sys.pageDesigner.inputAttr',
      group: PropGroup.FIELD_CONFIG,
      _config: {
        needFieldAttrs: needFieldAttrs,
        getFilterAttrs: (widget) => {
          if (
            widget.platform !== Platform.WEB ||
            !isFormFieldType(widget) ||
            widget.props.readonly ||
            widget.props.fieldReadonly
          ) {
            return ['getFocus'];
          }
          return [];
        },
      },
      changeCallback(widget, value) {
        if (value.includes('getFocus')) {
          const { scopeData } = useScope();
          const fields = findNodeAll(scopeData.value, (res) => {
            return res.isField && has(res.props, 'getFocus') && res.id !== widget.id;
          });
          fields.forEach((field) => {
            field.props.getFocus = false;
          });
        }
      },
      hidden(widget) {
        return (
          widget.props.field === 'operating_state_' ||
          widget.props.bindFieldKey ||
          widget.materialType === FormComponents.Descriptions ||
          widget.props.fieldReadonly
        );
      },
    },
  ];
};

/** 获取组件类型config */
const getBindCmpTypeEditor = ({
  name,
  type,
  hiddenCallback,
  filterOptionsCallback,
  groupName,
}: {
  name: string;
  type: Function | BindCmpStyleTypeEnum;
  hiddenCallback?: (arg: LowCodeWidget.BasicSchema | LowCodeModal.Modal) => boolean;
  filterOptionsCallback?: Function;
  groupName?: string;
}): LowCodeWidget.PropEditor[] => {
  return [
    // 组件类型
    {
      component: 'bind-cmp-type-editor',
      name: name,
      label: 'sys.pageDesigner.bindCmpStyleLabel',
      group: groupName ? groupName : PropGroup.FIELD_CONFIG,
      hidden: hiddenCallback
        ? hiddenCallback
        : (widget) => {
            if (
              [
                FIELD_TYPE.TEXT,
                FIELD_TYPE.USER,
                FIELD_TYPE.USER_MULTI,
                FIELD_TYPE.ORG,
                FIELD_TYPE.ORG_MULTI,
              ].includes(widget.props.fieldType) &&
              (widget.props.bindFieldKey || !isFormFieldType(widget) || widget.props.fieldReadonly)
            ) {
              return true;
            }
            return name === 'selectType' && widget.platform !== Platform.WEB;
          },
      _config: {
        bindCmpStyleKey: type,
        filterOptionsCallback,
      },
      changeCallback(widget) {
        if (
          [
            FIELD_TYPE.BOOLEAN,
            FIELD_TYPE.USER,
            FIELD_TYPE.USER_MULTI,
            FIELD_TYPE.ORG,
            FIELD_TYPE.ORG_MULTI,
            FIELD_TYPE.DATA_TABLE_FORMULA,
          ].includes(widget.props.fieldType)
        ) {
          return;
        }

        if (
          [FIELD_TYPE.EXPRESSION, FIELD_TYPE.AGG, FIELD_TYPE.INTEGER, FIELD_TYPE.LONG].includes(
            widget.props.fieldType,
          )
        ) {
          widget.props.currency = '￥';
          widget.props.displayTimeType = 'd:h:m:s';
          return;
        }
        // 需要切换组件 schema
        changeCmpData(widget);
      },
    },
  ];
};

/** 填写说明config */
const explainEditor: LowCodeWidget.PropEditor[] = [
  // 填写说明开关
  {
    component: 'switch-editor',
    name: 'showExplain',
    label: 'sys.pageDesigner.explain',
    formItemStyle: { marginBottom: '12px' },
    group: PropGroup.FIELD_CONFIG,
    hidden: (widget) => {
      if (widget.props.bindFieldKey || widget.props.fieldReadonly) {
        return true;
      }
      if (
        (widget.materialType === MaterialEnum.MaterialFormField ||
          widget.materialType === MaterialEnum.MaterialSubTableModalField) &&
        widget.platform === Platform.PAD
      ) {
        return true;
      }
      return widget.platform !== Platform.WEB && widget.platform !== Platform.PAD;
    },
  },
  // 填写说明内容
  {
    component: 'texteare-editor',
    name: 'explain',
    label: '',
    group: PropGroup.FIELD_CONFIG,
    hidden: (widget) => {
      return !widget.props.showExplain;
    },
    _config: {
      i18n: true,
    },
  },
];

/** 正则表达式校验config */
const regexEditor: LowCodeWidget.PropEditor[] = [
  // 正则表达式校验
  {
    component: 'reg-editor',
    name: 'reg',
    label: 'sys.pageDesigner.regSwitch',
    group: PropGroup.FIELD_CONFIG,
    hidden(widget) {
      return widget.props.readonly || widget.props.fieldReadonly;
    },
    _config: {
      i18n: true,
      tooltip: 'sys.pageDesigner.regTips',
    },
  },
];

/** 隐藏时不提交config */
const submitInHideEditor: LowCodeWidget.PropEditor[] = [
  // 隐藏时不提交
  // {
  //   component: 'switch-editor',
  //   name: 'notSubmitInHide',
  //   label: 'sys.pageDesigner.notSubmitInHide',
  //   group: PropGroup.DISPLAY,
  // },
];

/** 文件上传拖拽开关config */
const uploadDraggerEditor: LowCodeWidget.PropEditor[] = [
  // 拖拽开关
  {
    component: 'switch-editor',
    name: 'dragger',
    label: 'sys.pageDesigner.draggerupload',
    group: PropGroup.FIELD_CONFIG,
  },
];

const validatorEditor: LowCodeWidget.PropEditor[] = [
  {
    component: 'switch-editor',
    name: 'closeValidator',
    label: 'sys.pageDesigner.closeValidator',
    group: PropGroup.FIELD_CONFIG,
    formField: true,
  },
];

/** 下拉列表、单选、多选公共config */
const SCREditorUtils = {
  // 默认值
  defaultValueEditor: [
    {
      component: 'select-editor',
      name: 'defaultValue',
      label: 'sys.pageDesigner.defaultValue',
      group: PropGroup.FIELD_CONFIG,
      formField: true,
      hidden: (widget) => {
        if (widget.props.bindFieldKey || widget.props.readonly || widget.props.fieldReadonly) {
          return true;
        }
        return (
          [FIELD_TYPE.REF, FIELD_TYPE.REF_MULTI].includes(widget.props.fieldType) ||
          !widget.props.bindModelKey
        );
      },
      _config: {
        supportGlobData: true,
        optionsvalidate: true,
        options: async (widget) => {
          const { allFormWidget } = useDesigner();
          const pForm = allFormWidget.value.find((e) => e.id === widget.preLocation);
          if (!pForm) return [];
          const data =
            (await getModelComprehensiveEnumInfoByModelCategory(
              { modelCategory: pForm.props.modeldata?.modelCategory || 'entity' },
              {
                modelKey: widget.props.modelKey,
                fieldKey: widget.props.field,
              },
            )) || [];
          if (widget.props.customMenu) {
            const filter = data.filter((item) => {
              return widget.props.customMenuFilter.includes(item.value);
            });
            return filter.map((i) => {
              return { value: i.value, label: i.text };
            });
          }
          return data.map((i) => {
            return { value: i.value, label: i.text };
          });

          // const defaultOpt = !widget.props.multiple ? [{ value: '', label: 'sys.none' }] : [];
        },
        valueType: 'string',
      },
    },
  ],
  // 组件类型
  bindCmpTypeEditor: getBindCmpTypeEditor({
    name: 'bindCompStyleType',
    type: (widget) => {
      return [FIELD_TYPE.ENUM_MULTI, FIELD_TYPE.REF_MULTI].includes(widget.props.fieldType)
        ? BindCmpStyleTypeEnum.BindMulti
        : BindCmpStyleTypeEnum.BindLink;
    },
    hiddenCallback(widget) {
      const refModelType = widget.props.refModelType;
      return (
        (refModelType !== EntityModelTypeEnum.BASE && refModelType !== EntityModelTypeEnum.NDO) ||
        FIELD_TYPE.MESSAGE_TMPL === widget.props.fieldType
      );
    },
  }),
};

/** 自定义枚举值config */
const customMenu: LowCodeWidget.PropEditor[] = [
  {
    component: 'switch-editor',
    name: 'customMenu',
    label: 'sys.pageDesigner.customMenu',
    group: PropGroup.FIELD_CONFIG,
    hidden(widget) {
      return (
        widget.props.readonly ||
        widget.props.fieldReadonly ||
        (widget.props.fieldType !== FIELD_TYPE.ENUM &&
          widget.props.fieldType !== FIELD_TYPE.ENUM_MULTI)
      );
    },
    changeCallback: (widget, value) => {
      widget.props.defaultValue = '';
    },
  },
  {
    component: 'select-editor',
    name: 'customMenuFilter',
    label: 'sys.pageDesigner.menuValue',
    group: PropGroup.FIELD_CONFIG,
    required: true,
    hidden: (widget) => {
      return widget.props.readonly || widget.props.fieldReadonly || !widget.props.customMenu;
    },
    _config: {
      supportGlobData: true,
      multiple: true,
      optionsvalidate: true,
      options: async (widget) => {
        const data =
          (await getModelComprehensiveEnumInfoByModelCategory(
            { modelCategory: widget.props?.modeldata?.modelCategory || 'entity' },
            {
              modelKey: widget.props.modelKey,
              fieldKey: widget.props.field,
            },
          )) || [];
        return data.map((i) => {
          return { value: i.value, label: i.text };
        });
      },
    },
    changeCallback: (widget, value) => {
      const arr = widget.props.defaultValue ? widget.props.defaultValue.split(',') : [];
      const defaultArr = arr.filter((item) => value.includes(item));
      widget.props.defaultValue = defaultArr.join(',');
    },
  },
];

const mutiFieldEditor: LowCodeWidget.PropEditor[] = [
  {
    component: 'switch-editor',
    name: 'multiFieldDisplay',
    label: '多字段显示',
    required: false,
    group: PropGroup.DATASOURCE,
    hidden(widget) {
      return (
        ![
          FIELD_TYPE.TEXT,
          FIELD_TYPE.LONG_TEXT,
          FIELD_TYPE.INTEGER,
          FIELD_TYPE.LONG,
          FIELD_TYPE.DOUBLE,
          FIELD_TYPE.DECIMAL,
          FIELD_TYPE.DATE,
          FIELD_TYPE.TIME,
          FIELD_TYPE.DATE_TIME,
          FIELD_TYPE.SERIAL,
          FIELD_TYPE.EXPRESSION,
          FIELD_TYPE.AGG,
        ].includes(widget.props.fieldType) ||
        widget.materialType !== MaterialEnum.MaterialTableField ||
        widget.platform === Platform.MOBILE
      );
    },
    _config: {
      tooltip: '自定义单元格内容，可以显示多个数据字段',
    },
  },
  {
    component: 'multi-field-config-editor',
    name: 'multiFieldConfig',
    label: '辅助字段',
    group: PropGroup.DATASOURCE,
    hidden(widget) {
      return !widget.props.multiFieldDisplay;
    },
  },
];

export default {
  /** 字段模型链路、字段名称和显示标题config */
  basicFieldEditor,
  /** 暗提示config */
  placeholderEditor,
  /** 获取输入属性config */
  getInputAttrEditor,
  /** 获取组件类型config */
  getBindCmpTypeEditor,
  /** 填写说明config */
  explainEditor,
  /** 正则表达式校验config */
  regexEditor,
  /** 隐藏时不提交config */
  submitInHideEditor,
  uploadDraggerEditor,
  /** 字段关闭校验config */
  validatorEditor,
  /** 下拉列表、单选、多选公共config */
  SCREditorUtils,
  /** 自定义枚举值 */
  customMenu,
  /** 多字段展示 */
  mutiFieldEditor,
};
