<template>
  <div class="relative text-[0px]">
    <div
      v-if="props.username"
      class="position-absolute bg-name"
      :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px',fontSize: getSize() }"
    >
      <div v-for="(i, idx) in props.username" :key="idx">{{ i }}</div>
    </div>
    <canvas
      style="background: transparent"
      :id="canvasId"
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

    <div class="text-[#384356] text-[14px] cursor-pointer mr15px mb12px clear" @click="clear">
     <i class="iconfont icon-a-qingchugeshi_clear-format11"></i>
      {{ resetText }}
    </div>
  </div>
</template>

<script setup lang="ts" name="gct-custom-button">
  import { IWacomComponentExpose } from '/@/projects/page-designer/src/interface/web';
  import { buildUUID } from '/@/utils/uuid';
  import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
  import { nextTick, onMounted, reactive } from 'vue';

  const props = defineProps<{
    widget: LowCodeWidget.BasicSchema;
    resetText?: string;
    username?: string;
  }>();
  const {
    width: canvasWidth,
    height: canvasHeight,
    backgroundColor,
  } = reactive(props.widget.style);
  const canvasId = 'canvas' + buildUUID();

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
    data.canvas = <HTMLCanvasElement>document.getElementById(canvasId);
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
  function clear() {
    data.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    data.points = [];
  }
  function getValue() {
    if (!data.points.length) {
      return undefined;
    }
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

    const getSize = (isCrosswise) => {
      if (props.username.length <= 10) {
        return '100px';
      } else if (props.username.length <= 21) {
        return '68px';
      } else if (props.username.length <= 30) {
        return '50px';
      } else if (props.username.length <= 40) {
        return '48px' ;
      } else if (props.username.length <= 52) {
        return '40px';
      } else if (props.username.length <= 80) {
        return '32px' ;
      }
      return '30px';
    };
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
  .bg-name {
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 0 20px;
    text-align: center;
    font-weight: 600;
    font-size: 100px;
    vertical-align: middle;
    color: #000000;
    opacity: 0.1;
    word-wrap: break-word;
    flex-wrap: wrap; /* 允许子项换行 */
    overflow:hidden;
    z-index:-1;
  }
</style>
