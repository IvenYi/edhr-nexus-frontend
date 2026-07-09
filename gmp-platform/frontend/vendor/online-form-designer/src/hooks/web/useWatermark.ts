import { getCurrentInstance, onBeforeUnmount, ref, Ref, shallowRef, unref } from 'vue';
import { useRafThrottle } from '/@/utils/domUtils';
import { addResizeListener, removeResizeListener } from '/@/utils/event';
import { isDef } from '/@/utils/is';

interface WatermarkOptions {
  fontSize: number; // 水印字体大小
  color: string; // 水印颜色
  verticalAlign: 'alphabetic' | 'bottom' | 'hanging' | 'ideographic' | 'middle' | 'top'; // 水印垂直对齐方式
  textAlign: 'center' | 'end' | 'left' | 'right' | 'start'; // 水印水平对齐方式
  transparent: number; // 水印透明度
  width: number; //水印宽度
  height: number; // 水印高度
}

const domSymbol = Symbol('watermark-dom');
const sourceMap = new WeakMap<HTMLElement, {}>();

export function useWatermark(
  appendEl: Ref<HTMLElement | null> = ref(document.body) as Ref<HTMLElement>,
) {
  const appendElRaw = unref(appendEl);
  if (appendElRaw && sourceMap.has(appendElRaw)) {
    return sourceMap.get(appendElRaw);
  }
  const func = useRafThrottle(function () {
    const el = unref(appendEl);
    if (!el) return;
    const { clientHeight: height, clientWidth: width } = el;
    updateWatermark({ height, width });
  });
  const id = domSymbol.toString();
  const watermarkEl = shallowRef<HTMLElement>();

  const clear = () => {
    const domId = unref(watermarkEl);
    watermarkEl.value = undefined;
    const el = unref(appendEl);
    if (!el) return;
    domId && el.removeChild(domId);
    removeResizeListener(el, func);
  };

  function createBase64(str: string, configs?: WatermarkOptions) {
    const can = document.createElement('canvas');
    const width = 300;
    const height = 240;
    Object.assign(can, { width, height });

    const cans = can.getContext('2d');
    if (cans) {
      // 修改样式
      if (configs) {
        cans.font = configs.fontSize ? `${configs.fontSize}px Vedana` : '15px Vedana';
        cans.fillStyle = configs.color ? configs.color : 'rgba(0, 0, 0, 0.15)';
        cans.textAlign = configs.textAlign ? configs.textAlign : 'left';
        cans.textBaseline = configs.verticalAlign ? configs.verticalAlign : 'middle';
        if (configs.transparent) {
          cans.globalAlpha = configs.transparent ? configs.transparent / 100 : 1;
        } else {
          cans.globalAlpha = 0;
        }
      }
      const lineHeight = configs?.fontSize ? configs?.fontSize * 1.5 : 24;
      cans.rotate((-20 * Math.PI) / 120);
      // cans.fillText(str, width / 20, height);
      // 调用函数绘制文本
      drawTextWithWrap(cans, str, width / 20, 120, lineHeight);
    }
    return can.toDataURL('image/png');
  }

  function drawTextWithWrap(ctx, text, x, y, lineHeight) {
    const words = text.split('\n');
    let line = '';
    let yOffset = 60;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      ctx.fillText(line, x, y + yOffset);
      line = word + ' ';
      yOffset += lineHeight;
    }

    // 绘制最后一行
    ctx.fillText(line, x, y + yOffset);
  }

  function updateWatermark(
    options: {
      width?: number;
      height?: number;
      str?: string;
    } = {},
    configs?: WatermarkOptions,
  ) {
    const el = unref(watermarkEl);
    if (!el) return;
    if (isDef(options.width)) {
      el.style.width = `${window.innerWidth - 10}px`;
    }
    if (isDef(options.height)) {
      el.style.height = `${
        (options.height > window.innerHeight ? window.innerHeight : options.height) - 10
      }px`;
    }
    if (isDef(options.str)) {
      el.style.background = `url(${createBase64(options.str, configs)}) left top repeat`;
    }
  }

  // 添加配置项
  const createWatermark = (str: string, configs?: WatermarkOptions) => {
    if (unref(watermarkEl)) {
      updateWatermark({ str, width: configs?.width, height: configs?.height }, configs);
      return id;
    }
    const div = document.createElement('div');
    watermarkEl.value = div;
    div.id = id;
    div.style.pointerEvents = 'none';
    div.style.top = '0px';
    div.style.left = '0px';
    div.style.position = 'absolute';
    div.style.zIndex = '100000';
    div.style.display = 'inline-block';

    const el = unref(appendEl);
    if (!el) return id;
    const { clientHeight: height, clientWidth: width } = el;
    updateWatermark({ str, width, height }, configs);
    el.appendChild(div);
    sourceMap.set(el, { setWatermark, clear });
    return id;
  };

  function setWatermark(str: string, options?: WatermarkOptions) {
    createWatermark(str, options);
    addResizeListener(document.documentElement, func);
    const instance = getCurrentInstance();
    if (instance) {
      onBeforeUnmount(() => {
        clear();
      });
    }
  }

  return { setWatermark, clear };
}
