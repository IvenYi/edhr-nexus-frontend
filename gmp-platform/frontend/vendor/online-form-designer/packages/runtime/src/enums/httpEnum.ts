/**
 * @description: Request result set
 */
export enum ResultEnum {
  SUCCESS = 200,
  ERROR = -1,
  TIMEOUT = 401,
  TYPE = 'success',
}

/**
 * @description: request method
 */
export enum RequestEnum {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

/**
 * @description:  contentType
 */
export enum ContentTypeEnum {
  // json
  JSON = 'application/json;charset=UTF-8',
  // form-data qs
  FORM_URLENCODED = 'application/x-www-form-urlencoded;charset=UTF-8',
  // form-data  upload
  FORM_DATA = 'multipart/form-data;charset=UTF-8',
}

export enum BizServiceEnum {
  submit = 'post',
  listByIds = 'get',
  getone = 'post',
  listAll = 'post',
  listByPage = 'post',
  listTree = 'post',
  save = 'post',
  saveOrUpdate = 'post',
  saveBatch = 'post',
  importData = 'post',
  exportData = 'post',
  remove = 'post',
  removeById = 'delete',
  removeByIds = 'delete',
  update = 'put',
  updateById = 'put',
  updateByIds = 'put',
  rdoSave = 'post',
  rdoListAll = 'post',
  rdoListByPage = 'post',
  rdoListVersionById = 'get',
  rdoSaveVersion = 'post',
  rdoSaveBatch = 'post',
  rdoUpdateVersionById = 'put',
  rdoRemoveVersionById = 'delete',
  rdoRemoveById = 'delete',
  rdoGetVersionById = 'get',
  getOne = 'post',
  rdoGetVersionByRefId = 'post',
  getById = 'get',
  rdoListAllVersion = 'post',
  rdoRefListByPage = 'post',
  export = 'post',
  import = 'post',
  rdoExport = 'post',
  rdoImport = 'post',
  biz_search = 'post',
}

// export enum handelProcess {
//   AGREE = 'agree',
//   REJECT = 'reject',
//   WITHDRAW = 'withdraw',
//   ROLLBACK = 'rollback',
// }
