export enum UploadTypeEnum {
  JPG = 'jpg',
  JPEG = 'jpeg',
  PNG = 'png',
  BMP = 'bmp',
  DOCX = 'docx',
  PDF = 'pdf',
  XLSX = 'xlsx',
  DOC = 'doc',
  MP4 = 'mp4',
  AVI = 'avi',
  PPT = 'ppt',
  GIF = 'gif',
  CER = 'cer',
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
