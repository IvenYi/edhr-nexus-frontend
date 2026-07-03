export enum BasicAction {
  /** 创建/添加 */
  Insert = 'Insert',
  /** 更新 */
  Update = 'Update',
  /** 删除 */
  Delete = 'Delete',
  Import = 'Import',
  Export = 'Export',
  Setting = 'Setting',
  /**下载 */
  Download = 'Download',
  /**测试 */
  Test = 'Test',
  Design = 'Design',
  Add = 'Add',
}

export enum CustomAction {
  /** 重置密码 */
  ResetPassword = 'ResetPassword',
  /** 权限配置 */
  PermissionSetting = 'PermissionSetting',
  /** 移除并交接 */
  RemoveAndHandover = 'RemoveAndHandover',
  /** 分类管理 */
  CategoryManagement = 'CategoryManagement',
  BaiscSetting = 'BaiscSetting',
  WatermarkSetting = 'WatermarkSetting',
  SecuritySetting = 'SecuritySetting',
  LoginSetting = 'LoginSetting',
  ThemeSetting = 'ThemeSetting',
  OrganizationSetting = 'OrganizationSetting',
  ApkSetting = 'ApkSetting',
  DevelopIconManagement = 'DevelopIconManagement',
  DevelopImageManagement = 'DevelopImageManagement',
  /**补打印 */
  Reprint = 'Reprint',
  /** 定时任务相关 */
  // 查看任务
  ViewTask = 'ViewTask',
  // 手动触发
  ManualTrigger = 'ManualTrigger',
  // 配置
  Setting = 'Setting',
  // 终止
  Terminate = 'Terminate',
  // 转交
  Reassign = 'Reassign',
  // 日志
  Log = 'Log',
  // 移动
  Moving = 'Moving',
  // 启用/禁用
  EnableDisable = 'EnableDisable',
  // 重置签名密码
  ResetSignPassword = 'ResetSignPassword',
  // 修改印章密码
  ChangeSealPassword = 'ChangeSealPassword',
  // .btw 标签
  BtwConvertTemplate = 'BtwConvertTemplate',
  BtwUpdate = 'BtwUpdate',
  BtwDelete = 'BtwDelete',
  BtwCopy = 'BtwCopy',
}

export type AuthActionEnum = BasicAction | CustomAction;

export const DefaultActions = [BasicAction.Insert, BasicAction.Update, BasicAction.Delete];
export const PlatformSettingActions = [
  CustomAction.BaiscSetting,
  CustomAction.WatermarkSetting,
  CustomAction.SecuritySetting,
  CustomAction.LoginSetting,
  CustomAction.ThemeSetting,
  CustomAction.OrganizationSetting,
  CustomAction.ApkSetting,
];
