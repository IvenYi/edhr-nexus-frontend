export interface Org {
  createTime?: string;
  createUserId?: string;
  createUserName?: string;
  fullPath?: string;
  id?: string;
  identifier?: string;
  modifyTime?: string;
  modifyUserId?: string;
  modifyUserName?: string;
  name: string;
  parentId?: string;
  sortNum?: number;
}

export interface DragOrg {
  id: string;
  targetParentId: string;
  targetSortNum?: number;
}

export interface PageReq {
  pageNo: number;
  pageSize: number;
}

export interface QueryDto {
  fullname: string;
  username: string;
  createTime: string[];
  state: number;
  email: string;
  mobile: string;
}
//user table部分
export interface UserTableDto {
  fullname: string;
  username: string;
  empNo: string;
  mobile: string;
  state: number;
  departmentList?: string[];
}
export interface UserListReq {
  email?: string;
  endTime?: string;
  fullname?: string;
  mobile?: string;
  orgId?: number;
  startTime?: string;
  state?: number;
  username?: string;
}

export interface UserModalInfo {
  //两个ID一个意思只是不同接口用不同字段
  id?: string;
  userId?: string;
  avatar?: string;
  fullname: string;
  empNo: string;
  managerId?: string;
  birthday?: string;
  gender?: number;
  username: string;
  mobile?: string;
  password: string;
  confirmPassword: string;
  telephone?: string;
  email?: string;
  createTime?: string;
  platSeat?: boolean;
  suiteSeat?: boolean;
  ext0?: string;
  ext1?: string;
  ext2?: string;
  ext3?: string;
  ext4?: string;
  ext5?: number;
  ext6?: number;
  ext7?: number;
  ext8?: number;
  ext9?: number;
}

export interface userDepartment {
  orgId: string;
  orgName: string;
  principal: number;
  master: number;
  departmentList: Array;
}

export interface UserDto {
  user: UserModalInfo;
  userDepartmentList: userDepartment[];
}

export interface GetUserReq {
  userId: string;
}

export interface UserStateReq {
  userId: string;
  state: number;
}
