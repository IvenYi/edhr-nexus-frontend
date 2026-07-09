export interface DataBasic {
  id: string;
  name: string;
  createTime: string;
  createUserId: string;
  createUserName: string;
  modifyTime: string;
  modifyUserId: string;
  modifyUserName: string;
}

export const enum ApplicationCategory {
  newBlankApplication = 'newBlankApplication',
  newTplApplication = 'newTplApplication',
  editApplication = 'editApplication',
}

export interface ResponseType {
  code: number;
  message: string;
  messageData: [];
  subCode: string;
  subMessage: string;
  [index: string]: any;
}

export interface ManagerListType extends DataBasic {
  avatar: string;
  birthday: string;
  email: string;
  empNo: string;
  fullname: string;
  gender: 0; // 0 女, 1 男, -1 保密
  id: string;
  managerId: string;
  mobile: string;
  password: string;
  state: 0; // 账号状态 : 0 禁用, 1 启用
  telephone: string;
  username: string;
}

export interface orgListType extends DataBasic {
  fullPath: string;
  identifier: string;
  parentId: string;
  sortNum: number;
}

export interface UserInfo {
  empNo: string;
  fullname: string;
  id: string;
  nameDuplicate: boolean;
  username: string;
}

export interface OrgListInfo extends DataBasic {
  fullPath: string;
  identifier: string;
  parentId: string;
  sortNum: number;
}

// 应用管理
export interface ApplicationType extends DataBasic {
  description: string;
  logo: string;
  tenantId: string;
  version?: string;
  isSelected?: boolean;
}

export interface saveTenantApiReq {
  domainPrefix: string;
  managerIds: Array<string>;
  name: string;
  orgIds: Array<string>;
  state: number;
}

export interface deleteTenentApiReq {
  ids: string;
}

export interface tenantChangeApiReq {
  domainPrefix: string;
  managerIds: Array<string>;
  name: string;
  orgIds: Array<string>;
  state: number | null;
}

export interface tenantPageListReq {
  name: string;
  state: number | null;
  startTime: string;
  endTime: string;
  pageNo: number;
  pageSize: number;
}

export interface getTenantInfoApiReq {
  id: string;
}

export interface userFilterApiReq {
  keyword: string;
}

export interface getTenantListApiRes extends DataBasic {
  managerList: ManagerListType[];
  orgList: orgListType[];
  domainPrefix: string;
  state: number;
}

export interface getTenantPageListApiRes {
  data: getTenantListApiRes[];
  pageNo: number;
  pageSize: number;
  totalCount: number;
  totalPage: number;
}

export interface getTenantInfoApiRes extends DataBasic {
  managerList: ManagerListType[];
  orgList: orgListType[];
  domainPrefix: string;
  state: number;
}

export interface modifyApplicationReq {
  description: string;
  logo: string;
  name: string;
  tenantId: string;
  version: string;
}
