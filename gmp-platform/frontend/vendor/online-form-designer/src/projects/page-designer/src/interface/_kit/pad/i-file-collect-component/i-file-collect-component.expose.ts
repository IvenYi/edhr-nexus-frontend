/**
 * @interface IFileCollectComponentExpose
 */
interface ReloadParam {
  product_id_: string;
  spec_id_: string;
  device_ids_?: string[];
  cycle_spot_check_plan_id_?: string;
  maintenance_plan_id_?: string;
}
export interface IFileCollectComponentExpose {
  /**
   * 返回数据采集输入数据
   */
  getValue: () => any[];

  /**
   * 重栽数据采集配置数据
   */
  reload: (queryParam: ReloadParam) => Promise<void>;

  reset: () => void;
}
