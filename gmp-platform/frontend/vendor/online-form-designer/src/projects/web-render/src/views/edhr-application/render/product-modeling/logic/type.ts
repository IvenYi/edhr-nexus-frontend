export interface IProductVersion {
  id_: string;
  /** 名称 */
  name_: string;
  /** 产品类型 */
  product_type_: string;
  /** 产品编码 */
  code_?: string;
  /** 描述 */
  description_?: string;
  /** 产品家族id */
  product_family_id_?: string;
  /** 是否是默认 */
  default_: Boolean;
  /** 产品版本 */
  version_: string;
  /** 父的id */
  base_id_: string;
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
  /** 翻译的产品家族 */
  __dict__product_family?: string;
  /** 翻译的产品类型 */
  __dict__product_type?: string;
}

export interface IProduct {
  id_: string;
  /** 名称 */
  name_: string;
  children: IProductVersion[];
}
