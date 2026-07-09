import { DataTable } from '/@page-designer/types/web';
import type { Ref } from 'vue';
import { onMounted, nextTick } from 'vue';
import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
import { pageLayoutModeEnum, tableColumnWidthEnum } from '@gct/runtime';

export const useTableLayout = (tableBoxRef: Ref, widget: DataTable) => {
  const Event = getPageEvent();
  // console.log(widget.style, Event.pageLayoutMode);
  const { tableheight, tableheightConfigure } = widget.style; /** 是否撑满 */
  //表格是否开始撑满模式  页面配置了撑满模式，表格没有开启固定高度
  const showBoxScroll = Event.pageLayoutMode === pageLayoutModeEnum.SHOW_BOX_SCROLL;
  //autoResize  兼容edhr表格老版本逻辑
  const autoResize = showBoxScroll;

  const tableHeight = autoResize
    ? '100%'
    : tableheightConfigure === tableColumnWidthEnum.ENUMERATION
    ? tableheight + 'px'
    : undefined;

  onMounted(async () => {
    if (showBoxScroll) {
      await nextTick();
      getParentElement(tableBoxRef.value?.$el.parentNode);
    }
  });
  return { tableHeight };
};

function getParentElement(element) {
  while (element) {
    if (element.classList.contains('gct-flex-table-scroll')) return;
    const heightValue = parseFloat(element.style.height);
    const hasHeight = !isNaN(heightValue) && heightValue > 0;
    if (hasHeight) return;
    if (window.getComputedStyle(element).display !== 'flex') {
      element.classList.add('gct-flex-table-scroll');
    } else {
      element.classList.add('gct-max-table-scroll');
    }

    if (element.id === 'gct-scrollbody') {
      /**模态框内部特殊逻辑 */
      return;
    }

    element = element.parentNode;
  }
}
