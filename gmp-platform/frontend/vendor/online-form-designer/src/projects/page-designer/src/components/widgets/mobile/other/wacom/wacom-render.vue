<template>
  <div class="relative signureCanvasContainer">
    <canvas
      :id="canvasId"
      class='myCanvas'
      :width="canvasWidth"
      :height="canvasHeight"
      @touchstart="touchStart"
      @touchmove="touchMove"
      @touchend="touchEnd"
      @mousedown="mouseDown"
      @mousemove="mouseMove"
      @mouseup="mouseUp"
    >
    </canvas>
    <van-button icon="replay" type="primary" size="small" class="clear" @click="clear" />
  </div>
</template>

<script setup lang="ts" name="gct-wacom">
  import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
  import { nextTick, onMounted, reactive, ref } from 'vue';
  import { uniqueId } from 'lodash-es';
  import { IMobWacomComponentExpose } from '/@/projects/page-designer/src/interface/mobile';

  const props = defineProps<{ widget: LowCodeWidget.BasicSchema }>();
  const { width: canvasWidth, height: canvasHeight } = reactive(props.widget.style);

  const canvasId = ref(uniqueId('signature_'))

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
    const canvasContainer = document.querySelector('.signureCanvasContainer');
    data.canvas = <HTMLCanvasElement>document.getElementById(canvasId.value);
    data.ctx = data.canvas.getContext('2d');
    data.ctx.strokeStyle = '#000';
    data.canvas.width = canvasContainer?.clientWidth;
    data.canvas.height = canvasContainer?.clientHeight;
    // data.stage_info = data.canvas.getBoundingClientRect();
  });
  function touchStart(ev) {
    let e = ev || event;
    e.preventDefault();
    data.stage_info = data.canvas.getBoundingClientRect();
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
    data.stage_info = data.canvas.getBoundingClientRect();
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
    data.stage_info = data.canvas.getBoundingClientRect();
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
    const canvas = document.getElementById(canvasId.value);
    data.ctx.clearRect(0, 0, canvas?.clientWidth, canvas?.clientHeight);
    data.points = [];
  }
  function getValue() {
    const str = data.canvas.toDataURL(); //签名img
    return str;
  }
  function setValue(base64String) {
    var imageUrl = new Image();
    imageUrl.src = base64String;
    imageUrl.onload = function () {
      data.ctx.drawImage(imageUrl, 0, 0);
    };
  }
  defineExpose<IMobWacomComponentExpose>({
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
  .signureCanvasContainer, .myCanvas {
    width: 100%;
    // height: auto;
    min-height: 300px;
  }
</style>
