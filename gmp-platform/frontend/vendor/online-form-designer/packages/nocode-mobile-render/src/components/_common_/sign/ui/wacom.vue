<template>
  <div class="relative text-[0px]">
    <canvas
      :id="canvasId"
      :width="width"
      :height="height"
      @touchstart="touchStart"
      @touchmove="touchMove"
      @touchend="touchEnd"
      @mousedown="mouseDown"
      @mousemove="mouseMove"
      @mouseup="mouseUp"
    >
    </canvas>
    <div class="text-[#384356] text-[14px] cursor-pointer mr15px mb12px clear" @click="clear">
      <redo-outlined />
      {{ _resetText }}
    </div>
  </div>
</template>

<script setup lang="ts" name="gct-custom-button">
  import type { IWacomComponentExpose } from '../types';
  import { uuid2 } from '@gct/runtime-mobile-render';
  import { nextTick, onMounted, reactive } from 'vue';
  import { i18n } from '@mobile/locales/setupI18n';

  const { t } = i18n.global;
  const canvasId = 'canvas' + uuid2(32);

  const props = withDefaults(
    defineProps<{
      width?: string;
      height?: string;
      bgcolor?: string;
      resetText?: string;
    }>(),
    {
      width: '537',
      height: '304',
      bgcolor: '#FFFFFF',
    },
  );

  const _resetText = computed(() => {
    return props.resetText ?? t('sys.platform.reset');
  });

  const data: any = reactive({
    canvas: null,
    ctx: null, //画板
    stage_info: [], // 移动端按下点到屏幕的偏差
    isDown: false, //是否按下
    points: [], //按下点组合
    startX: 0, // 起始点x坐标
    startY: 0, // 起始点y坐标
  });

  onMounted(async () => {
    await nextTick();
    data.canvas = document.getElementById(canvasId);
    data.ctx = data.canvas.getContext('2d');
    if (props.bgcolor) {
      data.ctx.fillStyle = props.bgcolor;
      data.ctx.fillRect(0, 0, props.width, props.height);
    }
    data.ctx.strokeStyle = '#000';
    data.stage_info = data.canvas.getBoundingClientRect();
  });
  function touchStart(ev) {
    let e = ev || event;
    e.preventDefault();
    if (e.touches.length == 1) {
      let obj = {
        x: e.targetTouches[0].clientX - data.stage_info.left,
        y: e.targetTouches[0].clientY - data.stage_info.top,
      };
      data.startX = obj.x;
      data.startY = obj.y;
      data.ctx.beginPath();
      data.ctx.moveTo(data.startX, data.startY);
      data.ctx.lineTo(obj.x, obj.y);
      data.ctx.stroke();
      data.ctx.closePath();
      data.points.push(obj);
    }
  }
  function touchMove(ev) {
    let e = ev || event;
    e.preventDefault();
    if (e.touches.length == 1) {
      let obj = {
        x: e.targetTouches[0].clientX - data.stage_info.left,
        y: e.targetTouches[0].clientY - data.stage_info.top,
      };
      data.ctx.beginPath();
      data.ctx.moveTo(data.startX, data.startY);
      data.ctx.lineTo(obj.x, obj.y);
      data.ctx.stroke();
      data.ctx.closePath();
      data.startX = obj.x;
      data.startY = obj.y;
      data.points.push(obj);
    }
  }
  function touchEnd(ev) {
    let e = ev || event;
    e.preventDefault();
    if (e.touches.length == 1) {
      let obj = {
        x: e.targetTouches[0].clientX - data.stage_info.left,
        y: e.targetTouches[0].clientY - data.stage_info.top,
      };
      data.startX = obj.x;
      data.startY = obj.y;
      data.ctx.beginPath();
      data.ctx.moveTo(data.startX, data.startY);
      data.ctx.lineTo(obj.x, obj.y);
      data.ctx.stroke();
      data.ctx.closePath();
      data.points.push(obj);
    }
  }
  function mouseDown(ev) {
    let e = ev || event;
    e.preventDefault();
    data.isDown = true;
    let obj = {
      x: e.offsetX,
      y: e.offsetY,
    };
    data.startX = obj.x;
    data.startY = obj.y;
    data.ctx.beginPath();
    data.ctx.moveTo(data.startX, data.startY);
    data.ctx.lineTo(obj.x, obj.y);
    data.ctx.stroke();
    data.ctx.closePath();
    data.points.push(obj);
  }
  function mouseMove(ev) {
    let e = ev || event;
    e.preventDefault();
    if (data.isDown) {
      let obj = {
        x: e.offsetX,
        y: e.offsetY,
      };
      data.ctx.beginPath();
      data.ctx.moveTo(data.startX, data.startY);
      data.ctx.lineTo(obj.x, obj.y);
      data.ctx.stroke();
      data.ctx.closePath();
      data.startY = obj.y;
      data.startX = obj.x;
      data.points.push(obj);
    }
  }
  function mouseUp(ev) {
    let e = ev || event;
    e.preventDefault();
    let obj = {
      x: ev.offsetX,
      y: ev.offsetY,
    };
    data.ctx.beginPath();
    data.ctx.moveTo(data.startX, data.startY);
    data.ctx.lineTo(obj.x, obj.y);
    data.ctx.stroke();
    data.ctx.closePath();
    data.points.push(obj);
    data.points.push({ x: -1, y: -1 });
    data.isDown = false;
  }
  function clear() {
    data.ctx.clearRect(0, 0, props.width, props.height);
    data.points = [];
  }
  function getValue() {
    if (!data.points.length) {
      return undefined;
    }
    const str = data.canvas.toDataURL(); //签名img
    return str;
  }
  function setValue(base64String: any) {
    var imageUrl = new Image();
    imageUrl.src = base64String;
    imageUrl.onload = function () {
      data.ctx.drawImage(imageUrl, 0, 0);
    };
  }
  defineExpose<IWacomComponentExpose>({
    getValue,
    setValue,
    clear,
  });
</script>
<style scoped lang="less">
  .clear {
    position: absolute;
    right: 0;
    bottom: 0;
  }
  :deep(.ant-btn) {
    color: #384356;
  }
</style>
