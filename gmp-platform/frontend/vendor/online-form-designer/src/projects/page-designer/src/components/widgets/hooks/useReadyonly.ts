import { inject, provide } from 'vue';
import { SUB_TABLE_EDIT_MODE, WidgetInScopeEnum } from '/@/projects/page-designer/src/enum';

export function useReadyonly(readonly) {
  const widgetInScope = inject('widgetInScope', null);
  const editMode = inject('editMode', null);
  const subTableReadonly = inject('subTableReadonly');

  if (
    editMode === SUB_TABLE_EDIT_MODE.MODAL &&
    widgetInScope !== WidgetInScopeEnum.GCT_SUB_TABLE_MODAL
  ) {
    return true;
  }
  return readonly || subTableReadonly?.value;
}

export function useDisabled(disabled) {
  const subTableDisabled = inject('subTableDisabled');

  return disabled || subTableDisabled?.value;
}
