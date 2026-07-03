export interface BasicEnumInfo {
  createTime: string;
  createUserId: string;
  createUserName: string;
  modifyTime: string;
  modifyUserId: string;
  modifyUserName: string;
}

export interface GetEnumModelResponse extends BasicEnumInfo {
  id: string;
  enumModelId: string;
  value: string;
  text: string;
  sortNum: number;
}
