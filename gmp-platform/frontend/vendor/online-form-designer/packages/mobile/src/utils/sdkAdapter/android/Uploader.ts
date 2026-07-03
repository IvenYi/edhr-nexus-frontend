import type { JSSDKType, fileType, FileData } from '../type';
import { GctNative } from '@native/index';
import { serverAddress, getAid } from '@mobile/stores/sessionHooks';
import { AccessToken, CurrentTenant, getBranchId } from '@mobile/stores/loginHooks';
import { getEnvCode } from '../../useEnv';
import { TimeZone } from '@mobile/stores/timeZone';

export const Uploader: JSSDKType.Uploader = async (arg, ftype = 'file') => {
  const { maxCount = 1, acceptList = [], maxSize = 5, success, error, change } = arg;
  gePathBySdk(
    {
      maxCount,
      acceptList,
      async success({ tempFiles }) {
        const errmessage: string[] = [];
        const files = tempFiles.map((i) => {
          const fileName = i.path.split('/').at(-1);
          const msg = beforeUploadFun({
            name: fileName!,
            size: i.size,
            maxSize,
            acceptList,
          });
          msg && errmessage.push(msg);
          return { ...i, fileName };
        });
        if (errmessage.length > 0) {
          error && error(errmessage);
          return;
        }
        const filesPromise = files.map((p) => uploadBypaths(p));
        const filelist = [];
        for await (const p of filesPromise) {
          if (p.url) {
            change && change(p);
            p.url && filelist.push(p);
          }
        }
        success && success(filelist);
      },
      fail() {},
    },
    ftype,
  );
};

function gePathBySdk(
  {
    maxCount,
    acceptList,
    success,
    fail,
  }: { maxCount: any; acceptList: string[]; success: (arg: FileData) => void; fail: () => void },
  ftype: `${fileType}`,
) {
  if (ftype === 'file') {
    GctNative.FILE.choose({
      count: maxCount,
      extension: acceptList,
      success,
      fail,
    });
  } else {
    GctNative.IMAGE.choose({
      count: maxCount,
      extension: acceptList,
      success,
      fail,
    });
  }
}
function uploadBypaths(file: JSSDKType.Files): Promise<JSSDKType.Files> {
  const branchId = getBranchId();
  const uploadUrl =
    (serverAddress.value || location.origin) + '/gct-apaas/api/file-resource/upload';
  const headers = {
    source: 502,
    Token: AccessToken.value,
    ['App-Tag']: getAid.value,
    module: 'TENANT_CENTER',
    env: getEnvCode(),
    ['is-preview']: true,
    ['tenant-id']: CurrentTenant.value.id,
    ['Branch-Id']: branchId,
    Timezone: TimeZone.value,
  };
  return new Promise((res, rej) => {
    GctNative.FILE.Upload({
      uploadUrl,
      headers,
      path: file.path,
      success(url) {
        res({ ...file, url: '/' + url });
      },
      fail() {
        res({ ...file });
      },
    });
  });
}
function beforeUploadFun({
  name,
  size,
  maxSize,
  acceptList,
}: {
  name: string;
  size: number;
  maxSize: number;
  acceptList: string[];
}) {
  if (name.indexOf(',') > -1) {
    return `【${name}】文件名不能有逗号`;
  }
  const fileSize = size / 1024 / 1024;
  if (fileSize > maxSize) {
    return `【${name}】文件大小不能超过 ${maxSize}MB`;
  }
  const fileType = name.split('.').at(-1);
  if (fileType && !!acceptList.length && !acceptList.includes(fileType)) {
    const acceptStr = acceptList.map((i) => '.' + i).join(' ');
    return `【${name}】支持的扩展名为${acceptStr}`;
  }
}
