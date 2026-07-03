export interface BasicInfo {
  createTime: string;
  createUserId: string;
  createUserName: string;
  modifyTime: string;
  modifyUserId: string;
  modifyUserName: string;
}

export interface PageListDataType extends BasicInfo {
  info: string;
  key: string;
  type: string;
}

export interface I18nTableColumnType extends BasicInfo {
  id: string;
  configured: number;
  defaultLanguage: number;
  language: string;
  languageTag: string;
  state: number
}


export interface I18nInfoDeleteApiReq {
  ids: string;
}

export interface I18nPageListApiReq {
  pageNo: number;
  pageSize: number;
  searchKey: string;
}

export interface I18nSaveOrChangeApiReq {
  info: string;
  type: string;
  key: string;
}

export interface I18nPageListApiRes {
  data: PageListDataType;
  pageNo: number;
  pageSize: number;
  totalCount: number;
  totalPage: number;
}


