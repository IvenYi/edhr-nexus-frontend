export enum UploadImgTypeEnum {
  JPG = 'jpg',
  JPEG = 'jpeg',
  PNG = 'png',
  BMP = 'bmp',
  GIF = 'gif',
}

export interface AttrObjType {
  /** 单个文件大小 */
  maxSize?: number;
  /** 最大上传数量 */
  maxCount?: number;
  /** 支持的格式数组 */
  accept?: string[];
  /** 支持的格式 */
  acceptStr?: string;
}

export enum statusEnum {
  EXCEPTION = 'exception',
  ACTIVE = 'active',
}

export interface fileType {
  name: string;
  path: string;
  size: number;
}

export interface FileItemType {
  uid: string;
  name?: string;
  status?: statusEnum;
  path?: string;
  fileSize?: number;
  percentNum?: number;
}
