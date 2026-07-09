export interface IProductFamily {
  id_: string;
  /** 名称 */
  name_: string;
  /** 产品家族编码 */
  code_?: string;
  /** 描述 */
  description_?: string;
  tenant_id_: string;
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
}
