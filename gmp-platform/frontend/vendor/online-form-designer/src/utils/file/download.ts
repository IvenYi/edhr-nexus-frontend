import { openWindow } from '..';
import { dataURLtoBlob, urlToBase64 } from './base64Conver';
import moment from 'moment';

/**
 * Download online pictures
 * @param url
 * @param filename
 * @param mime
 * @param bom
 */
export function downloadByOnlineUrl(url: string, filename: string, mime?: string, bom?: BlobPart) {
  urlToBase64(url).then((base64) => {
    downloadByBase64(base64, filename, mime, bom);
  });
}

/**
 * Download pictures based on base64
 * @param buf
 * @param filename
 * @param mime
 * @param bom
 */
export function downloadByBase64(buf: string, filename: string, mime?: string, bom?: BlobPart) {
  const base64Buf = dataURLtoBlob(buf);
  downloadByData(base64Buf, { filename, mime, bom });
}

export function uploaderFiles({ multiple = false, accept = '*' } = {}): Promise<File[]> {
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
/**
 * Download according to the background interface file stream
 * @param {*} data
 * @param {*} opts
 * @param {*} opts.filename 文件名
 * @param {*} opts.timestamp 是否需要在文件名后面自动加上时间戳
 * @param {*} opts.mime
 * @param {*} opts.bom
 */
export function downloadByData(
  data: BlobPart,
  {
    filename = 'file',
    timestamp = false,
    mime,
    bom,
  }: { filename?: string; timestamp?: boolean; mime?: string; bom?: BlobPart },
) {
  if (timestamp) {
    const ext = filename.split('.').pop();
    const realName = filename.replace(/\.[^/.]+$/, '');
    const timestamp = moment(new Date()).format('YYYYMMDDHHmmss');
    filename = `${realName}${timestamp}.${ext}`;
  }

  const blobData = typeof bom !== 'undefined' ? [bom, data] : [data];
  const blob = new Blob(blobData, { type: mime || 'application/octet-stream' });

  const blobURL = window.URL.createObjectURL(blob);
  const tempLink = document.createElement('a');
  tempLink.style.display = 'none';
  tempLink.href = blobURL;
  tempLink.setAttribute('download', filename);
  if (typeof tempLink.download === 'undefined') {
    tempLink.setAttribute('target', '_blank');
  }
  document.body.appendChild(tempLink);
  tempLink.click();
  document.body.removeChild(tempLink);
  window.URL.revokeObjectURL(blobURL);
}

/**
 * Download file according to file address
 * @param {*} sUrl
 */
export function downloadByUrl({
  url,
  target = '_blank',
  fileName,
}: {
  url: string;
  target?: TargetContext;
  fileName?: string;
}): boolean {
  const isChrome = window.navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
  const isSafari = window.navigator.userAgent.toLowerCase().indexOf('safari') > -1;

  if (/(iP)/g.test(window.navigator.userAgent)) {
    console.error('Your browser does not support download!');
    return false;
  }
  if (isChrome || isSafari) {
    const link = document.createElement('a');
    link.href = url;
    link.target = target;

    if (link.download !== undefined) {
      link.download = fileName || url.substring(url.lastIndexOf('/') + 1, url.length);
    }

    if (document.createEvent) {
      const e = document.createEvent('MouseEvents');
      e.initEvent('click', true, true);
      link.dispatchEvent(e);
      return true;
    }
  }
  if (url.indexOf('?') === -1) {
    url += '?download';
  }
  openWindow(url, { target });
  return true;
}
