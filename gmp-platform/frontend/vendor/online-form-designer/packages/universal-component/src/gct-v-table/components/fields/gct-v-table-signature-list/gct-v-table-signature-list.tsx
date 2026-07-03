import { computed, defineComponent, onMounted, onUnmounted, ref, type PropType } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { FederatedPointerEvent } from '@visactor/vtable/es/vrender';
import PhotoSwipeLightbox from 'photoswipe/lightbox';
import { GctVTableSignatureListProps } from '../../../interface';
import { openPopover, PopoverInstance } from '../../gct-v-table-popover/gct-v-table-popover';
import 'photoswipe/style.css';
import { createSignatureImage } from '../../../utils';
import { SignatureStyleEnum, SignatureTypeEnum } from '@gct/runtime';
import dayjs from 'dayjs';
import './gct-v-table-signature-list.scss';

export const GctVTableSignatureList = defineComponent({
  name: 'GctVTableSignatureList',
  props: {
    column: {
      type: Object as PropType<GctVTableSignatureListProps['column']>,
      required: true,
    },
    items: {
      type: Array as PropType<GctVTableSignatureListProps['items']>,
      default: () => [],
    },
  },
  setup(props) {
    const ns = useNamespace('v-table-signature-list');

    const imageListRef = ref<HTMLDivElement>();
    const imageDimensions = ref<Map<string, { width: number; height: number }>>(new Map());

    const urls = computed(() => {
      return props.items.map((item) => createSignatureImage(item));
    });

    const displayStyle = props.column._item?.props.displayStyle || SignatureStyleEnum.VERTICAL;

    const signatureType =
      props.column._item?.props.signatureType || SignatureTypeEnum.SIGNATURE_ONLY;

    let lightbox: any = null;

    const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const dimensions = { width: img.naturalWidth, height: img.naturalHeight };
          imageDimensions.value.set(url, dimensions);
          resolve(dimensions);
        };
        img.onerror = () => {
          // 加载失败时使用默认值
          const dimensions = { width: 800, height: 600 };
          imageDimensions.value.set(url, dimensions);
          resolve(dimensions);
        };
        img.src = url;
      });
    };

    onMounted(() => {
      if (!lightbox) {
        lightbox = new PhotoSwipeLightbox({
          gallery: imageListRef.value as HTMLElement,
          children: 'a',
          pswpModule: () => import('photoswipe'),
        });
        lightbox.init();
      }
      // 预加载所有图片的尺寸
      props.items.forEach((_, i) => {
        const url = urls.value[i];
        if (!imageDimensions.value.has(url)) {
          getImageDimensions(url);
        }
      });
    });

    onUnmounted(() => {
      if (lightbox) {
        lightbox.destroy();
        lightbox = null;
      }
    });

    function formMatTime(time: string): string {
      if (!time) {
        return '';
      }
      if (signatureType === SignatureTypeEnum.SIGNATURE_DATE) {
        return dayjs(time).format('YYYY-MM-DD');
      } else if (signatureType === SignatureTypeEnum.SIGNATURE_DATETIME) {
        return dayjs(time).format('YYYY-MM-DD HH:mm:ss');
      }
      return '';
    }

    function renderImageContent(time: string, url: string) {
      if (!time || signatureType === SignatureTypeEnum.SIGNATURE_ONLY) {
        return <img class={ns.e('image-content')} src={url} />;
      }
      if (displayStyle === SignatureStyleEnum.HORIZONTAL) {
        // 横向展示
        return (
          <div class={ns.e('row')}>
            <img class={ns.e('image-content')} src={url} />
            <div class={ns.e('label')}>{formMatTime(time)}</div>
          </div>
        );
      }
      return (
        <div>
          <img class={ns.e('image-content')} src={url} />
          <div class={ns.e('label-center') + ' ' + ns.e('label')}>{formMatTime(time)}</div>
        </div>
      );
    }

    return () => {
      return (
        <div ref={imageListRef} class={[ns.b(), ns.e(displayStyle)]}>
          {props.items.map((item, i) => {
            const url = urls.value[i];
            const dimensions = imageDimensions.value.get(url) || { width: 800, height: 600 };
            return (
              <a
                key={i}
                class={ns.e('image-item')}
                data-pswp-width={dimensions.width}
                data-pswp-height={dimensions.height}
                href={url}
                target="_blank"
                rel="noreferrer"
              >
                {renderImageContent(item.time, url)}
              </a>
            );
          })}
        </div>
      );
    };
  },
});

/**
 * 展示签名列表弹窗
 *
 * @export
 * @param {FederatedPointerEvent} e
 * @param {GctVTableSignatureListProps['column']} column
 * @param {GctVTableSignatureListProps['items']} items
 * @return {*}  {PopoverInstance}
 */
export function openVTableSignatureList(
  e: FederatedPointerEvent,
  column: GctVTableSignatureListProps['column'],
  items: GctVTableSignatureListProps['items'],
): PopoverInstance {
  const { x, y } = e.page;
  return openPopover(
    GctVTableSignatureList,
    { column, items },
    { x, y, maxWidth: 400, maxHeight: 312 },
  );
}
