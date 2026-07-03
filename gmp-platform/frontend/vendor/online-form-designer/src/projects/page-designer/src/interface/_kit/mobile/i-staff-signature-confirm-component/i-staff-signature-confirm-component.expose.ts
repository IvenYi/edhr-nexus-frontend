/**
 * 人员确认组件
 * @interface IStaffSignatureConfirmComponentExpose
 */

export interface IStaffSignatureConfirmComponentExpose {
  // 签名事务关联ID
  relationId: string;

  /**
   * 签名信息清空，relationId重新生成
   */
  reset: () => void;

  /**
   * 校验签名是否通过
   * @return {Promise<void>} 异步校验函数，校验不通过则抛出错误
   */
  fullValidate() : Promise<void>;

  /**
   * 获取用户签名信息与用户签名状态
   * @return {Array}
   */
  getValue() : Array<IObject>
}