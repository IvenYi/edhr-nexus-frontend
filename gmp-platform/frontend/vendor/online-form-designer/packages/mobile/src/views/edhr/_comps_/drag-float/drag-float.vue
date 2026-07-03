<template>
  <div ref="target" class="drag-float" :class="{ 'is-dragging': isDragging }" :style="inlineStyle">
    <div class="content-wrapper" @mousedown="startDrag" @touchstart="startDrag" @click.capture="onClick">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, computed } from 'vue';

  const props = defineProps({
    initialPosition: {
      type: Object,
      default: () => ({ top: 0, right: 0 }),
    },
    zIndex: {
      type: Number,
      default: 9999,
    },
  });

  // 组件状态
  const target = ref(null);
  const y = ref(0);
  const x = ref(0);
  const isDragging = ref(false);
  const startY = ref(0);
  const startTop = ref(0);
  const windowHeight = ref(window.innerHeight);
  const elementHeight = ref(0);
  const isInitialized = ref(true);

  // 计算边界
  const minY = computed(() => {
    return 0;
  });

  const maxY = computed(() => {
    return windowHeight.value - elementHeight.value - minY.value;
  });

  // 重置初始化处理
  const resetInitialization = () => {
    isInitialized.value = true;
  };

  /** 初始化逻辑 */
  const initialize = () => {
    if (isInitialized.value) {
      windowHeight.value = window.innerHeight;
      if (target.value) {
        elementHeight.value = target.value.offsetHeight;
      }
      // 获取元素相对于视口(屏幕)的位置
      const rect = target.value.getBoundingClientRect();
      y.value = rect.top;
      x.value = rect.left;
      isInitialized.value = false;
    }
  };

  /** 行内样式 */
  const inlineStyle = computed(() => {
    const result = {
      zIndex: props.zIndex,
    };
    if (isInitialized.value) {
      Object.assign(result, props.initialPosition);
    } else {
      Object.assign(result, {
        top: `${y.value}px`,
        left: `${x.value}px`,
      });
    }
    return result;
  });

  // 开始拖动
  const startDrag = (e) => {
    // console.log('startDrag');
    initialize();
    isDragging.value = true;
    startY.value = e.clientY || e.touches[0].clientY;
    startTop.value = y.value;

    // 添加全局事件监听
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchend', stopDrag);
  };

  // 处理移动
  const handleMove = (e) => {
    // console.log('handleMove');
    if (!isDragging.value) return;
    const currentY = e.clientY || e.touches[0].clientY;
    const deltaY = currentY - startY.value;
    let newTop = startTop.value + deltaY;
    // 应用边界限制
    newTop = Math.max(minY.value, Math.min(newTop, maxY.value));
    y.value = newTop;
  };

  // 停止拖动
  const stopDrag = (e) => {
    // console.log('stopDrag');
    isDragging.value = false;

    // 移除全局事件监听
    document.removeEventListener('mousemove', handleMove);
    document.removeEventListener('touchmove', handleMove);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('touchend', stopDrag);
  };

  const onClick = (e)=>{
    // console.log('onClick');
    if(Math.abs(y.value - startTop.value) > 10){
      console.log('拖动超过10px阻止默认事件');
      e.stopPropagation();
      e.preventDefault();
    }
  }

  // 窗口大小变化处理
  const handleResize = () => {
    resetInitialization();
  };

  onMounted(() => {
    resetInitialization();
    window.addEventListener('resize', handleResize);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    stopDrag();
  });
</script>

<style scoped lang="less">
  .drag-float {
    position: fixed;
    z-index: 9999;
    touch-action: none;
    user-select: none;
    will-change: transform, top;
    contain: layout;
    max-width: 90vw;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    cursor: default;

    // 拖拽时缩放样式
    transform: scale(1);
    transition:
      top 0.3s ease,
      transform 0.2s ease;
  }

  .drag-float.is-dragging {
    cursor: grabbing;
    // 拖拽时缩放样式
    transform: scale(1.02);
    transition: none;
  }
</style>
