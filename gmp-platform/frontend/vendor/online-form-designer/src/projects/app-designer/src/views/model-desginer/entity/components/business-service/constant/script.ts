import type { TreeSelectProps } from 'ant-design-vue';

export const treeData: TreeSelectProps['treeData'] = [
  {
    label: 'Node1',
    value: '0-0',
    children: [
      {
        label: 'Child Node1',
        value: '0-0-0',
      },
    ],
  },
  {
    label: 'Node2',
    value: '0-1',

    children: [
      {
        label: 'Child Node3',
        value: '0-1-0',
        disabled: true,
      },
      {
        label: 'Child Node4',
        value: '0-1-1',
      },
      {
        label: 'Child Node5',
        value: '0-1-2',
      },
    ],
  },
];
