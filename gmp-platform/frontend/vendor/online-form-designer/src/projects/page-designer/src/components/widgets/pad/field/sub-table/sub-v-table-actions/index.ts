import { onUnmounted } from 'vue';
import { IVTableOperationColumn } from '@gct/universal-component/gct-v-table';
import { Events } from '/@web-render/render/Event/baseEvent';
import { FormComponents, LowCodeWidget } from '@gct/runtime';
import { SubVTableBaseAction } from './sub-v-table-base-action';
import { SubVTableCopyAction } from './sub-v-table-copy-action';
import { SubVTableCustomAction } from './sub-v-table-custom-action';
import { SubVTableDeleteAction } from './sub-v-table-delete-action';
import { SubVTableEditAction } from './sub-v-table-edit-action';

function transformActionColumn(
  table,
  event: Events,
  widget: IObject,
  moreActions?: IObject[],
): SubVTableBaseAction[] {
  const childActions: SubVTableBaseAction[] = [];
  let action: SubVTableBaseAction;
  switch (widget.type) {
    case FormComponents.CustomButton:
      action = new SubVTableCustomAction(table, event, widget);
      break;
    case FormComponents.SubTableEditBtn:
      action = new SubVTableEditAction(table, event, widget);
      break;
    case FormComponents.SubTableCopyBtn:
      action = new SubVTableCopyAction(table, event, widget);
      break;
    case FormComponents.SubTableDeleteBtn:
      action = new SubVTableDeleteAction(table, event, widget);
      break;
    default:
      action = new SubVTableBaseAction(table, event, widget);
  }
  if (moreActions && moreActions.length > 0) {
    moreActions.map((item: IObject) => {
      const actions = transformActionColumn(table, event, item);
      childActions.push(...actions);
      action.config.children = childActions.map((action) => action.config);
    });
  }
  return [action, ...childActions];
}

export function useDataTableActionsConfig(
  table,
  widget: LowCodeWidget.BasicSchema,
  event: Events,
): IVTableOperationColumn | null {
  if (widget && widget.children && widget.children.length > 0) {
    // 记录所有的按钮实例，方便销毁
    const allActions: SubVTableBaseAction[] = [];
    const btns = widget.children || [];
    // 第一层按钮的配置信息
    const actions: IVTableOperationColumn['actions'] = [];
    btns.forEach((widget: IObject) => {
      const childItems: SubVTableBaseAction[] = transformActionColumn(table, event, widget);
      allActions.push(...childItems);
      const actionItem = childItems[0].config!;
      actions.push(actionItem);
    });
    // 操作列的表格配置
    const columnConfig: IVTableOperationColumn = {
      name: 'actions',
      title: '操作',
      type: 'actions',
      fixed: 'right',
      width: widget.style.columnwidth || 'auto',
      visibleButtons: widget.props.visibleButtons,
      actions,
      _item: widget,
    };
    onUnmounted(() => {
      // 销毁所有的按钮实例
      allActions.forEach((action) => {
        action.destroy();
      });
    });
    return columnConfig;
  }
  return null;
}
