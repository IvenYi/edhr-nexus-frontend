<template>
  <div
    ref="containerRef"
    class="image-container"
    @touchstart.prevent="handleTouchStart"
    @touchmove.prevent="handleTouchMove"
    @touchend.prevent="handleTouchEnd"
    @wheel.prevent="handleWheel"
    @mousedown.prevent="handleMouseDown"
    @mousemove.prevent="handleMouseMove"
    @mouseup.prevent="handleMouseUp"
    @mouseleave="handleMouseUp"
  >
    <img :src="src" :style="imageStyle" alt="可操作图片" draggable="false" @load="initImageSize" />
  </div>
</template>

<script setup>
  import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';

  const props = defineProps({
    src: {
      type: String,
      required: true,
    },
  });

  // DOM 引用
  const containerRef = ref(null);

  // 图片自然尺寸
  const naturalWidth = ref(0);
  const naturalHeight = ref(0);
  const containerWidth = ref(0);
  const containerHeight = ref(0);

  // 变换状态
  const transform = reactive({
    x: 0,
    y: 0,
    scale: 1,
  });

  // 触摸状态
  const touches = ref(new Map());
  const isMoving = ref(false);
  const isScaling = ref(false);
  const lastDistance = ref(0);
  const initialTransformOnPinch = reactive({ x: 0, y: 0, scale: 1 });

  // 鼠标拖动状态
  const isMouseDragging = ref(false);
  const mouseStartPos = reactive({ x: 0, y: 0 });
  const transformStartPos = reactive({ x: 0, y: 0 });

  // 动态样式
  const imageStyle = computed(() => ({
    transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
    transition:
      isMoving.value || isScaling.value || isMouseDragging.value
        ? 'none'
        : 'transform 0.15s ease-out',
    width: naturalWidth.value ? `${naturalWidth.value}px` : 'auto',
    height: naturalHeight.value ? `${naturalHeight.value}px` : 'auto',
    transformOrigin: '0 0',
  }));

  // 辅助函数：计算两点距离
  function getDistance(t1, t2) {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // 辅助函数：计算两点中心
  function getCenter(t1, t2) {
    return {
      x: (t1.clientX + t2.clientX) / 2,
      y: (t1.clientY + t2.clientY) / 2,
    };
  }

  // 关键函数：边界约束
  function clampPosition() {
    if (
      !containerWidth.value ||
      !containerHeight.value ||
      !naturalWidth.value ||
      !naturalHeight.value
    )
      return;

    const scaledW = naturalWidth.value * transform.scale;
    const scaledH = naturalHeight.value * transform.scale;

    // X 轴约束
    if (scaledW <= containerWidth.value) {
      transform.x = Math.min(Math.max(transform.x, 0), containerWidth.value - scaledW);
    } else {
      transform.x = Math.min(Math.max(transform.x, containerWidth.value - scaledW), 0);
    }

    // Y 轴约束
    if (scaledH <= containerHeight.value) {
      transform.y = Math.min(Math.max(transform.y, 0), containerHeight.value - scaledH);
    } else {
      transform.y = Math.min(Math.max(transform.y, containerHeight.value - scaledH), 0);
    }
  }

  // 初始化图片尺寸 - 自适应容器宽度
  function initImageSize() {
    if (!containerRef.value) return;
    const img = containerRef.value.querySelector('img');
    if (img) {
      naturalWidth.value = img.naturalWidth;
      naturalHeight.value = img.naturalHeight;
      updateContainerSize();
      fitToContainer();
    }
  }

  // 更新容器尺寸
  function updateContainerSize() {
    if (containerRef.value) {
      const rect = containerRef.value.getBoundingClientRect();
      containerWidth.value = rect.width;
      containerHeight.value = rect.height;
    }
  }

  // 自适应容器宽度
  function fitToContainer() {
    if (
      !containerWidth.value ||
      !containerHeight.value ||
      !naturalWidth.value ||
      !naturalHeight.value
    )
      return;

    // 计算适应容器宽度的缩放比例
    const scaleX = containerWidth.value / naturalWidth.value;
    const scaleY = containerHeight.value / naturalHeight.value;

    // 使用宽度适配，但如果图片高度超出容器，则使用高度适配
    let fitScale = scaleX;

    // 按宽度缩放后的图片高度
    const scaledHeight = naturalHeight.value * fitScale;

    // 如果按宽度缩放后高度超出容器，则改用高度适配
    if (scaledHeight > containerHeight.value) {
      fitScale = scaleY;
    }

    // 设置缩放比例
    transform.scale = fitScale;

    // 计算居中位置
    const scaledWidth = naturalWidth.value * fitScale;
    const scaledHeightFinal = naturalHeight.value * fitScale;

    transform.x = (containerWidth.value - scaledWidth) / 2;
    transform.y = (containerHeight.value - scaledHeightFinal) / 2;
  }

  // 鼠标事件处理
  function handleMouseDown(e) {
    if (e.button !== 0) return;

    isMouseDragging.value = true;
    mouseStartPos.x = e.clientX;
    mouseStartPos.y = e.clientY;
    transformStartPos.x = transform.x;
    transformStartPos.y = transform.y;
  }

  function handleMouseMove(e) {
    if (!isMouseDragging.value) return;

    const deltaX = e.clientX - mouseStartPos.x;
    const deltaY = e.clientY - mouseStartPos.y;

    transform.x = transformStartPos.x + deltaX;
    transform.y = transformStartPos.y + deltaY;

    clampPosition();
  }

  function handleMouseUp() {
    if (isMouseDragging.value) {
      isMouseDragging.value = false;
      clampPosition();
    }
  }

  // 触摸事件处理
  function handleTouchStart(e) {
    const changedTouches = e.changedTouches;

    for (let i = 0; i < changedTouches.length; i++) {
      const touch = changedTouches[i];
      touches.value.set(touch.identifier, touch);
    }

    if (touches.value.size === 1) {
      isMoving.value = true;
      isScaling.value = false;
      const touch = Array.from(touches.value.values())[0];
      mouseStartPos.x = touch.clientX;
      mouseStartPos.y = touch.clientY;
      transformStartPos.x = transform.x;
      transformStartPos.y = transform.y;
    } else if (touches.value.size === 2) {
      isMoving.value = false;
      isScaling.value = true;
      const touchArray = Array.from(touches.value.values());
      lastDistance.value = getDistance(touchArray[0], touchArray[1]);
      initialTransformOnPinch.x = transform.x;
      initialTransformOnPinch.y = transform.y;
      initialTransformOnPinch.scale = transform.scale;
    }
  }

  function handleTouchMove(e) {
    const changedTouches = e.changedTouches;

    for (let i = 0; i < changedTouches.length; i++) {
      const touch = changedTouches[i];
      touches.value.set(touch.identifier, touch);
    }

    if (touches.value.size === 1 && isMoving.value) {
      const touch = Array.from(touches.value.values())[0];
      const deltaX = touch.clientX - mouseStartPos.x;
      const deltaY = touch.clientY - mouseStartPos.y;

      transform.x = transformStartPos.x + deltaX;
      transform.y = transformStartPos.y + deltaY;
      clampPosition();
    } else if (touches.value.size === 2 && isScaling.value) {
      const touchArray = Array.from(touches.value.values());
      const newDistance = getDistance(touchArray[0], touchArray[1]);
      const newCenter = getCenter(touchArray[0], touchArray[1]);

      const scaleFactor = newDistance / lastDistance.value;
      const newScale = Math.min(Math.max(initialTransformOnPinch.scale * scaleFactor, 0.5), 3);

      const containerRect = containerRef.value.getBoundingClientRect();
      const centerInContainer = {
        x: newCenter.x - containerRect.left,
        y: newCenter.y - containerRect.top,
      };

      const imgPointX =
        (centerInContainer.x - initialTransformOnPinch.x) / initialTransformOnPinch.scale;
      const imgPointY =
        (centerInContainer.y - initialTransformOnPinch.y) / initialTransformOnPinch.scale;

      transform.x = centerInContainer.x - imgPointX * newScale;
      transform.y = centerInContainer.y - imgPointY * newScale;
      transform.scale = newScale;

      clampPosition();
      initialTransformOnPinch.x = transform.x;
      initialTransformOnPinch.y = transform.y;
      initialTransformOnPinch.scale = transform.scale;
      lastDistance.value = newDistance;
    }
  }

  function handleTouchEnd(e) {
    const changedTouches = e.changedTouches;

    for (let i = 0; i < changedTouches.length; i++) {
      const touch = changedTouches[i];
      touches.value.delete(touch.identifier);
    }

    if (touches.value.size === 0) {
      isMoving.value = false;
      isScaling.value = false;
      clampPosition();
    } else if (touches.value.size === 1 && isScaling.value) {
      isScaling.value = false;
      isMoving.value = true;
      const touch = Array.from(touches.value.values())[0];
      mouseStartPos.x = touch.clientX;
      mouseStartPos.y = touch.clientY;
      transformStartPos.x = transform.x;
      transformStartPos.y = transform.y;
    }
  }

  // 鼠标滚轮缩放
  function handleWheel(e) {
    if (!containerRef.value) return;
    const containerRect = containerRef.value.getBoundingClientRect();
    const mouseInContainer = {
      x: e.clientX - containerRect.left,
      y: e.clientY - containerRect.top,
    };

    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.min(Math.max(transform.scale * delta, 0.5), 3);

    const imgPointX = (mouseInContainer.x - transform.x) / transform.scale;
    const imgPointY = (mouseInContainer.y - transform.y) / transform.scale;

    transform.x = mouseInContainer.x - imgPointX * newScale;
    transform.y = mouseInContainer.y - imgPointY * newScale;
    transform.scale = newScale;

    clampPosition();
  }

  // 窗口大小变化处理
  function onResize() {
    updateContainerSize();
    clampPosition();
  }

  onMounted(() => {
    updateContainerSize();
    window.addEventListener('resize', onResize);
    if (containerRef.value) {
      const img = containerRef.value.querySelector('img');
      if (img && img.complete) {
        initImageSize();
      }
    }
  });

  onUnmounted(() => {
    window.removeEventListener('resize', onResize);
  });
</script>

<style scoped>
  .image-container {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;
    touch-action: none;
    background-color: #f0f0f0;
    border-radius: 4px;
    user-select: none;
    cursor: grab;
  }

  .image-container:active {
    cursor: grabbing;
  }

  .image-container img {
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
    max-width: none;
    max-height: none;
    transform-origin: 0 0;
  }
</style>
