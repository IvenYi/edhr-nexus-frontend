export interface ITimelineItem {
  /**
   * 唯一标识
   */
  id: string;

  /**
   * 指定颜色
   */
  color?: string;

  [key: string]: any;
}
