import { defineComponent, ref, onBeforeUnmount } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { ReportDataSetDesignEditorPanel } from './report-data-set-design-editor-panel';
import { ReportDataSetItemEditPanel } from './report-data-set-item-edit-panel';
import { useReportDataSetDesignStore } from '../store';
import './model-config.scss';

export const ModelConfig = defineComponent({
  name: 'ModelConfig',
  setup() {
    const ns = useNamespace('model-config');
    const store = useReportDataSetDesignStore();

    const configHeight = ref(384); // 默认高度
    const MIN_HEIGHT = 100; // 最低高度
    const isDragging = ref(false);
    let startY: number = 0;
    let startHeight: number = 0;

    /**
     * 处理鼠标按下事件，开始拖拽调整高度
     * @param event - 鼠标事件对象
     */
    const handleMouseDown = (event: MouseEvent): void => {
      isDragging.value = true;
      startY = event.clientY;
      startHeight = configHeight.value;
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      event.preventDefault(); // 防止拖拽时选中文本
    };

    /**
     * 处理鼠标移动事件，实时调整Config面板高度
     * @param event - 鼠标事件对象
     */
    const handleMouseMove = (event: MouseEvent): void => {
      if (!isDragging.value) return;
      const deltaY: number = event.clientY - startY;
      // 当拖拽手柄向上移动 (deltaY < 0)，config 面板高度增加
      // 当拖拽手柄向下移动 (deltaY > 0)，config 面板高度减小
      let newHeight: number = startHeight - deltaY;

      if (newHeight < MIN_HEIGHT) {
        newHeight = MIN_HEIGHT;
      }
      // 可选：如果需要最大高度，在此处添加限制
      // const parentElement = (event.target as HTMLElement)?.closest(ns.b());
      // if (parentElement) {
      //   const designPanelMinHeight = 50; // 假设 design 面板的最小高度
      //   const handleHeight = 8; // 拖拽手柄的高度
      //   const maxHeight = parentElement.clientHeight - designPanelMinHeight - handleHeight;
      //   if (newHeight > maxHeight) newHeight = maxHeight;
      // }
      configHeight.value = newHeight;
    };

    /**
     * 处理鼠标松开事件，结束拖拽
     */
    const handleMouseUp = (): void => {
      if (isDragging.value) {
        isDragging.value = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      }
    };

    // 组件卸载前移除事件监听器
    onBeforeUnmount(() => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    });

    return { ns, store, configHeight, handleMouseDown };
  },
  render() {
    const isActive = !!(this.store.active || this.store.activeLink);
    return (
      <div class={this.ns.b()}>
        {this.store.nodes.length === 0 ? (
          <div class={this.ns.e('empty')}>
            <div class={this.ns.e('empty-content')}>
              <img src="/assets/data-set/design-empty.svg" />
            </div>
            <div class={this.ns.e('empty-text')}>{ window.$t('sys.dataSet.emptyText')}</div>
          </div>
        ) : null}
        <div class={this.ns.e('design')}>
          <ReportDataSetDesignEditorPanel />
        </div>
        {isActive ? (
          <div class={this.ns.e('resize-handle')} onMousedown={this.handleMouseDown} />
        ) : null}
        {isActive ? (
          <div class={this.ns.e('config')} style={{ height: `${this.configHeight}px` }}>
            <ReportDataSetItemEditPanel />
          </div>
        ) : null}
      </div>
    );
  },
});
