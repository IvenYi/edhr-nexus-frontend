<template>
  <a-popover :placement="placement" trigger="click" overlayClassName="color-picker__popover">
    <slot v-if="useTrigger" name="trigger"></slot>

    <div v-else class="component">
      <div class="box">
        <div
          :style="{
            borderRadius: '4px',
          }"
        >
          <slot name="icon"></slot>
        </div>
      </div>
    </div>

    <template #content>
      <div class="color-picker" :style="{ '--w': width + 'px' }">
        <div class="color-picker-saturation" ref="saturationRef" @mousedown="mousedownSV">
          <div :style="`background-color: hsl(${hue}, 100%, 50%);`">
            <div class="point" :style="pointStyle"></div>
          </div>
          <div class="color-picker-saturation-t"></div>
          <div class="color-picker-saturation-h"></div>
        </div>
        <div class="color-picker-middle">
          <div style="flex: auto">
            <div class="hue-slider" ref="hueSliderRef" @mousedown="mousedownHue">
              <div class="slider" :style="hueSliderStyle"></div>
            </div>
            <div class="alpha-slider" ref="alphaSliderRef" @mousedown="mousedownAlpha">
              <div class="slider" :style="alphaSliderStyle"></div>
              <div
                :style="`background: linear-gradient(to right, rgba(0,0,0,0), ${colorObj.rgb});width: 100%;height: 100%`"
              ></div>
            </div>
          </div>
          <div class="color-picker-diamond">
            <div
              :style="`background-color: ${colorObj.rgba};width: 100%;height: 100%;box-shadow: inset 0 0 0 1px rgba(0, 0, 0, .15), inset 0 0 4px rgba(0, 0, 0, .25);`"
            ></div>
          </div>
        </div>
        <div class="color-picker-value">
          <div class="hex">
            <label>
              <input :value="colorObj.hex8" @input="hexChange" spellcheck="false" />
            </label>
            <p>Hex</p>
          </div>
          <div class="rgba-r">
            <label> <input :value="red" @input="redChange" /> </label>
            <p>R</p>
          </div>
          <div class="rgba-g">
            <label> <input :value="green" @input="greenChange" /> </label>
            <p>G</p>
          </div>
          <div class="rgba-b">
            <label> <input :value="blue" @input="blueChange" /> </label>
            <p>B</p>
          </div>
          <div class="rgba-a">
            <label> <input :value="alpha" @input="alphaChange" /> </label>
            <p>A</p>
          </div>
        </div>
        <div class="presetColor">
          <div class="title">推荐颜色</div>
          <ul class="preset">
            <li
              v-for="item in preset"
              :key="item"
              :style="`background-color: ${item}`"
              @click="presetChange(item)"
            ></li>
          </ul>
        </div>
      </div>
    </template>
  </a-popover>
</template>

<script setup lang="ts" name="ColorPicker">
  import { ref, computed, watch, onMounted } from 'vue';

  interface RgbaType {
    r: number;
    g: number;
    b: number;
    a: number;
  }

  interface PropsType {
    color: string | RgbaType; // 传入的色值
    preset: string[]; // 预设颜色
    width?: number; // 颜色选择框的宽度
    useTrigger?: boolean; // 使用trigger插槽
    placement?: any;
  }

  const props = withDefaults(defineProps<PropsType>(), {
    color: () => '#FFFFFF00',
    preset: () => [
      '#D0021B',
      '#F5A623',
      '#F8E71C',
      '#8B572A',
      '#7ED321',
      '#417505',
      '#BD10E0',
      '#9013FE',
      '#4A90E2',
      '#50E3C2',
      '#B8E986',
      '#000000',
      '#4A4A4A',
      '#9B9B9B',
      '#FFFFFF',
    ],
    width: 240,
    useTrigger: false,
    placement: 'bottomLeft',
  });
  const emit = defineEmits(['update:color']);

  const saturationRef = ref();
  const hueSliderRef = ref();
  const alphaSliderRef = ref();

  const pointStyle = ref('');
  const hueSliderStyle = ref('left: 0;');
  const alphaSliderStyle = ref('left: calc(100% - 6px);');

  const hue = ref(0);
  const saturation = ref(1);
  const value = ref(1);

  const red = ref(255);
  const green = ref(0);
  const blue = ref(0);

  const alpha = ref(1);

  watch(
    () => props.color,
    () => {
      const { r, g, b, a } = parseColor(props.color || '#FFFFFF00');
      red.value = r;
      green.value = g;
      blue.value = b;
      alpha.value = a;
    },
  );

  const { r, g, b, a } = parseColor(props.color || '#FFFFFF00');
  red.value = r;
  green.value = g;
  blue.value = b;
  alpha.value = a;

  // watch(alpha, () => {
  //   emit(
  //     'update:color',
  //     {
  //       r: red.value,
  //       g: green.value,
  //       b: blue.value,
  //       a: alpha.value,
  //     },
  //     colorObj.value.hex8,
  //   );
  //   // 移动透明度滑块
  //   alphaSliderStyle.value = `left: ${
  //     alpha.value >= 1 ? 'calc(100% - 6px)' : alpha.value * 100 + '%'
  //   };`;
  // });
  onMounted(() => {
    const { h, s, v } = rgb2hsv(red.value, green.value, blue.value);
    hue.value = h;
    saturation.value = s;
    value.value = v;
    // 移动背景板圆圈
    pointStyle.value = `top: ${100 - v * 100}%;left: ${s * 100}%;`;
    // 移动色调滑块
    hueSliderStyle.value = `left: ${(hue.value / 360) * 100}%;`;
    alphaSliderStyle.value = `left: ${
      alpha.value >= 1 ? 'calc(100% - 6px)' : alpha.value * 100 + '%'
    };`;
  });
  const colorObj = computed(() => {
    const r = red.value;
    const g = green.value;
    const b = blue.value;
    const a = alpha.value;
    const h = hue.value;
    const s = saturation.value;
    const v = value.value;
    return {
      rgb: `rgba(${r},${g},${b})`,
      rgba: `rgba(${r},${g},${b},${a})`,
      hex6: rgba2hex(r, g, b),
      hex8: rgba2hex(r, g, b, a),
      hsv: `hsv(${h},${s},${v})`,
      hsl: ``,
    };
  });

  watch(
    () => colorObj.value.hex8,
    () => {
      emit(
        'update:color',
        {
          r: red.value,
          g: green.value,
          b: blue.value,
          a: alpha.value,
        },
        colorObj.value.hex8,
      );

      const { h, s, v } = rgb2hsv(red.value, green.value, blue.value);

      hue.value = h;
      saturation.value = s;
      value.value = v;

      // 移动背景板圆圈
      pointStyle.value = `top: ${100 - v * 100}%;left: ${s * 100}%;`;
      // 移动色调滑块
      hueSliderStyle.value = `left: ${(hue.value / 360) * 100}%;`;
    },
    // {
    //   immediate: true,
    // },
  );
  // 输入框值变化,限制输入的值
  function hexChange(e) {
    const v = e.target.value;
    if (/^#?([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(v)) {
      let { r, g, b, a } = hex2rgba(v);
      red.value = r;
      green.value = g;
      blue.value = b;
      alpha.value = a;
    }
  }

  function redChange(e) {
    const v = e.target.value;
    if (v !== '') {
      v > 255 && (red.value = 255);
      v < 0 && (red.value = 0);
      v >= 0 && v <= 255 && (red.value = parseInt(v));
    }
  }

  function greenChange(e) {
    let v = e.target.value;
    if (v !== '') {
      v > 255 && (green.value = 255);
      v < 0 && (green.value = 0);
      v >= 0 && v <= 255 && (green.value = parseInt(v));
    }
  }

  function blueChange(e) {
    let v = e.target.value;
    if (v !== '') {
      v > 255 && (blue.value = 255);
      v < 0 && (blue.value = 0);
      v >= 0 && v <= 255 && (blue.value = parseInt(v));
    }
  }

  function alphaChange(e) {
    let v = e.target.value;
    if (v !== '') {
      v = parseFloat(v);
      alpha.value = v;
      v > 1 && (alpha.value = 1);
      v < 0 && (alpha.value = 0);
      v >= 0 && v <= 1 && (alpha.value = v);
    }
  }

  // 点击预设方块事件
  function presetChange(item) {
    if (/^#?([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(item)) {
      let { r, g, b, a } = hex2rgba(item);
      red.value = r;
      green.value = g;
      blue.value = b;
      alpha.value = a;
      alphaSliderStyle.value = `left: calc(100% - 6px);`;
      alpha.value = 1;
    }
  }

  // 饱和度和亮度
  function handleChangeSV(e) {
    if (!saturationRef.value) return;
    const w = saturationRef.value.clientWidth;
    const h = saturationRef.value.clientHeight;
    let x = e.pageX - saturationRef.value.getBoundingClientRect().left;
    let y = e.pageY - saturationRef.value.getBoundingClientRect().top;
    x = x < w && x > 0 ? x : x > w ? w : 0;
    y = y < h && y > 0 ? y : y > h ? h : 0;
    // 计算饱和度和亮度
    saturation.value = Math.floor((x / w) * 100 + 0.5) / 100;
    value.value = Math.floor((1 - y / h) * 100 + 0.5) / 100;
    // hsv转化为rgb
    const { r, g, b } = hsv2rgb(hue.value, saturation.value, value.value);
    red.value = r;
    green.value = g;
    blue.value = b;
    // 移动背景板圆圈
    pointStyle.value = `top: ${y}px;left: ${x}px;`;
  }

  function mousedownSV(e) {
    // 鼠标按下计算饱和度和亮度并添加事件
    handleChangeSV(e);
    // 添加整个页面的鼠标事件
    window.addEventListener('mousemove', handleChangeSV);
    window.addEventListener('mouseup', mouseupSV);
    alphaSliderStyle.value = `left: calc(100% - 6px);`;
    alpha.value = 1;
  }

  function mouseupSV() {
    // 鼠标松开后移除事件
    window.removeEventListener('mousemove', handleChangeSV);
    window.removeEventListener('mouseup', mouseupSV);
  }

  // 色调
  function handleChangeHue(e) {
    let w = hueSliderRef.value.clientWidth;
    let x = e.pageX - saturationRef.value.getBoundingClientRect().left;
    x = x < w && x > 0 ? x : x > w ? w : 0;
    // 计算色调
    hue.value = Math.floor((x / w) * 360 + 0.5);
    // hsv转化为rgb
    let { r, g, b } = hsv2rgb(hue.value, saturation.value, value.value);
    red.value = r;
    green.value = g;
    blue.value = b;
    // 移动滑块
    hueSliderStyle.value = `left: ${x >= w - 6 ? w - 6 : x}px;`;
  }

  function mousedownHue(e) {
    handleChangeHue(e);
    window.addEventListener('mousemove', handleChangeHue);
    window.addEventListener('mouseup', mouseupHue);
  }

  function mouseupHue() {
    window.removeEventListener('mousemove', handleChangeHue);
    window.removeEventListener('mouseup', mouseupHue);
  }

  // 透明度
  function handleChangeAlpha(e) {
    let w = alphaSliderRef.value.clientWidth;
    let x = e.pageX - saturationRef.value.getBoundingClientRect().left;
    x = x < w && x > 0 ? x : x > w ? w : 0;
    // 计算透明度
    alpha.value = Math.floor((x / w) * 100 + 0.5) / 100;
    // 移动滑块
    alphaSliderStyle.value = `left: ${x >= w - 6 ? w - 6 : x}px;`;
  }

  function mousedownAlpha(e) {
    handleChangeAlpha(e);
    window.addEventListener('mousemove', handleChangeAlpha);
    window.addEventListener('mouseup', mouseupAlpha);
  }

  function mouseupAlpha() {
    window.removeEventListener('mousemove', handleChangeAlpha);
    window.removeEventListener('mouseup', mouseupAlpha);
  }

  /**
   * 解析输入的数据,只能解析hex颜色和rgb对象形式的数据
   * @param color
   */
  function parseColor(color) {
    if (color) {
      let r, g, b, a;
      if (typeof color === 'string') {
        if (/^#?([0-9a-fA-F]{6}|[0-9a-fA-F]{8}|[0-9a-fA-F]{3}|[0-9a-fA-F]{4})$/.test(color)) {
          return hex2rgba(color);
        }
        return parseRGBA(color);
      } else {
        r = color.r > 255 ? 255 : color.r < 0 ? 0 : color.r;
        g = color.g > 255 ? 255 : color.g < 0 ? 0 : color.g;
        b = color.b > 255 ? 255 : color.b < 0 ? 0 : color.b;
        a = color.a > 1 ? 1 : color.a < 0 ? 0 : color.a;
        return { r, g, b, a };
      }
    } else {
      return { r: 0, g: 0, b: 0, a: 1 };
    }
  }

  function hsv2rgb(h, s, v) {
    h === 360 && (h = 0);
    let i = Math.floor(h / 60) % 6;
    let f = h / 60 - i;
    let p = v * (1 - s);
    let q = v * (1 - s * f);
    let t = v * (1 - s * (1 - f));
    let r, g, b;
    if (i === 0) {
      r = v;
      g = t;
      b = p;
    } else if (i === 1) {
      r = q;
      g = v;
      b = p;
    } else if (i === 2) {
      r = p;
      g = v;
      b = t;
    } else if (i === 3) {
      r = p;
      g = q;
      b = v;
    } else if (i === 4) {
      r = t;
      g = p;
      b = v;
    } else if (i === 5) {
      r = v;
      g = p;
      b = q;
    }
    r = Math.floor(r * 255 + 0.5);
    g = Math.floor(g * 255 + 0.5);
    b = Math.floor(b * 255 + 0.5);
    return { r, g, b };
  }

  function rgb2hsv(r, g, b) {
    let r1 = r / 255;
    let g1 = g / 255;
    let b1 = b / 255;
    let cmax = Math.max(r1, g1, b1);
    let cmin = Math.min(r1, g1, b1);
    let d = cmax - cmin;
    let h, s, v;
    if (d === 0) {
      h = 0;
    } else if (cmax === r1) {
      h = ((60 * (g1 - b1)) / d + 360) % 360;
    } else if (cmax === g1) {
      h = 60 * ((b1 - r1) / d + 2);
    } else if (cmax === b1) {
      h = 60 * ((r1 - g1) / d + 4);
    }
    if (cmax === 0) {
      s = 0;
    } else {
      s = d / cmax;
    }
    v = cmax;
    h = Math.floor(h + 0.5);
    s = Math.floor(s * 100 + 0.5) / 100;
    v = Math.floor(v * 100 + 0.5) / 100;
    return { h, s, v };
  }

  function rgba2hex(r, g, b, a = 1) {
    r = parseInt(r);
    let r1 = r.toString(16).length !== 2 ? '0' + r.toString(16) : r.toString(16);
    g = parseInt(g);
    let g1 = g.toString(16).length !== 2 ? '0' + g.toString(16) : g.toString(16);
    b = parseInt(b);
    let b1 = b.toString(16).length !== 2 ? '0' + b.toString(16) : b.toString(16);
    a = parseFloat(a);
    let a1 = '';
    if (a !== 1) {
      let temp = Math.floor(256 * a);
      a1 = temp.toString(16).length !== 2 ? '0' + temp.toString(16) : temp.toString(16);
    }
    return `#${r1}${g1}${b1}${a1}`.toUpperCase();
  }

  function hex2rgba(s) {
    if (/^#?[0-9a-fA-F]{3}$/.test(s)) {
      let b = s.substring(s.length - 1, s.length);
      let g = s.substring(s.length - 2, s.length - 1);
      let r = s.substring(s.length - 3, s.length - 2);
      return hex2rgba(`${r + r}${g + g}${b + b}`);
    }
    if (/^#?[0-9a-fA-F]{4}$/.test(s)) {
      let a = s.substring(s.length - 1, s.length);
      let b = s.substring(s.length - 2, s.length - 1);
      let g = s.substring(s.length - 3, s.length - 2);
      let r = s.substring(s.length - 4, s.length - 3);
      return hex2rgba(`${r + r}${g + g}${b + b}${a + a}`);
    }
    if (/^#?[0-9a-fA-F]{6}$/.test(s)) {
      let b = parseInt('0x' + s.substring(s.length - 2, s.length));
      let g = parseInt('0x' + s.substring(s.length - 4, s.length - 2));
      let r = parseInt('0x' + s.substring(s.length - 6, s.length - 4));
      return { r, g, b, a: 1 };
    }
    if (/^#?[0-9a-fA-F]{8}$/.test(s)) {
      let a = parseInt('0x' + s.substring(s.length - 2, s.length));
      a = a / 255;
      let b = parseInt('0x' + s.substring(s.length - 4, s.length - 2));
      let g = parseInt('0x' + s.substring(s.length - 6, s.length - 4));
      let r = parseInt('0x' + s.substring(s.length - 8, s.length - 6));
      return { r, g, b, a };
    }
  }

  function parseRGBA(colorString) {
    const rgbaRegex = /^rgba?\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})(?:,\s*([\d.]+))?\)$/;
    const match = colorString.match(rgbaRegex);

    if (match) {
      const alpha = match[4] ? parseFloat(match[4]) : 1; // 如果有alpha值则取，否则默认为1
      return {
        r: parseInt(match[1], 10),
        g: parseInt(match[2], 10),
        b: parseInt(match[3], 10),
        a: alpha,
      };
    } else {
      throw new Error('Invalid RGBA string');
    }
  }
</script>

<style lang="less" scoped>
  .component {
    display: inline-block;
    position: relative;
    outline: none;
    font-size: 14px;
    text-align: left;
    cursor: pointer;

    .box {
      display: flex;
      align-items: center;
      border: 1px solid @gct-input-border-color;
      border-radius: 4px;
      background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAWElEQVRIiWM8fubkfwYygKWJOSM5+mCAhRLNoxaPWjxq8ajFoxbTyeL/DAfJ0Xjs3Cl7Siwmu4Yht1aDgZEYx6MWj1o8avGoxaMWD3qLya5X//4nqx6HAQC7RBGFzolqTAAAAABJRU5ErkJggg==');
      background-size: 10px 10px;
    }
  }
</style>

<style lang="less">
  .color-picker__popover {
    .ant-popover-inner-content {
      padding: 0;
    }

    .color-picker {
      z-index: 9;
      width: var(--w);
      padding: 10px;
      background: #fff;
      box-shadow: 0 0 1px 1px rgb(0 0 0 / 10%);
      user-select: none;
      // border: 1px solid #ccc;
      // border-radius: 10px;

      /* 饱和度和亮度 */
      &-saturation {
        position: relative;
        width: 100%;
        height: 200px;
        margin-bottom: 10px;
        box-shadow: 1px 1px 1px rgb(0 0 0 / 10%);
        cursor: pointer;

        div {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        /* 圆圈 */
        .point {
          position: absolute;
          z-index: 9;
          box-sizing: border-box;
          width: 6px;
          height: 6px;
          transform: translate(-50%, -50%);
          border: 2px solid #ccc;
          border-radius: 50%;
          background-color: transparent;
        }
      }

      &-saturation-t {
        background: linear-gradient(to right, white, #fff0);
      }

      &-saturation-h {
        background: linear-gradient(to top, black, #fff0);
      }

      /* 色调 透明度 */
      &-middle {
        display: flex;
        width: 100%;
        margin-bottom: 10px;

        /* 色调滑块条 */
        .hue-slider {
          position: relative;
          height: 10px;
          margin-bottom: 6px;
          background: linear-gradient(
            90deg,
            red 0,
            #ff0 17%,
            #0f0 33%,
            #0ff 50%,
            #00f 67%,
            #f0f 83%,
            red
          );
          box-shadow: 1px 1px 1px rgb(0 0 0 / 10%);
        }

        /* 透明度滑块条 */
        .alpha-slider {
          position: relative;
          height: 10px;
          background: #fff
            url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAWElEQVRIiWM8fubkfwYygKWJOSM5+mCAhRLNoxaPWjxq8ajFoxbTyeL/DAfJ0Xjs3Cl7Siwmu4Yht1aDgZEYx6MWj1o8avGoxaMWD3qLya5X//4nqx6HAQC7RBGFzolqTAAAAABJRU5ErkJggg==');
          background-size: 10px 10px;
          box-shadow: 1px 1px 1px rgb(0 0 0 / 10%);
        }

        /* 滑块 */
        .slider {
          position: absolute;
          box-sizing: border-box;
          width: 6px;
          height: 100%;
          background-color: #fff;
          box-shadow: 0 0 2px rgb(0 0 0 / 60%);
          cursor: pointer;
        }
      }

      /* 颜色方块 */
      &-diamond {
        position: relative;
        width: 26px;
        height: 26px;
        margin-left: 5px;
        overflow: hidden;
        border-radius: 3px;
        background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAWElEQVRIiWM8fubkfwYygKWJOSM5+mCAhRLNoxaPWjxq8ajFoxbTyeL/DAfJ0Xjs3Cl7Siwmu4Yht1aDgZEYx6MWj1o8avGoxaMWD3qLya5X//4nqx6HAQC7RBGFzolqTAAAAABJRU5ErkJggg==');
        background-size: 10px 10px;
      }

      /* 颜色的值 hex rgba */
      &-value {
        display: flex;
        justify-content: space-between;
        width: 100%;

        div {
          padding: 0 3px;
          text-align: center;
        }

        input {
          box-sizing: border-box;
          width: 34px;
          height: 24px;
          margin: 0;
          padding: 0;
          border: 1px solid #ccc;
          border-radius: 3px;
          outline: none;
          font-size: 12px;
          text-align: center;
        }

        p {
          margin: 3px 0 0;
          font-size: 12px;
        }

        .rgba-a {
          padding-right: 0;
        }

        .hex {
          flex: 1;
          padding-left: 0;
        }

        .hex input {
          width: 100%;
          height: 24px;
        }
      }

      .presetColor {
        .title {
          margin-bottom: 10px;
          padding-top: 8px;
          border-top: 1px solid #eaeaea;
          font-size: 12px;
        }

        /* 预设颜色  */
        .preset {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-start;
          width: 100%;
          margin: 10px 0 0;
          padding: 0;
          list-style: none;

          li {
            width: 20px;
            height: 20px;
            margin-right: 6px;
            margin-bottom: 6px;
            border: 1px solid #ccc;
            border-radius: 6px;
            cursor: pointer;
          }
        }
      }
    }

    .color-value .color-value .color-value .hex input {
      width: 100%;
      height: 24px;
    }
  }
</style>
