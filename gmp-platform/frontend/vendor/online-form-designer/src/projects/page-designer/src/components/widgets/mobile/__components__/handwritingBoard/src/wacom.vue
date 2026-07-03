<template>
  <div class="relative text-[0px]">
    <canvas
      id="myCanvas"
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
    <div v-if="!hideRestBtn" class="text-[#384356] text-[14px] cursor-pointer mr15px mb12px clear" @click="clear">
      <redo-outlined />
      {{ resetText }}
    </div>
    <canvas id="canvas-hidden" style="display: none;"></canvas>
  </div>
</template>

<script setup lang="ts" name="gct-custom-button">
  import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
  import { nextTick, onMounted, reactive } from 'vue';

  const props = defineProps<{ widget: LowCodeWidget.BasicSchema, resetText?: string, hideRestBtn?: boolean }>();
  let { width: canvasWidth, height: canvasHeight, backgroundColor } = reactive(props.widget.style);

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
    data.canvas = <HTMLCanvasElement>document.getElementById('myCanvas');
    data.ctx = data.canvas.getContext('2d');
    if (backgroundColor) {
      data.ctx.fillStyle = backgroundColor;
      data.ctx.fillRect(0, 0, canvasWidth, canvasHeight);  
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

  // 顺时针旋转90度生成图片（将竖向图片转成横向）
  function getValueByRotate90Deg() {
    const img = new Image();
    img.src = data.canvas.toDataURL();
    const canvas = <HTMLCanvasElement>document.getElementById('canvas-hidden');
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    return new Promise((resolve, reject) => {
      img.onload = function () {
        const imgW = img.width;
        const imgH = img.height;
        canvas.width = imgH * 2;
        canvas.height = imgH * 2;
        const cutObj = {
          sx: imgH,
          sy: imgH-imgW,
          ex: imgH + imgH,
          ey: imgH + imgW,
        }
        ctx.translate(imgH, imgH);
        ctx.rotate((Math.PI / 2) * 3);
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(cutObj.sx, cutObj.sy, cutObj.ex, cutObj.ey);
        canvas.width = imgH;
        canvas.height = imgW;
        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL())
      };
      img.onerror = (error) => {
        reject(error)
      }
    })
  }

  function clear() {
    data.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
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
  defineExpose({
    getValue,
    setValue,
    clear,
    getValueByRotate90Deg,
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
