export {};

declare global {
  interface Window {
    $t: any;
  }

  /**
   * 任意参数对象
   *
   * @author zhanghanrui
   * @date 2024-03-19 19:03:20
   * @interface IParams
   */
  interface IParams {
    [key: string | symbol]: any;
  }

  /**
   * 任意数据对象
   *
   * @author zhanghanrui
   * @date 2024-03-19 19:03:25
   * @interface IData
   */
  interface IData {
    [key: string | symbol]: any;
  }

  /**
   * 任意对象结构
   *
   * @author zhanghanrui
   * @date 2024-03-19 19:03:46
   * @interface IObject
   */
  interface IObject {
    [key: string | symbol]: any;
  }
}
