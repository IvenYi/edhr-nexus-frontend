import { ToolkitEnum } from '../enum/toolkit';

export const ToolkitOptions = [
  {
    code: ToolkitEnum.OUTLINE,
    name: '大纲',
    icon: 'icon-dagang',
  },
  {
    code: ToolkitEnum.WIDGETS,
    name: '组件',
    navName: '页面组件',
    icon: 'icon-zujian',
  },
  {
    code: ToolkitEnum.FIELD,
    name: '字段',
    icon: 'icon-ziduan2',
  },
  {
    code: ToolkitEnum.MODAL,
    name: '弹窗',
    icon: 'icon-danchuang',
  },
  {
    code: ToolkitEnum.JS,
    name: 'JS',
    icon: 'icon-JS',
  },
  // {
  //   code: ToolkitEnum.LO,
  //   name: '编排',
  //   icon: 'icon-bianpai',
  // },
  {
    code: ToolkitEnum.CSS,
    name: 'CSS',
    icon: 'icon-CSS',
  },
  // {
  //   code: ToolkitEnum.TEMPLATE,
  //   name: '模版',
  //   icon: 'icon-moban',
  // },
];

//用于存放复制的modal
export const COPY_MODAL_KEY = 'COPY_MODAL__';
