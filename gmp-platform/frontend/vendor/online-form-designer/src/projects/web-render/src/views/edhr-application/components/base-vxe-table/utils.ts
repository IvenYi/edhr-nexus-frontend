export const baseColumnConfig = {
  minWidth: 100,
  showOverflow: true,
  slots: { default: 'default' },
  align: 'left',
};

// 特殊列配置
export const specialColumns = {
  seq: {
    type: 'seq',
    title: $t('sys.index'),
    width: 60,
    align: 'center',
    slots: null,
  },
  action: {
    field: 'action',
    title: $t('sys.operation'),
    width: 134,
    fixed: 'right',
    slots: { default: 'action' },
  },
};
