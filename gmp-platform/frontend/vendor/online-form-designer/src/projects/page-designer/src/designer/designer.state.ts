import { IDesignerState } from '@gct-paas/design';
import { LowCodeWidget } from '@gct/runtime';

/**
 * 设计器状态管理
 *
 * @author zhanghanrui
 * @date 2024-05-09 14:05:44
 * @export
 * @class DesignerState
 */
export class DesignerState implements IDesignerState {
  /**
   * 设计页面是否正在拖拽中
   *
   */
  isDragging = false;

  /**
   * 当前正在拖拽中的数据(旧拖拽)
   *
   * @deprecated
   * @type {IData | null}
   */
  draggingData: IData | null = null;

  /**
   * 当前鼠标容器悬浮元素(旧拖拽)
   *
   * @deprecated
   * @type {(HTMLDivElement | null)}
   */
  hoverEL: HTMLDivElement | null = null;

  /**
   * 拖拽放置目标容器
   *
   * @type {(LowCodeWidget.BasicSchema | null)}
   */
  dropContainer: LowCodeWidget.BasicSchema | null = null;

  /**
   * 需要扩张的容器列表
   *
   * @type {LowCodeWidget.BasicSchema[]}
   */
  expansionContainerList: LowCodeWidget.BasicSchema[] = [];

  /**
   * 数据变更次数，主要用于复杂结构下，数据变更后的设计界面重绘
   *
   * @type {number}
   */
  count: number = 0;
}
