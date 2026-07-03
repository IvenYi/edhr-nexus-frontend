import type { UploadType, IUploadParams, IUploadApis } from '../types';

const uploadApis: IUploadApis = {
  upload: null,
  transfer: (filename: string) => filename,
};

/**
 * 统一上传入口
 * @returns
 */
export function useMobileUpload() {
  /**
   * 上传
   * @param file
   * @param opts 其他数据 由api入口自行转化相关参数
   * @returns
   */
  function upload(uploadType: UploadType, opts?: IUploadParams) {
    if (!uploadApis.upload) return;
    uploadApis.upload(uploadType, opts);
  }

  function transfer(filename: string): string {
    if (!uploadApis.transfer) return '';
    return uploadApis.transfer(filename);
  }

  /**
   * 修改api
   * @param opts
   */
  async function setUploadApis(opts: Partial<IUploadApis>) {
    Object.assign(uploadApis, opts);
  }

  return {
    upload,
    transfer,
    setUploadApis,
  };
}
