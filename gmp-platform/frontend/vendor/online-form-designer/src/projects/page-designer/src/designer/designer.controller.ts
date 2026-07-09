import { reactive } from 'vue';
import { LowCodeWidget } from '@gct/runtime';
import { IDesignerController } from '@gct-paas/design';
import { DesignerState } from './designer.state';
import { DesignerHooks } from './designer.hooks';

/**
 * 设计界面控制器
 *
 * @author zhanghanrui
 * @date 2024-05-09 14:05:12
 * @export
 * @class DesignerController
 */
export class DesignerController implements IDesignerController {
  /**
   * 设计界面状态
   *
   * @author zhanghanrui
   * @date 2024-05-09 14:05:19
   */
  readonly state = reactive(new DesignerState());

  readonly hooks = new DesignerHooks();

  /**
   * 鼠标悬浮元素清单
   *
   * @author zhanghanrui
   * @date 2024-05-10 10:05:47
   * @type {HTMLDivElement[]}
   */
  readonly hoverStack: HTMLDivElement[] = [];

  /**
   * 拖拽设计区容器
   *
   * @author zhanghanrui
   * @date 2024-05-10 13:05:46
   * @type {HTMLDivElement}
   */
  stageContainer!: HTMLDivElement;

  /**
   * 拖拽展开定时器
   *
   * @type {(number | null)}
   */
  expansionTimer: number | null = null;

  /**
   * 设置拖拽数据
   *
   * @author zhanghanrui
   * @date 2024-05-09 14:05:31
   * @param {(IData | null)} data
   */
  setDragData(data: IData | null): void {
    this.state.draggingData = data;
  }

  /**
   * 获取当前拖拽数据
   *
   * @author zhanghanrui
   * @date 2024-05-09 14:05:49
   * @return {*}  {(IData | null)}
   */
  getDragData(): IData | null {
    return this.state.draggingData;
  }

  /**
   * 新增鼠标悬浮堆栈
   *
   * @author zhanghanrui
   * @date 2024-05-10 10:05:02
   * @param {HTMLDivElement} el
   */
  pushStack(el: HTMLDivElement): void {
    this.hoverStack.push(el);
    this.state.hoverEL = el;
  }

  /**
   * 删除鼠标悬浮堆栈
   *
   * @author zhanghanrui
   * @date 2024-05-08 11:05:53
   * @param {HTMLDivElement} el
   */
  popStack(el: HTMLDivElement): void {
    const i = this.hoverStack.findIndex((item) => item === el);
    if (i !== -1) {
      this.hoverStack.splice(i, 1);
    }
    if (this.hoverStack.length > 0) {
      const hEl = this.hoverStack[this.hoverStack.length - 1];
      this.state.hoverEL = hEl;
    } else {
      this.state.hoverEL = null;
    }
  }

  /**
   * 重置悬浮缓存
   *
   * @author zhanghanrui
   * @date 2024-05-15 11:05:51
   */
  resetStack(): void {
    this.hoverStack.splice(0, this.hoverStack.length);
    this.state.hoverEL = null;
  }

  /**
   * 添加展开容器
   *
   * @param {LowCodeWidget.BasicSchema[]} widgets
   * @returns {*}  {void}
   */
  setExpansion(widgets: LowCodeWidget.BasicSchema[]): void {
    if (this.state.isDragging !== true) {
      return;
    }
    if (this.expansionTimer) {
      clearTimeout(this.expansionTimer);
      this.expansionTimer = null;
    }
    this.expansionTimer = setTimeout(() => {
      const items = this.hooks.expansion.callSync([]);
      items.push(...widgets);
      // 暂时只取最后3层展开
      items.slice(items.length - 3).forEach((widget) => {
        const i = this.state.expansionContainerList.findIndex((item) => item.id === widget.id);
        if (i === -1) {
          this.state.expansionContainerList.push(widget);
        }
      });
    }, 2000) as unknown as number;
  }

  /**
   * 取消展开容器
   */
  cancelExpansion(): void {
    if (this.expansionTimer) {
      clearTimeout(this.expansionTimer);
      this.expansionTimer = null;
    }
    this.state.expansionContainerList = [];
  }

  /**
   * 强制设计界面重绘
   *
   */
  force(): void {
    this.state.count += 1;
  }

  /**
   * 重新计算选中高亮
   */
  changeSelectHighlight(): void {
    this.hooks.selectHighlightChange.callSync(null);
  }

  /**
   * 重新计算悬浮高亮
   */
  changeHoverHighlight(): void {
    this.hooks.hoverHighlightChange.callSync(null);
  }

  /**
   * 设置选中
   *
   * @param {string} key
   */
  setSelect(key: string): void {
    this.hooks.setSelect.callSync(null, key);
  }
}
