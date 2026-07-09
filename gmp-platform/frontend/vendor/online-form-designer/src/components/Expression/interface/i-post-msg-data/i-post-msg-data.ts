import { ICustomMarkerData } from '../i-custom-marker-data/i-custom-marker-data';

/**
 * 消息数据结构
 *
 * @export
 * @interface IPostMsgData
 */
export interface IPostMsgData {
  /**
   * 消息类型
   *
   * @type {string}
   */
  type: 'expression-language-service';
  /**
   * 触发事件
   *
   * @type {'change'}
   */
  event: 'change';
  /**
   * 异常信息
   *
   * @type {ICustomMarkerData[]}
   */
  errors: ICustomMarkerData[];
  /**
   * 代码
   *
   * @type {*}
   */
  data: any;
}
