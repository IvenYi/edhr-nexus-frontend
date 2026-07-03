<template>
  <div
    :class="['move-handle', { 'move-handle--mouse-down': mouseDownRef }]"
    @mousedown="handleMouseDown($event)"
  ></div>
</template>

<script setup lang="ts">
  import { ref, reactive } from 'vue';

  defineProps<{
    target: Nullable<HTMLElement>;
  }>();

  const emits = defineEmits(['change', 'mouseUp']);

  const mouseRes = reactive({
    startY: 0,
  });

  const mouseDownRef = ref<boolean>(false);

  const handleMouseUp = () => {
    mouseDownRef.value = false;
    mouseRes.startY = 0;
    emits('mouseUp');
  };

  const handleMouseMove = (e: MouseEvent) => {
    const moveDistance = (e?.clientY || 0) - mouseRes.startY;
    const px2Vh = 100 / window.innerHeight;
    emits('change', moveDistance * px2Vh);
  };

  const handleMouseDown = (e: MouseEvent) => {
    mouseDownRef.value = true;
    mouseRes.startY = e?.clientY || 0;
    window.addEventListener('mousemove', handleMouseMove);
    window.onmouseup = function () {
      window.onmouseup = null;
      handleMouseUp();
      window.removeEventListener('mousemove', handleMouseMove);
    };
  };
</script>

<style lang="less" scoped>
  .move-handle {
    position: absolute;
    z-index: 2;
    cursor: n-resize;
    height: 12px;
    top: -8px;
    left: 0;
    right: 0;
  }

  .move-handle--mouse-down .move-handle,
  .move-handle:hover {
    &::before {
      content: ' ';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      height: 8px;
      border-bottom: @border-width-base @border-style-base var(--ant-primary-color);
    }

    &::after {
      content: ' ';
      width: 64px;
      height: 6px;
      left: 50%;
      transform: translateX(-50%);
      position: absolute;
      top: 4px;
      border-radius: 3px;
      background: var(--ant-primary-color);
    }
  }
</style>
