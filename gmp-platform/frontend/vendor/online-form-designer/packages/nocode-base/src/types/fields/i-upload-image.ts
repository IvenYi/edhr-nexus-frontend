import { ImageDisplayModeEnum } from '../../constant';
import type { BaseCoreComponent } from '../common/base';

export interface IUploadImageProps extends BaseCoreComponent.FieldBasicProps {
  /** 最大上传数量 */
  maxCount?: number;
  /** 最大单个上传文件大小 */
  maxSize?: number;
  /** 允许上传的文件类型数组 */
  accept?: string[];
  /** 图片显示模式 */
  imageDisplayMode?: ImageDisplayModeEnum;
}

export interface IUploadImage extends BaseCoreComponent.BasicSchema {
  props: IUploadImageProps;
}
