import { SystemEnum, WidgetEnum, ToolkitEnum, ControlType, ControlRecord } from '../types';

const systemControlSize = {
  width: 26,
  height: 26,
};

const defaultControlSize = {
  width: 100,
  height: 56,
};

const sizeSchema = {
  [SystemEnum.Start]: systemControlSize,
  [SystemEnum.End]: systemControlSize,
};
export function getSize(shape: ControlType): { width: number; height: number } {
  return sizeSchema[shape] ?? defaultControlSize;
}

export const controlSchema: ControlRecord = {
  [SystemEnum.Start]: {
    id: SystemEnum.Start,
    type: SystemEnum.Start,
    title: '开始',
  },
  [SystemEnum.End]: {
    id: SystemEnum.End,
    type: SystemEnum.End,
    title: '结束',
  },
  [WidgetEnum.Modal]: {
    id: '',
    type: WidgetEnum.Modal,
    title: '模态框',
  },
  [WidgetEnum.Form]: {
    id: '',
    type: WidgetEnum.Form,
    title: '表单',
  },
  [WidgetEnum.FormComp]: {
    id: '',
    type: WidgetEnum.FormComp,
    title: '表单控件',
  },
  [WidgetEnum.DataTable]: {
    id: '',
    type: WidgetEnum.DataTable,
    title: '数据表格',
  },
  [ToolkitEnum.Request]: {
    id: '',
    type: ToolkitEnum.Request,
    title: '模型请求',
    inputType: 'variable',
    resType: null,
  },
};
