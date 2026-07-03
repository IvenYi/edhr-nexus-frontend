<template>
  <div class="designer-stage">
    <div class="designer-state-canvas">
      <designer-stage-header class="designer-stage-header" />
      <div ref="container" class="designer-canvas">
        <ActionBar
          :zoom="zoom"
          @zoomReset="zoomReset"
          @zoomAuto="zoomAuto"
          @zoomIn="zoomIn"
          @zoomOut="zoomOut"
        />
        <SketchRule ref="sketchRuleRef" v-bind="rulerProps" @zoomchange="updateZoom">
          <stage-canvas
            @movingItem="movingItem"
            @click.stop="handleClick"
            :style="{ top: offset, left: offset, pointerEvents: readonly ? 'none' : 'auto' }"
          />
        </SketchRule>
      </div>
    </div>
    <designer-panel v-if="!readonly" class="designer-panel" />
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref, onMounted, onUnmounted, reactive, watch } from 'vue';
  import SketchRule from 'vue3-sketch-ruler';
  import type { SketchRulerProps } from 'vue3-sketch-ruler';
  import { useResizeObserver, useDebounceFn } from '@vueuse/core';
  import DesignerStageHeader from './stage-header.vue';
  import DesignerPanel from '../panels/panel.vue';
  import StageCanvas from './stage-canvas.vue';
  import { ActionBar } from '../components/action-bar/action-bar';
  import { useDesigner, PanelEnum } from '../hooks/useDesigner';
  import { loadLabelInfo } from '../hooks/usePage';
  import 'vue3-sketch-ruler/lib/style.css';

  const props = defineProps<{
    id?: string;
    readonly?: boolean;
  }>();

  const sketchRuleRef = ref<any>();

  const count = ref<number>(0);

  const container = ref<HTMLDivElement>();

  const project = ref<any>({});

  useResizeObserver(container, () => {
    count.value += 1;
    handleResize();
  });

  const panZoomInst = computed<any>(() => {
    return sketchRuleRef.value?.panzoomInstance;
  });

  const { zoom, updateEditorZoom, selectedElements, togglePanel } = useDesigner();
  const offset = computed(() => {
    return 22 / zoom.value + 'px';
  });
  const lines = reactive<{ h: number[]; v: number[] }>({ h: [], v: [] });

  const shadow = reactive({ x: 0, y: 0, width: 0, height: 0 });

  const rulerProps = computed<SketchRulerProps>(() => {
    return {
      thick: 22,
      scale: zoom.value,
      palette: {
        bgColor: '#fff',
        longfgColor: '#ccc',
        fontColor: '#ccc',
        fontShadowColor: '#ccc',
        maxScale: 3,
        minScale: 0.3,
      },
      width: container.value?.clientWidth,
      height: container.value?.clientHeight,
      canvasWidth: project.value?.width,
      canvasHeight: project.value?.height,
      lines,
      shadow,
      count: count.value,
    };
  });

  watch(selectedElements, () => {
    lines.h = [];
    lines.v = [];
    shadow.x = 0;
    shadow.y = 0;
    shadow.width = 0;
    shadow.height = 0;
  });

  function pointerdown(e: MouseEvent): void {
    if (e.button === 1 && panZoomInst) {
      sketchRuleRef.value.cursorClass = 'grabCursor';
      panZoomInst.value.bind();
      panZoomInst.value.handleDown(e);
      e.preventDefault();
    }
  }

  function pointerup(e: MouseEvent): void {
    if (e.button === 1 && panZoomInst) {
      panZoomInst.value.destroy();
      sketchRuleRef.value.cursorClass = 'defaultCursor';
    }
  }

  function handleClick() {
    togglePanel(PanelEnum.WIDGET);
  }

  onMounted(() => {
    document.addEventListener('pointerdown', pointerdown);
    document.addEventListener('pointerup', pointerup);
  });

  onUnmounted(() => {
    document.removeEventListener('pointerdown', pointerdown);
    document.removeEventListener('pointerup', pointerup);
  });

  const handleResize = useDebounceFn(() => {
    if (sketchRuleRef.value) {
      sketchRuleRef.value.initPanzoom();
    }
  }, 300);

  const updateZoom = (e) => {
    updateEditorZoom(e.scale);
  };

  function zoomReset(): void {
    panZoomInst.value.bind();
    panZoomInst.value.zoom(1);
    panZoomInst.value.destroy();
  }

  function zoomAuto(): void {
    panZoomInst.value.bind();
    panZoomInst.value.reset();
    panZoomInst.value.destroy();
  }

  function zoomIn(): void {
    panZoomInst.value.bind();
    panZoomInst.value.zoomIn();
    panZoomInst.value.destroy();
  }

  function zoomOut(): void {
    panZoomInst.value.bind();
    panZoomInst.value.zoomOut();
    panZoomInst.value.destroy();
  }

  function movingItem(x, y, w, h): void {
    lines.h = [y, y + h];
    lines.v = [x, x + w];
    Object.assign(shadow, {
      x,
      y,
      width: w,
      height: h,
    });
  }

  async function init(id?): Promise<void> {
    project.value = await loadLabelInfo(id);
  }

  if (!props.readonly) {
    init();
  }

  watch(
    () => props.id,
    (id) => {
      init(id);
    },
    {
      immediate: true,
    },
  );
</script>

<style lang="scss" scoped>
  .designer-stage {
    display: flex;
    background-color: #fff;
  }

  .designer-state-canvas {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    width: 100%;
  }

  .designer-stage-header {
    flex-shrink: 0;
    height: 42px;
  }

  .designer-canvas {
    position: relative;
    flex-grow: 1;
    background-color: #f2f4f7;

    :deep(.sketch-ruler) {
      width: 100%;

      > .defaultCursor,
      > .grabCursor {
        background-color: #f2f4f7 !important;
      }
    }
  }

  .designer-panel {
    flex-shrink: 0;
    width: 248px;
    border-left: 1px solid #eaeaea;
  }
</style>
