import { VNodeChild } from 'vue';

interface CustomRenderProps {
  /**
   * 行数据
   * @author lingxiaoming
   * @date 2024-07-12 05:37:58
   * @type {IData}
   */
  record: IData;
}

/**
 * 表格项
 *
 * @author zhanghanrui
 * @date 2024-04-15 17:04:06
 * @export
 * @interface ITableItem
 */
export interface ITableItem {
  /**
   * 表格项标识
   *
   * @author zhanghanrui
   * @date 2024-04-17 09:04:20
   * @type {string}
   */
  name: string;
  /**
   * 数据标识（给 a-table 用）
   *
   * @author zhanghanrui
   * @date 2024-04-15 17:04:14
   * @type {string}
   */
  dataIndex: string;
  /**
   * 数据标题
   *
   * @author zhanghanrui
   * @date 2024-04-15 17:04:51
   * @type {string}
   */
  title: string;
  /**
   * 实际属性，未配置默认识别 dataIndex
   *
   * @description 支持单一和数组两种形式
   * @author zhanghanrui
   * @date 2024-04-15 17:04:07
   * @type {(string[] | string)}
   */
  fields?: string[] | string;
  /**
   * 表格项模式，不配置默认为 default
   *
   * @default 'default'
   * @author zhanghanrui
   * @date 2024-04-15 17:04:09
   * @type {('default' | 'edit' | 'actions' | 'link')} '默认只呈现' | '编辑项' | '操作列' | '链接'
   */
  type?: 'default' | 'edit' | 'actions' | 'link';

  /**
   * 列宽度
   * @author lingxiaoming
   * @date 2024-07-13 03:06:22
   * @type {number}
   */
  width?: number;

  /**
   * 固定列位置
   *
   * @type {('left' | 'right')}
   */
  fixed?: 'left' | 'right';

  /**
   * 是否可调整列宽
   *
   * @type {boolean}
   */
  resizable?: boolean;

  /**
   * 链接模式下的点击回调
   *
   */
  click?: (record: IData) => void;

  /**
   * 自定义绘制
   * @author lingxiaoming
   * @date 2024-07-12 05:36:02
   */
  customRender?: (props: CustomRenderProps) => VNodeChild | JSX.Element;
  /**
   * 是否单行省略
   */
  ellipsis?: Boolean;
}
