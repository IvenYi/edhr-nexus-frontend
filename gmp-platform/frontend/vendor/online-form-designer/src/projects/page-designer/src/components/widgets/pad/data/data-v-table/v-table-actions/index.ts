import { onUnmounted } from 'vue';
import { IVTableOperationColumn } from '@gct/universal-component/gct-v-table';
import { Events } from '/@web-render/render/Event/baseEvent';
import { VTableBaseAction } from './v-table-base-action';
import { FormComponents, LowCodeWidget } from '@gct/runtime';
import { VTableCustomAction } from './v-table-custom-action';
import { VTableEditAction } from './v-table-edit-action';
import { VTableJumpAction } from './v-table-jump-action';
import { VTableDetailAction } from './v-table-detail-action';

function transformActionColumn(
  table,
  event: Events,
  widget: IObject,
  moreActions?: IObject[],
): VTableBaseAction[] {
  const childActions: VTableBaseAction[] = [];
  let action: VTableBaseAction;
  switch (widget.type) {
    case FormComponents.CustomButton:
      action = new VTableCustomAction(table, event, widget);
      break;
    case FormComponents.SubTableEditBtn:
      action = new VTableEditAction(table, event, widget);
      break;
    case FormComponents.TableLinkButton:
      action = new VTableJumpAction(table, event, widget);
      break;
    case FormComponents.TableInfoButton:
      action = new VTableDetailAction(table, event, widget);
      break;
    default:
      action = new VTableBaseAction(table, event, widget);
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
    const allActions: VTableBaseAction[] = [];
    const btns = widget.children || [];
    // 第一层按钮的配置信息
    const actions: IVTableOperationColumn['actions'] = [];
    btns.forEach((widget: IObject) => {
      const childItems: VTableBaseAction[] = transformActionColumn(table, event, widget);
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
