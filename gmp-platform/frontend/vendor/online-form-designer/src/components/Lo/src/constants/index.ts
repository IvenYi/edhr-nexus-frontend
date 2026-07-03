import {
  // NodeTypeEnum,
  // NodeConfigInterface,
  // ModelSubmitReturnEnum,
  VariableTypeEnum,
  VariableValueEnum,
  // PanelTypeEnum,
  SystemEnum,
  WidgetEnum,
  ToolkitEnum,
  ControlInterface,
  PanelTypeEnum,
} from '../types';
// import { FormComponents, BuiltinType } from '/@page-designer/enum';

export const NodeGroupList: Array<{ name: string; nodes: ControlInterface[] }> = [
  {
    name: '组件',
    nodes: [
      {
        value: WidgetEnum.Modal,
      },
      {
        value: WidgetEnum.Form,
      },
      {
        value: WidgetEnum.FormComp,
      },
      {
        value: WidgetEnum.DataTable,
      },
    ],
  },
  {
    name: '工具',
    nodes: [
      {
        value: ToolkitEnum.Request,
      },
    ],
  },
];

// export const NodeConfigMap = NodeGroupList.reduce((map, group) => {
//   group.nodes.forEach((item) => {
//     map[item.value] = item;
//   });
//   return map;
// }, {});

export const VariableOptions = [
  {
    value: VariableTypeEnum.String,
    label: '文本',
  },
  {
    value: VariableTypeEnum.Number,
    label: '数值',
  },
  {
    value: VariableTypeEnum.Boolean,
    label: '布尔值',
  },
  {
    value: VariableTypeEnum.Object,
    label: '对象',
  },
  {
    value: VariableTypeEnum.Array,
    label: '数组',
  },
  {
    value: VariableTypeEnum.DataTime,
    label: '日期时间',
  },
  {
    value: VariableTypeEnum.Null,
    label: 'NULL',
  },
];

export const PanelOptions = [
  {
    value: PanelTypeEnum.Basic,
    label: '基础信息',
    icon: 'icon-yemianshuxing',
  },
  {
    value: PanelTypeEnum.Variable,
    label: '变量信息',
    icon: 'icon-shezhi',
  },
  {
    value: PanelTypeEnum.Control,
    label: '控件信息',
    icon: 'icon-shijian',
  },
];
