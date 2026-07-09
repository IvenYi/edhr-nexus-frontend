import { defineComponent, onMounted, onUnmounted, ref, type PropType } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { FederatedPointerEvent } from '@visactor/vtable/es/vrender';
import PhotoSwipeLightbox from 'photoswipe/lightbox';
import { GctVTableImageListProps } from '../../../interface';
import { openPopover, PopoverInstance } from '../../gct-v-table-popover/gct-v-table-popover';
import { usePopoverHooks } from '../../../use';
import 'photoswipe/style.css';
import './gct-v-table-image-list.scss';

export const GctVTableImageList = defineComponent({
  name: 'GctVTableImageList',
  props: {
    urls: {
      type: Array as PropType<GctVTableImageListProps['urls']>,
      default: () => [],
    },
  },
  setup(props) {
    const ns = useNamespace('v-table-image-list');

    const hooks = usePopoverHooks();

    const imageListRef = ref<HTMLDivElement>();
    const imageDimensions = ref<Map<string, { width: number; height: number }>>(new Map());

    let lightbox: PhotoSwipeLightbox | null = null;

    hooks.beforeDismiss.tap((context) => {
      // 如果 lightbox 仍然打开，阻止弹窗关闭
      if (lightbox?.pswp?.isOpen) {
        context.close = false;
      }
    });

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
      props.urls.forEach((url) => {
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

    return () => {
      return (
        <div ref={imageListRef} class={ns.b()}>
          {props.urls.map((url, i) => {
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
                <img class={ns.e('image-content')} src={url} />
              </a>
            );
          })}
        </div>
      );
    };
  },
});

/**
 * 展示图片列表弹窗
 *
 * @export
 * @param {FederatedPointerEvent} e
 * @param {string[]} urls
 * @return {*}  {PopoverInstance}
 */
export function openVTableImageList(e: FederatedPointerEvent, urls: string[]): PopoverInstance {
  const { x, y } = e.page;
  return openPopover(GctVTableImageList, { urls }, { x, y, maxWidth: 400, maxHeight: 312 });
}
