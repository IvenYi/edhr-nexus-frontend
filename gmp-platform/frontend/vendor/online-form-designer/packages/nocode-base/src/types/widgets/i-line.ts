import { PaperWidgeType, LineType } from '../../constant';
import type { BaseCoreComponent } from '../common/base';

export interface ILineProps {
  /** 线条id */
  id: string;
  /** 页面组件类型 */
  type: PaperWidgeType;
  /** 线条外观 */
  lineStyle: {
    /** 线条宽度 */
    borderWidth: number;
    /** 线条颜色 */
    borderColor: string;
    /** 线条样式 */
    borderStyle: LineType;
  };
  layout: any;
  styles: any;
}

/** 表格列的属性 */
export interface ILine extends BaseCoreComponent.BasicSchema {
  props: ILineProps;
}
