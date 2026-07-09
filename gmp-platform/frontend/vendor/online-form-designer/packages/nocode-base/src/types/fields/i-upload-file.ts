import type { BaseCoreComponent } from '../common/base';

export interface IUploadFileProps extends BaseCoreComponent.FieldBasicProps {
  /** 最大上传数量 */
  maxCount?: number;
  /** 最大单个上传文件大小 */
  maxSize?: number;
  /** 允许上传的文件类型数组 */
  accept?: string[];
  /** 是否显示文件名称 */
  showFileName?: number;
}

export interface IUploadFile extends BaseCoreComponent.BasicSchema {
  props: IUploadFileProps;
}
