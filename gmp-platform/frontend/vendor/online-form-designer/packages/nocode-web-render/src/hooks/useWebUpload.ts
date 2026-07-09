import type { IWebUploadApis, IUploadParams } from '../types';

const uploadApis: IWebUploadApis = {
  upload: null,
  transfer: (filename: string) => filename,
};

/**
 * 统一上传入口
 * @returns
 */
export function useWebUpload() {
  /**
   * 上传
   * @param file
   * @param opts 其他数据 由api入口自行转化相关参数
   * @returns
   */
  async function upload(file: any, opts?: IUploadParams): Promise<string | void> {
    if (!uploadApis.upload) return;
    const path = await uploadApis.upload(file, opts);
    return path;
  }

  function transfer(filename: string): string {
    if (!uploadApis.transfer) return '';
    return uploadApis.transfer(filename);
  }

  /**
   * 修改api
   * @param opts
   */
  async function setUploadApis(opts: Partial<IWebUploadApis>) {
    Object.assign(uploadApis, opts);
  }
  return {
    upload,
    transfer,
    setUploadApis,
  };
}
