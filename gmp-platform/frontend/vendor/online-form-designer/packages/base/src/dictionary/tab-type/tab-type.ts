import { IDictionary } from '../../interface';

/**
 * 标签类型
 */
export const TabType: IDictionary = {
  tag: 'tab-type',
  mode: 'static',
  items: [
    {
      label: '基础',
      value: 'base',
    },
    {
      label: '卡片',
      value: 'card',
    },
    {
      label: '文本',
      value: 'text',
    },
    {
      label: '胶囊',
      value: 'capsule',
    },
  ],
};
