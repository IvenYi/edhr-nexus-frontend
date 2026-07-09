import { LowCodeWidget } from '../widget-basic-types';
import { IVue3DndItemHooks } from '/@/projects/page-designer/src/designer/interface';

export interface ExportWidgetSchema {
  [key: string]: LowCodeWidget.BasicSchema;
}

export interface ExportWidgetPropEditors {
  [key: string]: LowCodeWidget.PropEditor[];
}

export interface ExportWidgetStyleEditors {
  [key: string]: LowCodeWidget.StyleEditor[];
}

export interface ExportWidgetEvents {
  [key: string]: LowCodeWidget.EventsType[];
}
export interface ExportWidgetHooks {
  [key: string]: IVue3DndItemHooks;
}

export interface ExportWidgetWhiteList {
  [key: string]: (string | RegExp)[];
}

export interface ExportWidgetBlackList {
  [key: string]: (string | RegExp)[];
}

export interface ExportWidgetCallback {
  [key: string]: LowCodeWidget.RunCallback;
}

export interface ExportWidgetBeforeCreate {
  [key: string]: LowCodeWidget.beforeCreate;
}

export interface ExportWidgetLoopCallback {
  [key: string]: LowCodeWidget.loopCallback;
}

export interface ExportWidgetDesignerConfig {
  [key: string]: LowCodeWidget.DesignerConfig;
}
