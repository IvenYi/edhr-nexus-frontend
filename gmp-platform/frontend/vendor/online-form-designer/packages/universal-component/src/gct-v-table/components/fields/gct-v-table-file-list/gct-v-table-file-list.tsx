import { defineComponent, type PropType, ref } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { FederatedPointerEvent } from '@visactor/vtable/es/vrender';
import { openPopover, PopoverInstance } from '../../gct-v-table-popover/gct-v-table-popover';
import { GctVTableFileListProps } from '../../../interface';
import { getIconParkSvg } from '../../../utils';
import './gct-v-table-file-list.scss';

interface FileItem {
  url: string;
  name: string;
  size?: number;
  ext: string;
}

enum UploadTypeEnum {
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

export const GctVTableFileList = defineComponent({
  name: 'GctVTableFileList',
  props: {
    fileUrls: {
      type: Array as PropType<GctVTableFileListProps['fileUrls']>,
      default: () => [],
    },
  },
  setup(props) {
    const ns = useNamespace('v-table-file-list');
    const containerRef = ref<HTMLElement>();
    const fileItems = ref<FileItem[]>([]);
    const isLoading = ref(true);

    const getFileSize = (url: string): Promise<number> => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.onload = () => {
          if (xhr.status === 200) {
            const blob = xhr.response;
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve(blob.size);
            };
            reader.readAsText(blob);
          } else {
            reject(`Error ${xhr.status}: ${xhr.statusText}`);
          }
        };
        xhr.send();
      });
    };

    const sizeParser = (size: number): string => {
      if (size / 1024 < 1) return (size / 1024).toFixed(2) + 'K';
      if (size / 1024 / 10 < 1) return (size / 1024).toFixed(1) + 'K';
      if (size / 1024 / 1024 < 1) return (size / 1024).toFixed(0) + 'K';
      if (size / 1024 / 1024 / 10 < 1) return (size / 1024 / 1024).toFixed(2) + 'M';
      return (size / 1024 / 1024).toFixed(2) + 'M';
    };

    const getFileNameFromUrl = (url: string): string => {
      try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        const fileName = pathname.substring(pathname.lastIndexOf('/') + 1);
        return decodeURIComponent(fileName) || 'unknown';
      } catch {
        return url.substring(url.lastIndexOf('/') + 1) || 'unknown';
      }
    };

    const getFileExtension = (url: string): string => {
      const fileName = getFileNameFromUrl(url);
      const lastDot = fileName.lastIndexOf('.');
      return lastDot !== -1 ? fileName.substring(lastDot + 1).toLowerCase() : '';
    };

    const getFileTypeIcon = (fileName: string): string => {
      const arr = fileName?.split('.') ?? [];
      let type = arr[arr.length - 1] || 'png';
      type = type.toLowerCase();

      if (
        [
          UploadTypeEnum.PNG,
          UploadTypeEnum.JPG,
          UploadTypeEnum.JPEG,
          UploadTypeEnum.BMP,
          UploadTypeEnum.GIF,
        ].includes(type as UploadTypeEnum)
      )
        return 'img';
      if ([UploadTypeEnum.DOCX, UploadTypeEnum.DOC].includes(type as UploadTypeEnum))
        return UploadTypeEnum.DOC;
      if ([UploadTypeEnum.MP4, UploadTypeEnum.AVI].includes(type as UploadTypeEnum)) return 'MP4';
      if (type === UploadTypeEnum.PDF) return 'PDF';
      if (type === UploadTypeEnum.XLSX) return 'xlsx';
      if (type === UploadTypeEnum.PPT) return 'ppt';
      if (type === UploadTypeEnum.CER) return 'ssl';
      if (Object.values(UploadTypeEnum).includes(type as UploadTypeEnum)) return type;
      return 'attachment';
    };

    // 初始化文件列表并获取文件大小
    const initFileList = async () => {
      isLoading.value = true;
      const items = await Promise.all(
        props.fileUrls.map(async (url) => {
          const name = getFileNameFromUrl(url);
          const ext = getFileExtension(url);
          let size: number | undefined;
          try {
            size = await getFileSize(url);
          } catch (error) {
            console.warn('Failed to get file size for:', url, error);
          }
          return {
            url,
            name,
            ext,
            size,
          };
        }),
      );
      fileItems.value = items;
      isLoading.value = false;
    };

    // 组件加载后初始化文件列表
    initFileList();

    return () => {
      return (
        <div ref={containerRef} class={ns.b()}>
          {isLoading.value ? (
            <div class={ns.e('loading')}>
              <i class="gct-iconfont icon-loading gct-v-table-file-list__loading-icon"></i>
              加载中...
            </div>
          ) : (
            <div class={ns.e('list')}>
              {fileItems.value.map((item) => {
                const iconType = getFileTypeIcon(item.name);
                return (
                  <div
                    class={ns.e('item')}
                    key={item.url}
                    onClick={() => window.open(item.url, '_blank')}
                  >
                    <div
                      class={ns.e('icon-container')}
                      v-html={getIconParkSvg(`icon-platform:${iconType}`)}
                    ></div>
                    <div class={ns.e('info')}>
                      <div class={ns.e('name')} title={item.name}>
                        {item.name}
                      </div>
                      <div class={ns.e('desc')}>{item.size ? sizeParser(item.size) : '---'}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    };
  },
});

/**
 * 展示文件列表弹窗
 *
 * @export
 * @param {FederatedPointerEvent} e
 * @param {string[]} urls
 * @return {*}  {PopoverInstance}
 */
export function openVTableFileList(e: FederatedPointerEvent, urls: string[]): PopoverInstance {
  const { x, y } = e.page;
  return openPopover(GctVTableFileList, { fileUrls: urls }, { x, y, maxWidth: 384, maxHeight: 312 });
}
