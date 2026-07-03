import {
  DisplayEnums,
  IDesignerProvider,
  LowCodeWidget,
  Platform,
  PropGroup,
  StyleGroup,
  CreateType,
  FIELD_TYPE,
} from '@gct/runtime';
import { displayEditor } from '/@page-designer/schema/common-config/display-editor-config';
import { Component, defineAsyncComponent } from 'vue';
import { KitType } from '../../../enums';

export interface IStaffSignatureConfirmProps extends LowCodeWidget.WidgetProps {
  title: string;
  isSignRequired: boolean;
  showEmpNo: boolean,
  staffFields: string|string[];
  needOtherFields: boolean;
  otherFieldsData?: object;
  hideAdd: boolean;
}

export interface IStaffSignatureConfirm extends LowCodeWidget.BasicSchema {
  props: IStaffSignatureConfirmProps;
}

export default class StaffSignatureConfirmConfig implements IDesignerProvider {
  kit: string[] = ['MEDPRO'];

  component: Component = defineAsyncComponent(
    () => import('./staff-signature-confirm-designer.vue'),
  );

  schema: IStaffSignatureConfirm = {
    id: '',
    platform: Platform.WEB,
    name: 'sys.kit.staffSignatureConfirm',
    alias: '',
    type: 'medpro' + KitType.STAFF_SIGNATURE_CONFIRM,
    display: DisplayEnums.BLOCK,
    displayName: 'sys.kit.staffSignatureConfirm',
    icon: 'icon-qianming1',
    props: {
      title: '人员签名确认',
      isSignRequired: false,
      showEmpNo: false,
      staffFields: null,
      needOtherFields: false,
      otherFields: [],
      otherFieldsData: {},
      hideAdd: false,
    } as any,
    style: {},
    events: {},
    formItem: false,
  };

  propEditors: LowCodeWidget.PropEditor[] = [
    {
      component: 'text-editor',
      name: 'title',
      label: 'sys.pageDesigner.title',
      group: PropGroup.BUTTON,
      _config: {
        i18n: true,
        maxlength: 10,
        showCount: true,
      },
    },
    {
      component: 'switch-editor',
      name: 'isSignRequired',
      label: '强制签名校验',
      group: PropGroup.BUTTON,
    },
    {
      component: 'switch-editor',
      name: 'hideAdd',
      label: '隐藏添加按钮',
      group: PropGroup.BUTTON,
    },
    {
      component: 'switch-editor',
      name: 'needStaffOtherFields',
      label: '人员信息扩展',
      group: PropGroup.FIELD_CONFIG,
      changeCallback(widget) {
        widget.props.staffFields = null;
      },
    },
    {
      component: 'select-editor',
      name: 'staffFields',
      label: '人员扩展字段',
      group: PropGroup.FIELD_CONFIG,
      required: true,
      hidden(widget) {
        return !widget.props.needStaffOtherFields;
      },
      _config: {
        tips: '格式：扩展字段（姓名）',
        options: () => {
          return [
            {
              label: '工号',
              value: 'empNo',
            },
            {
              label: '账号',
              value: 'username',
            },
          ];
        },
      },
    },
    {
      component: 'switch-editor',
      name: 'needOtherFields',
      label: '表格信息扩展',
      group: PropGroup.FIELD_CONFIG,
      changeCallback(widget) {
        widget.props.otherFieldsData = {};
        widget.props.otherFields = [];
      },
    },
    // 关联表单下的绑定字段
    {
      component: 'field-editor',
      name: 'otherFields',
      label: '表格扩展字段',
      group: PropGroup.FIELD_CONFIG,
      required: true,
      hidden(widget) {
        return !widget.props.needOtherFields;
      },
      _config: {
        multiple: true,
        modelKey: 'refFormModel',
        tips: '目前只支持扩展日期类型',
        filterTypes: [CreateType.USER_DEFINED, CreateType.BUILTIN],
        filterFields: [FIELD_TYPE.DATE_TIME],
        changeFunc: (widget, selectedOption) => {
          widget.props.otherFieldsData = selectedOption;
        },
      },
    },
    ...(displayEditor as any),
  ];

  events: LowCodeWidget.EventsType[] = [
    {
      name: 'validate',
      title: 'sys.kit.StaffSignatureConfirm',
      params: ['rowValue'],
    },
  ];

  styleEditors: LowCodeWidget.StyleEditor[] = [
    {
      component: 'number-editor',
      label: 'sys.pageDesigner.maximumHeight',
      group: StyleGroup.LAYOUT,
      name: 'maxHeight',
      _config: {
        min: 200,
      },
    },
    {
      component: 'margin-editor',
      group: StyleGroup.MARGIN,
    },
  ];
}
