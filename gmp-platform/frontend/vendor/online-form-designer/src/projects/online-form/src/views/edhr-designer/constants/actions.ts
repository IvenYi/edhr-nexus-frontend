export enum ActionKeys {
  CONFIGURE = 'configure',
  EDIT = 'edit',
  DELETE = 'delete',
  UPGRADE_VERSION = 'upgrade-version',
}

export const ToolbarActions = [
  {
    key: ActionKeys.CONFIGURE,
    title: $t('sys.kit.edhr.process.form_entries_'),
    subtitle: $t('sys.onlineForm.toolbarConfigureActionSubtitle'),
    icon: 'iconfont:icon-tijiao',
    color: '#3e98e8',
  },
  {
    key: ActionKeys.EDIT,
    title: $t('sys.onlineForm.toolbarEditActionTitle'),
    subtitle: $t('sys.onlineForm.toolbarEditActionSubtitle'),
    icon: 'iconfont:icon-tijiao',
    color: '#eaa451',
  },
  {
    key: ActionKeys.DELETE,
    title: $t('sys.onlineForm.toolbarDeleteActionTitle'),
    subtitle: $t('sys.onlineForm.toolbarDeleteActionSubtitle'),
    icon: 'iconfont:icon-tijiao',
    color: '#e43535',
  },
  // 版本升级暂不支持
  // {
  //   key: ActionKeys.UPGRADE_VERSION,
  //   title: 'eDHR升版',
  //   subtitle: '以当前eDHR为基础创建新版本',
  //   icon: 'icon-shanchu',
  // },
];
