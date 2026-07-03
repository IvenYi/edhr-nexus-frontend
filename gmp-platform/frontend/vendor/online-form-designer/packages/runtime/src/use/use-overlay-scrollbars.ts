import { onMounted, onUnmounted, ref, Ref } from 'vue';
import { EventListeners, OverlayScrollbars, PartialOptions } from 'overlayscrollbars';
import { mergeWith } from 'lodash-es';
import 'overlayscrollbars/overlayscrollbars.css';

/**
 * OverlayScrollbars Vue 3 组合式函数
 *
 * @export
 * @param {PartialOptions} options
 * @param {EventListeners} [eventListeners]
 * @return {*}
 */
export function useOverlayScrollbars(
  osElRef: Ref<HTMLElement | undefined>,
  options: PartialOptions,
  eventListeners?: EventListeners,
): Ref<OverlayScrollbars> {
  const osInstance: Ref<OverlayScrollbars | null> = ref(null);
  onMounted(() => {
    osInstance.value = OverlayScrollbars(
      osElRef.value as HTMLElement,
      mergeWith(
        {
          scrollbars: {
            autoHide: 'leave',
            autoHideDelay: 300,
          },
        } as PartialOptions,
        options,
      ),
      eventListeners,
    );
  });

  onUnmounted(() => {
    if (osInstance.value) {
      osInstance.value.destroy();
      osInstance.value = null;
    }
  });
  return osInstance as Ref<OverlayScrollbars>;
}
