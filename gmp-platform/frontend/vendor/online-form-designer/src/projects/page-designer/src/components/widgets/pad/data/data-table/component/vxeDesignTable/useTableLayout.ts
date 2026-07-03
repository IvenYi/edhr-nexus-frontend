import { DataTable } from '/@page-designer/types/web';
import { useDesigner } from '/@page-designer/hooks/useDesigner';
import { toRefs, toRef, ref, watch } from 'vue';
import { pageLayoutModeEnum, tableColumnWidthEnum } from '@gct/runtime';

export const useTableLayout = (widget: DataTable) => {
  const { pageJson } = useDesigner();
  const { tableheight, tableheightConfigure } = toRefs(widget.style);
  const height = toRef(() => {
    if (tableheightConfigure?.value === tableColumnWidthEnum.ENUMERATION) {
      return tableheight.value;
    }
  });
  watch(
    () => pageJson.pageLayoutMode,
    (mode) => {
      if (mode === pageLayoutModeEnum.SHOW_BOX_SCROLL) {
        widget.style.tableheightConfigure = tableColumnWidthEnum.AUTO_PARENT_BOX;
      }
    },
  );
  return { height };
};
