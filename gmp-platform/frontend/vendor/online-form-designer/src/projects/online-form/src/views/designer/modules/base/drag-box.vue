<template>
  <div
    ref="DragRef"
    class="drag-box"
    :class="{
      selected: selected,
      hover: hover,
    }"
    :style="style"
  >
    <div class="drag-box__move">
      <slot></slot>
    </div>
    <template v-if="resizable">
      <i v-for="item in ResizeDirection" :key="item" :class="item"></i>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import { useDraggable } from '/@online-form/views/designer/hooks/useDraggable';
  import { ResizeDirection } from '/@online-form/views/designer/enums';
  import { debounce } from 'lodash-es';

  const props = withDefaults(
    defineProps<{
      initialLayout: {
        width: number;
        height: number;
        top: number;
        left: number;
      };
      movable?: boolean;
      resizable?: boolean;
      selected?: boolean;
      hover?: boolean;
      type?: 'widget';
      allowLeave?: boolean;
      disabled?: boolean;
    }>(),
    {
      movable: true,
      resizable: true,
      selected: false,
      hover: false,
      allowLeave: true,
    },
  );

  const emit = defineEmits(['layout-change']);

  const DragRef = ref<HTMLElement | null>(null);

  /**
   * 获取吸附点位
   */
  function getXPoints() {
    return [
      document.querySelector('.padding-line--l')?.offsetLeft,
      document.querySelector('.padding-line--r')?.offsetLeft,
    ].filter((item) => item);
  }

  const options =
    props.type === 'widget'
      ? {
          getXPoints,
        }
      : undefined;

  const { layout, setLayout } = useDraggable(
    DragRef,
    {
      width: props.initialLayout.width,
      height: props.initialLayout.height,
      top: props.initialLayout.top,
      left: props.initialLayout.left,
    },
    {
      ...options,
      allowLeave: props.allowLeave,
      disabled: props.disabled,
    },
  );

  const style = computed(() => {
    if (props.resizable) {
      return {
        top: `${layout.top}px`,
        left: `${layout.left}px`,
        width: `${layout.width}px`,
        height: `${layout.height}px`,
      };
    } else {
      return {
        top: `${layout.top}px`,
        left: `${layout.left}px`,
      };
    }
  });

  const layoutChange = () => {
    emit('layout-change', layout);
  };
  const layoutChangeDebounce = debounce(layoutChange, 150);

  watch(
    () => layout,
    () => {
      layoutChangeDebounce();
    },
    { deep: true },
  );

  watch(
    () => props.initialLayout.width,
    (val) => {
      if (val !== layout.width) {
        setLayout('width', val);
      }
    },
  );
  watch(
    () => props.initialLayout.height,
    (val) => {
      if (val !== layout.height) {
        setLayout('height', val);
      }
    },
  );
</script>

<style lang="less" scoped>
  .drag-box {
    position: absolute;
    cursor: pointer;
    z-index: 100;
    --hover-color: #3168ec;

    &:hover,
    &.hover,
    &.selected {
      z-index: 200;
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        z-index: 1;
      }
    }

    &:hover,
    &.hover {
      &::before {
        border: 1px dashed var(--hover-color);
        background-color: rgba(from var(--hover-color) r g b / 12%);
      }
    }

    &.selected {
      &::before {
        border: 2px solid var(--hover-color);
      }

      & > i {
        display: flex;
      }
    }

    &__move {
      height: 100%;
      width: 100%;
      position: relative;

      &:hover {
        &::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 100%;
        }
      }
    }

    & > i {
      @size: 12px;
      @offset: 5px;
      @iconsize: 6px;
      position: absolute;
      height: @size;
      width: @size;
      display: none;
      align-items: center;
      justify-content: center;

      &::before {
        content: '';
        display: block;
        height: @iconsize;
        width: @iconsize;
        background-color: var(--hover-color);
      }

      &.n {
        cursor: @n-resize;
        top: @offset * -1;
        left: 50%;
        transform: translateX(-50%);
      }

      &.ne {
        cursor: @ne-resize;
        top: @offset * -1;
        right: @offset * -1;
      }

      &.e {
        cursor: @e-resize;
        top: 50%;
        transform: translateY(-50%);
        right: @offset * -1;
      }

      &.se {
        cursor: @se-resize;
        right: @offset * -1;
        bottom: @offset * -1;
      }

      &.s {
        cursor: @s-resize;
        bottom: @offset * -1;
        left: 50%;
        transform: translateX(-50%);
      }

      &.sw {
        cursor: @sw-resize;
        left: @offset * -1;
        bottom: @offset * -1;
      }

      &.w {
        cursor: @w-resize;
        left: @offset * -1;
        top: 50%;
        transform: translateY(-50%);
      }

      &.nw {
        cursor: @nw-resize;
        left: @offset * -1;
        top: @offset * -1;
      }
    }
  }
</style>
