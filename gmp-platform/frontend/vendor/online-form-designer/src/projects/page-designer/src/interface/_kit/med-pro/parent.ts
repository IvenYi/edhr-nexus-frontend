interface CommonFields {
  /**
   * 主键
   *
   * @author bingo
   * @type {string}
   */
  id_: string,

  /**
   * 创建时间
   *
   * @author bingo
   * @type {Date}
   */
  create_time_: Date,

  /**
   * 创建人ID
   *
   * @author bingo
   * @type {string}
   */
  create_user_id_: string,
  /**
   * 创建人所属部门ID
   *
   * @author bingo
   * @type {string}
   */
  create_org_id_: string,

  /**
   * 最后修改时间
   *
   * @author bingo
   * @type {Date}
   */
  modify_time_: Date,

  /**
   * 最后修改人ID
   *
   * @author bingo
   * @type {string}
   */
  modify_user_id_: string,

  /**
   * 最后修改人所属部门ID
   *
   * @author bingo
   * @type {string}
   */
  modify_org_id_: string,

  /**
   * 租户ID
   *
   * @author bingo
   * @type {string}
   */
  tenant_id_: string
}


interface NdoFields {
  /**
   * 名称
   *
   * @author bingo
   * @type {string}
   */
  name_: string,

  /**
   * 描述
   *
   * @author bingo
   * @type {string}
   */
  description_: string
}


interface RdoFields {
  /**
   * 名称
   *
   * @author bingo
   * @type {string}
   */
  name_: string,

  /**
   * 版本
   *
   * @author bingo
   * @type {string}
   */
  version_: string,


  /**
   * 是否默认版本
   *
   * @author bingo
   * @type {boolean}
   */
  default_: boolean,

  /**
   * 描述
   *
   * @author bingo
   * @type {string}
   */
  description_: string
}


interface ExecuteParams {
  /**
   * 事务主体
   *
   * @author bingo
   * @type {string}
   */
  txn_subject_id_: string,
  /**
   * 事务KEY
   *
   * @author bingo
   * @type {string}
   */
  txn_key_: string,

  /**
   * 当前工步
   *
   * @author bingo
   * @type {string}
   */
  workflow_step_id_?: string,

  /**
   * 设备多选
   *
   * @author bingo
   * @type {string}
   */
  device_ids_?: string,


  /**
   * 治具多选
   *
   * @author bingo
   * @type {string}
   */
  fixture_ids_?: string,

  /**
   * 数据采集
   *
   * @author bingo
   * @type {Array}
   */
  data_collection_values?: []
}



