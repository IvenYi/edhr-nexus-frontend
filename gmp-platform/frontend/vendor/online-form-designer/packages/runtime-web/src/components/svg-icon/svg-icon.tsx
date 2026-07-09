import {
  defineComponent,
  ref,
  computed,
  onMounted,
  onUnmounted,
  watch,
  nextTick,
  getCurrentInstance,
} from 'vue';
import { useNamespace } from '@gct-paas/core';
import { getSvgContent, ioniconContent } from './request';
import { isRTL, getSrc } from './utils';
import './svg-icon.scss';

/**
 * Create color classes for the icon.
 * @param color - The color of the icon.
 * @returns The color classes for the icon.
 */
const createColorClasses = (color: string | undefined) => {
  return color
    ? {
        'ion-color': true,
        [`ion-color-${color}`]: true,
      }
    : null;
};

/**
 * SVG图标组件 - 简化版本 (仅浏览器环境)
 *
 * 此组件是基于Stencil ion-icon组件简化的Vue实现，
 * 专门用于浏览器环境，仅支持通过src属性加载SVG。
 *
 * ## 功能
 * - 支持通过直接URL加载SVG图标
 * - 支持懒加载
 * - 支持RTL文本方向自动翻转
 * - 支持颜色和大小变化
 * - 支持SVG内容安全检查
 *
 * ## 使用示例
 *
 * // 使用 src 属性
 * <SvgIcon src="/path/to/icon.svg" />
 *
 * // 设置大小和颜色
 * <SvgIcon src="/path/to/icon.svg" size="large" color="primary" />
 *
 * // RTL 支持
 * <SvgIcon src="/path/to/icon.svg" flipRtl={true} />
 *
 * // 懒加载
 * <SvgIcon src="/path/to/icon.svg" lazy={true} />
 *
 * // 禁用 SVG 清理
 * <SvgIcon src="/path/to/icon.svg" sanitize={false} />
 */
export const SvgIcon = defineComponent({
  name: 'SvgIcon',
  props: {
    /**
     * The color to use for the background of the item.
     */
    color: {
      type: String,
    },
    /**
     * Specifies whether the icon should horizontally flip when `dir` is `"rtl"`.
     */
    flipRtl: {
      type: Boolean,
    },
    /**
     * Specifies the exact `src` of an SVG file to use.
     */
    src: {
      type: String,
      required: true,
    },
    /**
     * The size of the icon.
     * Available options are: `"small"` and `"large"`.
     */
    size: {
      type: String,
    },
    /**
     * If enabled, ion-icon will be loaded lazily when it's visible in the viewport.
     * Default, `false`.
     */
    lazy: {
      type: Boolean,
      default: false,
    },
    /**
     * When set to `false`, SVG content that is HTTP fetched will not be checked
     * if the response SVG content has any `<script>` elements, or any attributes
     * that start with `on`, such as `onclick`.
     * @default true
     */
    sanitize: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    const ns = useNamespace('svg-icon');
    const instance = getCurrentInstance();

    // Private state
    let io: IntersectionObserver | undefined;
    const didLoadIcon = ref(false);

    // Reactive state
    const svgContent = ref<string | undefined>(undefined);
    const isVisible = ref(false);

    /**
     * Wait until the icon is visible in the viewport.
     * @param el - The element to observe.
     * @param rootMargin - The root margin of the observer.
     * @param cb - The callback to call when the element is visible.
     */
    const waitUntilVisible = (el: HTMLElement, rootMargin: string, cb: () => void) => {
      /**
       * IntersectionObserver is a browser API that allows you to observe
       * the visibility of an element relative to a root element. It is
       * supported in all modern browsers, except IE and when server-side
       * rendering.
       */
      const hasIntersectionObserverSupport = Boolean(
        typeof window !== 'undefined' && props.lazy && window.IntersectionObserver,
      );

      /**
       * browser doesn't support IntersectionObserver
       * so just fallback to always show it
       */
      if (!hasIntersectionObserverSupport) {
        return cb();
      }

      const intersectionObserver = (io = new window.IntersectionObserver(
        (data: IntersectionObserverEntry[]) => {
          if (data[0].isIntersecting) {
            intersectionObserver.disconnect();
            io = undefined;
            cb();
          }
        },
        { rootMargin },
      ));

      intersectionObserver.observe(el);
    };

    /**
     * Load the icon using only src URL
     */
    const loadIcon = () => {
      if (typeof window !== 'undefined' && isVisible.value && props.src) {
        const url = getSrc(props.src);

        if (url) {
          if (ioniconContent.has(url)) {
            // sync if it's already loaded
            svgContent.value = ioniconContent.get(url);
          } else {
            // async if it hasn't been loaded
            getSvgContent(url, props.sanitize).then(() => {
              svgContent.value = ioniconContent.get(url);
            });
          }
          didLoadIcon.value = true;
        }
      }
    };

    // Component lifecycle hooks
    onMounted(() => {
      const el = instance?.vnode.el as HTMLElement;
      if (el) {
        /**
         * purposely do not return the promise here because loading
         * the svg file should not hold up loading the app
         * only load the svg if it's visible
         */
        waitUntilVisible(el, '50px', () => {
          isVisible.value = true;
          loadIcon();
        });
      }

      nextTick(() => {
        if (!didLoadIcon.value) {
          loadIcon();
        }
      });
    });

    onUnmounted(() => {
      if (io) {
        io.disconnect();
        io = undefined;
      }
    });

    // Watch for src prop changes
    watch(
      () => props.src,
      () => {
        loadIcon();
      },
    );

    const classes = computed(() => {
      const { flipRtl, size, color } = props;
      const el = instance?.vnode.el as HTMLElement;

      /**
       * if flipRtl is true, the icon should change direction when `dir` changes
       */
      const shouldBeFlippable = flipRtl;

      return {
        ...createColorClasses(color),
        [`icon-${size}`]: !!size,
        'flip-rtl': shouldBeFlippable,
        'icon-rtl': shouldBeFlippable && isRTL(el),
        [ns.b()]: true,
      };
    });

    return {
      ns,
      svgContent,
      classes,
    };
  },
  render() {
    const { svgContent, classes } = this;

    return (
      <div role="img" class={classes}>
        {typeof window !== 'undefined' && svgContent ? (
          <div class="icon-inner" innerHTML={svgContent}></div>
        ) : (
          <div class="icon-inner"></div>
        )}
      </div>
    );
  },
});
