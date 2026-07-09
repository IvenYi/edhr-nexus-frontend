export interface IEdhrUse {
  id_: string;
  /** 产品关联 */
  product_ref_: string;
  /** 产品家族关联 */
  product_family_id_: string;
  /** edhrId */
  edhr_id_: string;
  tenant_id_: string;
  /** 关联放行表单id */
  product_release_ref_: string;
  // 创建相关
  create_time_: string;
  create_user_id_: string;
  create_user_name_: string;
  create_org_id_: string;
  //修改相关
  modify_time_: string;
  modify_user_id_: string;
  modify_user_name_: string;
  modify_org_id_: string;
  //翻译字段
  __dict__product_ref_: string;
  __dict__product_family_id_: string;
  __dict__edhr_id_: string;
  __dict__product_release_ref_: string;
}
