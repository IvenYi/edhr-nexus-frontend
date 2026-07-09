export enum fileType {
  IMAGE = 'image',
  FILE = 'file',
}
export interface FileData {
  tempFilePaths: string[];
  tempFiles: { path: string; size: number }[];
}
export namespace JSSDKType {
  export type Files = {
    url?: string;
    path: string;
    size: number;
    fileName?: string;
  };

  type Uploadertype = {
    /**最大上传数量 */
    maxCount?: number;
    /**文件上传格式 */
    acceptList: string[];
    /**上传大小单位MB */
    maxSize?: number;
    /**全部上传成功 范围 path 数组 */
    success?: (res: Files[]) => void;
    /**上传失败返回报错信息 */
    error?: (message: string[]) => void;
    /**上传文件变化时 */
    change?: (filelist: Files) => void;
  };
  export type Uploader = (arg: Uploadertype, fileType?: `${fileType}`) => void;
  export type openScan = () => Promise<string>;
}

export interface JSSDKMap {
  /**文件上传 */
  Uploader: JSSDKType.Uploader;
  /**打开扫码窗口 */
  openScan: JSSDKType.openScan;
}
