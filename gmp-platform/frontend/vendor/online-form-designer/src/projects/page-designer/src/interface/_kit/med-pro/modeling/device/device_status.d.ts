/**
 *模型名称：设备状态
 *模型KEY:enu_device_status
 */
interface DeviceStatus{
  /**
   * 已报废
   *
   * @author zyl
   * @type {string}
   */
scrapped: string,


  /**
   * 未使用
   *
   * @author zyl
   * @type {string}
   */
unused: string,


  /**
   * 使用中
   *
   * @author zyl
   * @type {string}
   */
using: string,


  /**
   * 保养中
   *
   * @author zyl
   * @type {string}
   */
maintaining: string,


  /**
   * 维修中
   *
   * @author zyl
   * @type {string}
   */
overhauling: string,


}
