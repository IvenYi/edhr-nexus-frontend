import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
import type { CellWidget } from '/@online-form/views/designer/types/cell-widget';
import type { IBindField } from '@gct/nocode-base';
import type { PaperWidget } from '/@online-form/views/types/paper-widget';
import type { IReverseModelItem } from '../../../hooks/reverse-modeling/types';

export type Callbacks = {
  onFieldDrop?: (fieldMeta: IBindField, fieldWidget: CellWidget.BasicSchema, opts?: any) => void;
  onWidgetDrop?: (widgetMeta: PaperWidget.BasicSchema, opts?: any, event?: DragEvent) => void;
  onReverseModelingDrop?: (data: IReverseModelItem) => void;
};

export enum TransferType {
  Field = 'field',
  Widget = 'widget',
  ReverseModeling = 'reverse-modeling',
}
export type TransferData =
  | {
      type: TransferType.Field;
      data: IBindField;
    }
  | {
      type: TransferType.Widget;
      data: PaperWidget.BasicSchema;
    }
  | {
      type: TransferType.ReverseModeling;
      data: IReverseModelItem;
    };

export const DragTransferKey = '__drag_transfer__' as const;

/**
 * 设置传输数据
 * @author lingxiaoming
 * @date 2024-06-27 09:28:16
 * @param {DataTransfer} transfer
 * @param {IBindField} field
 */
export function setTransferData(e: DragEvent, data: TransferData) {
  e.dataTransfer!.setData(DragTransferKey + 'data', JSON.stringify(data));
  e.dataTransfer!.setData(DragTransferKey, '');
  e.dataTransfer!.setData(DragTransferKey + data.type, '');
}

/**
 * 获取传输的数据
 * @author lingxiaoming
 * @date 2024-06-27 09:39:09
 * @param {DataTransfer} transfer
 * @return {*}
 */
function getTransFerData(e: DragEvent) {
  const dataStr = e.dataTransfer!.getData(DragTransferKey + 'data');
  let result: TransferData | undefined = undefined;
  if (dataStr) {
    try {
      result = JSON.parse(dataStr);
    } catch (error) {
      console.error('数据不是json');
    }
  }
  return result;
}

export function useDrop(allowTypes: TransferType[], callbacks: Callbacks = {}) {
  const { getFieldWidget } = useSpreadSheet();

  function handleDrop(e: DragEvent, opts?: any) {
    e.preventDefault();

    const data = getTransFerData(e);
    if (allowTypes.includes(TransferType.Field) && data?.type === TransferType.Field) {
      callbacks.onFieldDrop?.(data.data, getFieldWidget(data.data), opts);
    } else if (allowTypes.includes(TransferType.Widget) && data?.type === TransferType.Widget) {
      callbacks.onWidgetDrop?.(data.data, opts, e);
    } else if (
      allowTypes.includes(TransferType.ReverseModeling) &&
      data?.type === TransferType.ReverseModeling
    ) {
      callbacks.onReverseModelingDrop?.(data.data);
    }
  }

  function handleDragOver(e: DragEvent) {
    const types = e.dataTransfer!.types;
    if (!types.includes(DragTransferKey)) {
      // 其他方式的拖拽事件不处理
      return;
    }

    /** 有允许拖拽的类型的标识时 */
    const hasAllow = allowTypes.some((type) => types.includes(DragTransferKey + type));
    if (hasAllow) {
      e.preventDefault();
    }
  }

  return {
    handleDrop,
    handleDragOver,
  };
}
