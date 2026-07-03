<template>
  <div class="designer" :style="styleCssVar">
    <div class="designer__toolbar">
      <slot name="toolbar"></slot>
    </div>
    <div class="designer__spread-sheet">
      <slot name="spreadSheet"></slot>
    </div>
    <div class="designer__toolkit">
      <slot name="toolkit"></slot>
    </div>
    <div class="designer__panel">
      <div class="divider" @mousedown="handleMouseDown"></div>
      <slot name="panel"></slot>
    </div>
  </div>
</template>

<script lang="ts" setup name="designer-wrapper">
  import { computed, ref } from 'vue';

  function useLocalMouseOffset(opts: {
    onStart: () => void;
    onChange: (opts: { offsetX: number; offsetY: number }) => void;
  }) {
    const handleMouseDown = (e: MouseEvent) => {
      const startX = e.clientX;
      const startY = e.clientY;
      opts.onStart();

      function handleMouseMove(e2: MouseEvent) {
        opts.onChange({
          offsetX: e2.clientX - startX,
          offsetY: e2.clientY - startY,
        });
      }

      function handleMouseUp() {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      }

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    return {
      handleMouseDown,
    };
  }

  const styleCssVar = computed(() => {
    return {
      '--panel-size': `${panelWidth.value}px`,
    };
  });

  const panelWidth = ref(248);
  let lastPanelWidth = 0;
  const { handleMouseDown } = useLocalMouseOffset({
    onStart: () => {
      lastPanelWidth = panelWidth.value;
    },
    onChange: ({ offsetX }) => {
      panelWidth.value = lastPanelWidth - offsetX;
    },
  });
</script>

<style lang="less" scoped>
  .designer__panel {
    position: relative;
  }
  .divider {
    cursor: ew-resize;
    width: 6px;
    height: 100%;
    position: absolute;
    left: -3px;
    top: 0;
  }
</style>
