import { PaperWidgeType, WidgetImageSizeMode } from '../../constant';
import type { BaseCoreComponent } from '../common/base';

export interface IImageProps {
  /** 图片id */
  id: string;
  /** 页面组件类型 */
  type: PaperWidgeType;
  /** 图片内容值 */
  value: string;
  sizeMode: WidgetImageSizeMode;
  layout: any;
}

/** 表格列的属性 */
export interface IImage extends BaseCoreComponent.BasicSchema {
  props: IImageProps;
}
