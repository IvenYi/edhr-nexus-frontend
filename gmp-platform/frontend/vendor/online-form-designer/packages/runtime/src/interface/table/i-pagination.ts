/**
 * 分页的模型
 * @author lingxiaoming
 * @date 2024-07-13 09:51:10
 * @export
 * @interface IPagination
 */
export interface IPagination {
  /**
   * 是否显示分页大小切换器
   * @author lingxiaoming
   * @date 2024-07-13 01:36:25
   * @type {boolean}
   */
  showSizeChanger?: boolean;

  /**
   * 指定每页可以显示多少条的集合
   * @author lingxiaoming
   * @date 2024-07-13 01:37:49
   * @type {((number)[])}
   */
  pageSizeOptions?: number[];

  /**
   * 是否显示总数
   * @author lingxiaoming
   * @date 2024-07-13 01:40:11
   */
  showTotal?: boolean | ((total: number, range: [number, number]) => any);
}
