import { CategoryTypeEnum } from '../enum';
import { LowCodeWidget } from './widget-basic-types';

export interface ToolkitWidgetGroup {
  categoryType: CategoryTypeEnum;
  categoryName: string;
  list: LowCodeWidget.BasicSchema[];
}
export interface NewEvent {
  methodName: string;
  params: string;
  content?: string;
}
