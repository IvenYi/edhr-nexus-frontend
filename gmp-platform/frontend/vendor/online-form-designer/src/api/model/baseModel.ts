export interface BasicPageParams {
  page: number;
  pageSize: number;
}

export interface BasicFetchResult<T> {
  items: T[];
  total: number;
}

export interface BasicInfo {
  createTime: string;
  createUserId: string;
  createUserName: string;
  modifyTime: string;
  modifyUserId: string;
  modifyUserName: string;
}
