import { Uploader } from '/@/utils/uploader';
import { useWebUpload } from '../hooks';

/**
 * Paas初始化上传api配置
 */
export const initWebPaasUploadApis = () => {
  const { setUploadApis } = useWebUpload();
  /**
   * 设置上传api
   */
  setUploadApis({
    upload: async (file: File, opts) => {
      return await Uploader.uploadByFile(file, true, opts?.modelKey);
    },
    transfer: (filename: string): string => {
      if (!filename) return '';
      return `${import.meta.env.VITE_MINIO_PATH}${
        !filename.startsWith('/') ? `/${filename}` : filename
      }`;
    },
  });
};
