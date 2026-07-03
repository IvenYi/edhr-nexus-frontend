interface BasicUserModalInfo {
  // 两个ID一个意思只是不同接口用不同字段
  /** id */
  id?: string;
  /** userId */
  userId?: string;
  /** 头像 */
  avatar?: string;
  /** 姓名 */
  fullname: string;
  /** 状态 */
  enabled?: number;
  /** 工号 */
  empNo: string;
  /** 职务 */
  duty?: string;
  /** 直属上级id */
  managerId?: string;
  /** 直属上级名称 */
  managerName?: string;
  /** 生日 */
  birthday?: string;
  /** 性别 */
  gender?: number;
  /** 账号 */
  username: string;
  /** 手机号 */
  mobile?: string;
  /** 密码 */
  password: string;
  /** 确认密码 */
  confirmPassword: string;
  /** 签名密码 */
  signPassword: string;
  /** 座机 */
  telephone?: string;
  /** 邮箱 */
  email?: string;
  /** 租户名称 */
  tenantNames?: string;
  /** 租户列表 */
  tenantList?: any;
  /** 注册时间 */
  createTime?: string;
  /** 扩展字段0 */
  ext0?: string;
  /** 扩展字段1 */
  ext1?: string;
  /** 扩展字段2 */
  ext2?: string;
  /** 扩展字段3 */
  ext3?: string;
  /** 扩展字段4 */
  ext4?: string;
  /** 扩展字段5 */
  ext5?: number;
  /** 扩展字段6 */
  ext6?: number;
  /** 扩展字段7 */
  ext7?: number;
  /** 扩展字段8 */
  ext8?: number;
  /** 扩展字段9 */
  ext9?: number;
}

export interface QueryDto
  extends Pick<BasicUserModalInfo, 'fullname' | 'username' | 'enabled' | 'email' | 'mobile'> {
  /** 创建时间 */
  createTime: string[];
}

export type UserDto = Pick<
  BasicUserModalInfo,
  | 'id'
  | 'avatar'
  | 'username'
  | 'fullname'
  | 'mobile'
  | 'empNo'
  | 'password'
  | 'confirmPassword'
  | 'email'
  | 'gender'
  | 'birthday'
  | 'telephone'
  | 'tenantList'
  | 'createTime'
  | 'signatureImage',
  'ext0' | 'ext1' | 'ext2' | 'ext3' | 'ext4' | 'ext5' | 'ext6' | 'ext7' | 'ext8' | 'ext9'
>;

export type OrgUserDto = Pick<
  BasicUserModalInfo,
  | 'id'
  | 'avatar'
  | 'username'
  | 'fullname'
  | 'mobile'
  | 'empNo'
  | 'duty'
  | 'managerId'
  | 'managerName'
  | 'password'
  | 'signPassword'
  | 'email'
  | 'signatureImage'
  | 'signatureImageWrite'
  | 'signType'
  | 'gender'
  | 'birthday'
  | 'telephone'
  | 'createTime'
  | 'suiteSeat'
  | 'platSeat'
  | 'country'
  | 'ext0'
  | 'ext1'
  | 'ext2'
  | 'ext3'
  | 'ext4'
  | 'ext5'
  | 'ext6'
  | 'ext7'
  | 'ext8'
  | 'ext9'
>;

export interface userOrgDto {
  /** 组织id */
  orgId: string;
  /** 组织名称 */
  orgName: string;
  /** 是否是部门负责人,0: 否 1: 是 */
  principal: number;
  /** 是否主部门,0: 否 1: 是 */
  master: number;
  /** 组织名称数组 */
  orgList: Array;
}

export interface IButtonProps {
  /** 唯一key */
  key: string;
  /** 按钮名称 */
  name: string;
  /** 按钮icon */
  icon?: string;
  /** 使用自定义的组件 */
  useCustomizeCmp?: boolean;
  /** 按钮所属位置 */
  locationType?: string;
  /** 按钮所属位置数组 */
  locationTypes: string[];
  /** 按钮样式 直接解构 */
  style?: {
    [k: string]: string;
  };
  /** 是否显示按钮 */
  // isShow?: (key: string, info: Recordable<any>, params?: Recordable<any>) => boolean;
  isShow?: (info: Recordable<any>, opts?: Recordable<any>) => boolean;
  /** 点击按钮二次提示文案 */
  tips?: {
    [k: string]: string | ((content: string, platformType?: string) => string);
  };
}

export interface IButtonConfig {
  [k: string]: IButtonProps;
}

interface ApiConfigContent {
  /** api名称 */
  api: (params1?: any, params2?: any, params3?: any) => Promise<any>;
  /** 外部传入请求参数 */
  otherRequestParams?: any;
}

interface ApiConfig {
  /** 删除接口 */
  deleteRecord?: ApiConfigContent;
  /** 重置密码接口 */
  resetPasswordToRecord?: ApiConfigContent;
  /** 重置签名密码接口 */
  resetSignPasswordToRecord?: ApiConfigContent;
  /** 导出接口 */
  exportInfo?: ApiConfigContent;
  /** 导入接口 */
  importInfo?: ApiConfigContent;
  /** 启用接口 */
  enableUser?: ApiConfigContent;
  /** 禁用接口 */
  unEnableUser?: ApiConfigContent;
}

export interface TreeApi {
  /** 初始化tree接口 */
  init: (params1?: any, params2?: any, params3?: any) => Promise<any>;
  /** 拖拽tree节点接口 */
  drag: (params1?: any, params2?: any, params3?: any) => Promise<any>;
  /** 删除tree节点接口 */
  delete: (params1?: any, params2?: any, params3?: any) => Promise<any>;
  /** 编辑tree节点接口 */
  edit: (params1?: any, params2?: any, params3?: any) => Promise<any>;
  /** 添加tree节点接口 */
  add: (params1?: any, params2?: any, params3?: any) => Promise<any>;
  /** 转移并删除 */
  transfer2Delete: (params1?: any, params2?: any, params3?: any) => Promise<any>;
}
