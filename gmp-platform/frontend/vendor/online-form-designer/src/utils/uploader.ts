/*
 * @Author: wangming
 * @Date: 2023-04-24 11:34:52
 * @LastEditors: wangming
 * @LastEditTime: 2023-04-24 17:15:24
 * @FilePath: /vue-sys-manage-el/Users/wm/瀚川/hanma-application-designer-fed/src/utils/uploader.js
 * @Description:
 */
import { postDesignerCommonUploadFile } from '/@/apis/gct-apaas/DesignerCommonController';
import { postFileUploadImage } from '/@/apis/gct-platform/UserController';
import { postFileResourceUpload } from '/@/apis/gct-apaas/FileResourceController';

export class Uploader {
  static getFiles({
    multiple,
    acceptList,
  }: {
    multiple: boolean;
    acceptList?: string;
  }): Promise<File[]> {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = !!multiple;
    input.accept = acceptList || '*';
    input.click();
    return new Promise((resolve, reject) => {
      input.onchange = async () => {
        const filelist = input.files || [];
        resolve(Object.values(filelist));
      };
      input.onerror = async () => {
        reject();
      };
    });
  }
  static async beforeUploadFun(
    file,
    {
      maxSize = 5,
      acceptList = [],
      beforeUpload,
    }: { maxSize: number; acceptList: string[]; beforeUpload?: (file: File) => Promise<unknown> },
  ) {
    if (file.name.indexOf(',') > -1) {
      return Promise.reject(`文件名不能有逗号`);
    }
    beforeUpload && (await beforeUpload(file));
    const fileSize = file.size / 1024 / 1024;
    if (fileSize > maxSize) {
      return Promise.reject(`【${file.name}】文件大小不能超过 ${maxSize}MB`);
    }
    if (acceptList.length) {
      const filename: string = file.name
        .replaceAll(' ', '')
        .match(/\.([A-Za-z0-9]+)$/)
        .at(-1);
      if (!acceptList.includes(`.${filename.toLocaleLowerCase()}`)) {
        return Promise.reject(`【${file.name}】支持的扩展名为${acceptList.join(' ')}`);
      }
    }
  }
  static async uploadByFile(file: File, isApp = false, modelKey?: string) {
    const formData: any = new FormData();
    formData.append('file', file, file.name);
    const http = isApp ? appUploadapis : passUploadapis;
    const path = await http(formData, modelKey);
    return '/' + path;
  }

  static toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = function () {
        resolve(reader.result);
      };
      reader.onerror = () => reject('转换失败');
      if (file) {
        reader.readAsDataURL(file);
      }
    });
  }
  /**
   * 图片压缩转Base64
   */
  static compressToBase64(file, { quality = 0.8, scale = 0.8 } = {}) {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject('请选择图片文件');
        return;
      }
      if (typeof scale !== 'number' || scale <= 0 || scale > 1) {
        reject('缩放比例必须在0-1之间');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // 计算缩放后的尺寸
          const width = Math.floor(img.width * scale);
          const height = Math.floor(img.height * scale);
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          // 设置高质量缩放
          const ctx = canvas.getContext('2d');
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL(file.type, quality));
        };
        img.onerror = () => reject('图片加载失败');
        img.src = e.target.result;
      };
      reader.onerror = () => reject('文件读取失败');
      reader.readAsDataURL(file);
    });
  }
}

async function appUploadapis(formData, modelKey?: string) {
  return postFileResourceUpload(
    formData,
    { ...(modelKey ? { modelKey } : {}) },
    {
      transferToConfig: { headers: { 'Content-Type': 'multipart/form-data;charset=UTF-8' } },
    },
  );
}
async function passUploadapis(formData) {
  return postFileUploadImage(
    formData,
    { bucket: 'IMAGE' },
    {
      transferToConfig: { headers: { 'Content-Type': 'multipart/form-data;charset=UTF-8' } },
    },
  );
}
