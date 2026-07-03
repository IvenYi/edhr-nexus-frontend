import { postFileResourceUpload } from '/@/apis/gct-apaas/FileResourceController';
import type { JSSDKType, fileType } from '../type';

export const Uploader: JSSDKType.Uploader = (arg, fileType = 'file') => {
  const { maxCount = 1, acceptList = [], maxSize = 5, success, error, change, modelKey } = arg;
  const multiple = maxCount > 1;
  getFiles({ multiple, accept: acceptList.map((i) => `.${i}`).join(','), fileType }).then(
    async (res) => {
      const errmessage = res
        .map((i) => beforeUploadFun(i, { maxSize, acceptList }))
        .filter((i) => i);
      if (errmessage.length > 0) {
        error && error(errmessage);
        return;
      }
      const filelist = [];
      const filesPromise = res.splice(0, maxCount).map((f) => uploadByFile(f, modelKey));
      for await (const p of filesPromise) {
        if (p.url) {
          change && change(p);
          p.url && filelist.push(p);
        }
      }
      success && success(filelist);
    },
  );
};

function getFiles({
  multiple,
  accept,
  fileType,
}: {
  multiple: boolean;
  accept: string;
  fileType: string;
}): Promise<File[]> {
  if (fileType === 'image' && !accept) {
    accept = 'image/*';
  }
  const input = document.createElement('input');
  input.type = 'file';
  input.multiple = !!multiple;
  input.accept = accept;
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
async function uploadByFile(file: File, modelKey?: string): Promise<JSSDKType.Files> {
  const formData: any = new FormData();
  formData.append('file', file, file.name);
  try {
    const path = await appUploadapis(formData, modelKey);
    return {
      url: '/' + path,
      fileName: file.name,
      size: file.size,
      path: URL.createObjectURL(file),
    };
  } catch (error) {
    return {
      fileName: file.name,
      size: file.size,
      path: URL.createObjectURL(file),
    };
  }
}
function beforeUploadFun(
  file: File,
  { maxSize, acceptList }: { maxSize: number; acceptList: string[] },
) {
  if (file.name.indexOf(',') > -1) {
    return `【${file.name}】文件名不能有逗号`;
  }
  const fileSize = file.size / 1024 / 1024;
  if (fileSize > maxSize) {
    return `【${file.name}】文件大小不能超过 ${maxSize}MB`;
  }
  const fileType = file.name.split('.').at(-1);
  if (fileType && !!acceptList.length && !acceptList.includes(fileType)) {
    const acceptStr = acceptList.map((i) => '.' + i).join(' ');
    return `【${file.name}】支持的扩展名为${acceptStr}`;
  }
}

async function appUploadapis(formData: FormData, modelKey?: string) {
  return postFileResourceUpload(
    formData,
    { ...(modelKey ? { modelKey } : {}) },
    {
      transferToConfig: { headers: { 'Content-Type': 'multipart/form-data;charset=UTF-8' } },
    },
  );
}
