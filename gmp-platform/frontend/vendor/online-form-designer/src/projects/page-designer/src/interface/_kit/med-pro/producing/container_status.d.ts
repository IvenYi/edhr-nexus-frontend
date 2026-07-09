/**
 *模型名称：批次状态
 *模型KEY:enu_container_status
 */
interface ContainerStatus{
  /**
   * 运行
   *
   * @author zyl
   * @type {string}
   */
running: string,


  /**
   * 等待
   *
   * @author zyl
   * @type {string}
   */
waiting: string,


  /**
   * 搁置
   *
   * @author zyl
   * @type {string}
   */
hold: string,


  /**
   * 关闭
   *
   * @author zyl
   * @type {string}
   */
close: string,


  /**
   * 完成
   *
   * @author zyl
   * @type {string}
   */
finish: string,


}
