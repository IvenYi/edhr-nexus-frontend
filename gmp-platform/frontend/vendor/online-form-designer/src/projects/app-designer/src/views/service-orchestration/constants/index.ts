import {
  NodeTypeEnum,
  NodeConfigInterface,
  ModelSubmitReturnEnum,
  VariableTypeEnum,
  PanelTypeEnum,
} from '../types';

export const NodeGroupList: Array<{ name: string; show: boolean; nodes: NodeConfigInterface[] }> = [
  {
    name: '事件列表',
    show: false,
    nodes: [
      {
        value: NodeTypeEnum.START,
        name: '开始',
        size: {
          width: 26,
          height: 26,
        },
        isShow: false,
      },
      {
        value: NodeTypeEnum.END,
        name: '结束',
        size: {
          width: 26,
          height: 26,
        },
        isShow: false,
      },
    ],
  },
  {
    name: '模型列表',
    show: true,
    nodes: [
      {
        value: NodeTypeEnum.MODEL_CREATE,
        name: '模型创建',
        size: {
          width: 70,
          height: 40,
        },
        isShow: true,
      },
      {
        value: NodeTypeEnum.MODEL_SUBMIT,
        name: '模型提交',
        size: {
          width: 70,
          height: 40,
        },
        isShow: true,
      },
    ],
  },
];

export const NodeConfigMap = NodeGroupList.reduce((map, group) => {
  group.nodes.forEach((item) => {
    map[item.value] = item;
  });
  return map;
}, {});

export const ModelSubmitReturnOptions = [
  {
    value: ModelSubmitReturnEnum.NONE,
    label: '无',
  },
  {
    value: ModelSubmitReturnEnum.INSTANCE_ID,
    label: '模型实例Id',
  },
  {
    value: ModelSubmitReturnEnum.INSTANCE,
    label: '模型实例',
  },
];

export const VariableOptions = [
  {
    value: VariableTypeEnum.TEXT,
    label: '文本',
    backupVal: '""',
  },
  {
    value: VariableTypeEnum.NUMBER,
    label: '数值',
    backupVal: 'null',
  },
  {
    value: VariableTypeEnum.BOOL,
    label: '布尔',
    backupVal: 'true',
  },
  {
    value: VariableTypeEnum.DATETIME,
    label: '日期时间',
    backupVal: 'null',
  },
  {
    value: VariableTypeEnum.OBJECT,
    label: '对象',
    backupVal: '{}',
  },
  {
    value: VariableTypeEnum.ARRAY,
    label: '数组',
    backupVal: '[]',
  },
  {
    value: VariableTypeEnum.NULL,
    label: 'NULL',
    backupVal: 'null',
  },
];

export const PanelOptions = [
  {
    value: PanelTypeEnum.BASIC_INFO,
    label: '基础设置',
    icon: 'icon-yemianshuxing',
  },
  {
    value: PanelTypeEnum.GLOBAL_SETTING,
    label: '全局设置',
    icon: 'icon-shezhi',
  },
  {
    value: PanelTypeEnum.CONTROL_RPOPS,
    label: '控件属性',
    icon: 'icon-shijian',
  },
];
