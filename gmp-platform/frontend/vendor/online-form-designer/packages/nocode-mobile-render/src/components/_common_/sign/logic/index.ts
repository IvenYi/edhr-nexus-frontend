import { postSignatureGetSignatureUploadOrWriteImage } from '/@/apis/gct-apaas/SignatureController';
import SignSwitcherModal from '../ui/sign-switcher-modal.vue';
import type { GetSignImgByAccount, PartialSignInfo, SignInfo, UploadSignFile } from '../types';
import { SignMode } from '../constant';
import { postSignHistory } from '/@/apis/gct-apaas/SignHistoryController';
import { isNil } from 'lodash-es';
import { i18n } from '@mobile/locales/setupI18n';
import { MOBILE_MINIO_PATH } from '@mobile/utils/const';
import { postFileResourceUpload } from '/@/apis/gct-apaas/FileResourceController';
import { getGlobalMethodCurrentTime } from '/@/apis/gct-apaas/GlobalMethodController';
import { GctDialog } from '@mobile/utils/dialog';
import { GctPopup } from '@mobile/utils/popup';
import SignSwitcherPopup from '../ui/sign-switcher-popup.vue';

const { t } = i18n.global;

/**
 * 通过账户密码获取签名图片
 * @author lingxiaoming
 * @date 2024-08-22 09:13:30
 * @export
 * @param {string} username
 * @param {string} password
 */
export async function getSignImgByAccount(username: string, password: string, type: string) {
  const res = await postSignatureGetSignatureUploadOrWriteImage({
    username,
    password,
    type,
  });

  // if (!res?.signatureImage) {
  //   throw new Error(t('sys.pageDesigner.notGetSigatureTip'));
  // }

  return {
    url: res.signatureImage,
    time: new Date(res.currentTime || Date.now()).getTime(),
    historyId: res.signHistoryId,
    username: res?.username,
  } as SignInfo;
}

/**
 * 通过文件上传获取签名图片
 * @author lingxiaoming
 * @date 2024-08-22 09:13:29
 * @export
 * @param {File} file
 * @param {string} [modelKey] - 模型标识
 */
export async function uploadSignFile(file: File, modelKey?: string) {
  const formData: any = new FormData();
  formData.append('file', file, file.name);
  const url = await postFileResourceUpload(
    formData,
    { ...(modelKey ? { modelKey } : {}) },
    {
      transferToConfig: { headers: { 'Content-Type': 'multipart/form-data;charset=UTF-8' } },
    },
  );
  return { url };
}

/**
 * 添加签名记录并返回id
 * @export
 * @param opts
 * @return {*}
 */
export async function addSignHistory(opts: { url: string }): Promise<string> {
  const id = await postSignHistory(opts);
  return id!;
}

/**
 * 补全签名信息
 * @export
 * @param partial
 * @return {*}
 */
export async function completeSignInfo(partial: PartialSignInfo): Promise<SignInfo> {
  if (isNil(partial.time)) {
    const dateStr = await getGlobalMethodCurrentTime();
    partial.time = new Date(dateStr || Date.now()).getTime();
  }
  if (isNil(partial.historyId)) {
    partial.historyId = await addSignHistory({ url: partial.url });
  }
  return partial as SignInfo;
}

/**
 * 打开签名模态添加新的签名
 * @author lingxiaoming
 * @date 2024-08-22 09:13:01
 * @export
 * @return {*}  {(Promise<SignInfo | undefined>)}
 */
export async function openSignModal(opts: {
  defaultSignMode?: SignMode;
  hiddenSignMode?: boolean;
  getSignImgByAccount?: GetSignImgByAccount;
  uploadSignFile?: UploadSignFile;
  openMode: 'popup' | 'dialog';
  disableUserName?: boolean;
}): Promise<SignInfo | undefined> {
  if (opts.openMode === 'dialog') {
    return new Promise((resolve) => {
      GctDialog.open(SignSwitcherModal, {
        ...opts,
        beforeClose: (info: SignInfo) => {
          console.log('beforeClose', info);
          resolve(info);
        },
      });
    });
  } else {
    return new Promise((resolve) => {
      GctPopup.open(SignSwitcherPopup, {
        ...opts,
        beforeClose: (info: SignInfo) => {
          console.log('beforeClose', info);
          resolve(info);
        },
      });
    });
  }
}

/**
 * 获取预览url地址
 *
 * @author lingxiaoming
 * @date 2024-08-22 10:35:57
 * @export
 * @param {string} url
 * @return {*}
 */
export function getPreviewUrl(url: string, text?: string) {
  if (url) return `${MOBILE_MINIO_PATH.value}${!url.startsWith('/') ? `/${url}` : url}`;
  if (text) return createWhiteImageWithText(text, 240, 136);
  return '';
}

function createWhiteImageWithText(name: string, width: number, height: number): string {
  // 创建 canvas 元素
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d')!;
  // 填充白色背景
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // 初始字体大小，根据图片高度的三分之一
  let fontSize = Math.floor(height / 3);
  ctx.font = `${fontSize}px Arial`;

  // 文本换行函数，按字符逐个添加测试是否超过最大宽度（此处取 canvas 宽度的 90%）
  function wrapText(text: string, maxWidth: number, context: CanvasRenderingContext2D): string[] {
    const characters = text.split('');
    const lines: string[] = [];
    let currentLine = '';
    for (const char of characters) {
      const testLine = currentLine + char;
      const metrics = context.measureText(testLine);
      if (metrics.width > maxWidth && currentLine !== '') {
        lines.push(currentLine);
        currentLine = char;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
    return lines;
  }

  // 设置最大文本宽度（90% 的 canvas 宽度）
  const maxTextWidth = width * 0.9;
  let lines = wrapText(name, maxTextWidth, ctx);

  // 调整行高比例为 1.2 倍字体大小
  let lineHeight = fontSize * 1.2;

  // 如果换行后总文本高度超出 canvas 高度，则缩小字体，并重新计算换行与行高
  while (lines.length * lineHeight > height && fontSize > 10) {
    fontSize--;
    lineHeight = fontSize * 1.2;
    ctx.font = `${fontSize}px Arial`;
    lines = wrapText(name, maxTextWidth, ctx);
  }

  // 计算整体文本显示区域的起始 y 坐标（垂直居中）
  const totalTextHeight = lines.length * lineHeight;
  const startY = (height - totalTextHeight) / 2 + lineHeight / 2;

  // 设置文本样式
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 绘制每一行文本
  lines.forEach((line, index) => {
    ctx.fillText(line, width / 2, startY + index * lineHeight);
  });

  // 返回图片 base64 编码（png 格式）
  return canvas.toDataURL('image/png');
}
