export type { IDesignViewActions } from './actions/i-design-view.actions';
export type { IDesignViewState } from './state/i-design-view.state';
export type { IDesignViewOptions } from './i-design-view-options/i-design-view-options';

export type * from './design';

export type { IDragDataItem } from './i-drag-data-item/i-drag-data-item';
export type { IDragItem } from './i-drag-item/i-drag-item';
export type { IDragCollect } from './i-drag-collect/i-drag-collect';
export type { IDropCollect } from './i-drop-collect/i-drop-collect';
export type { IDropResult, IDropResultData } from './i-drop-result/i-drop-result';
export type { IMaterialData } from './i-material-data/i-material-data';
export type { IMaterialGroup } from './i-material-group/i-material-group';

export type { IDesignViewController } from './controller/i-design-view.controller';
export type { INodeController } from './controller/i-node.controller';

export type { INodeProvider } from './provider/i-node-provider';

export type { IDesignItemAction } from './i-design-item-action/i-design-item-action';

export * from './editor';

/**
 * 偏移矩形参数
 *
 * @export
 * @interface IHalfRect
 */
export interface IHalfRect {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface IPosRect extends IHalfRect {
  width: number;
  height: number;
}
