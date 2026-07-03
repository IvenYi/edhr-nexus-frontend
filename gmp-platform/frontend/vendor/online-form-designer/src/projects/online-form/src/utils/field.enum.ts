import { FIELD_TYPE, FieldIconMap } from '/@/enums/appEnum';

/**
 * 系统字段枚举
 * @author lingxiaoming
 * @date 2024-06-04 03:12:15
 * @export
 * @enum {number}
 */
export enum SystemField {
  /**
   * 主键
   */
  ID = 'id_',
  /**
   * 创建时间
   */
  CREATE_TIME = 'create_time_',
  /**
   * 创建人id
   */
  CREATE_USER_ID = 'create_user_id_',
  /**
   * 创建人
   */
  CREATE_USER_NAME = 'create_user_name_',
  /**
   * 修改时间
   */
  MODIFY_TIME = 'modify_time_',
  /**
   * 修改人id
   */
  MODIFY_USER_ID = 'modify_user_id_',
  /**
   * 修改人
   */
  MODIFY_USER_NAME = 'modify_user_name_',
  /**
   * 是否删除
   */
  DELETED = 'deleted_',
  /**
   * 引用主模型数据id
   */
  REF_MASTER_ID = 'ref_master_id_',
  /**
   * 引用主模型key
   */
  REF_MASTER_KEY = 'ref_master_key_',
  /**
   * 引用主模型字段key
   */
  REF_FIELD_KEY = 'ref_field_key_',
}

/**
 * 是否是系统属性
 * @author lingxiaoming
 * @date 2024-06-04 03:06:02
 * @export
 * @param {string} key
 * @return {*}  {boolean}
 */
export function isSystemField(key: string): boolean {
  return Object.values(SystemField).includes(key);
}

/**
 * 获取属性的图标
 * @author lingxiaoming
 * @date 2024-06-30 11:03:15
 * @export
 * @param {string} type
 * @return {*}  {string}
 */
export function getFieldIcon(type: string): string {
  if (type === FIELD_TYPE.SIGNATURE) {
    return 'icon-dianziqianmingdd';
  }
  return FieldIconMap[type] || FieldIconMap[FIELD_TYPE.TEXT];
}
