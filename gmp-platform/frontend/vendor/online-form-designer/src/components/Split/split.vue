<template>
  <div :class="[ns.b(), ns.m(position)]">
    <div
      :class="[ns.e('left')]"
      :style="position === 'left' && draggedWidth ? { width: draggedWidth + 'px' } : undefined"
    >
      <slot name="left"></slot>
    </div>
    <div :class="[ns.e('divider')]" @mousedown="handleMouseDown"> </div>
    <div
      :class="[ns.e('right')]"
      :style="position === 'right' && draggedWidth ? { width: draggedWidth + 'px' } : undefined"
    >
      <slot name="right"></slot>
    </div>
  </div>
</template>

<script lang="ts" setup name="split">
  import { useNamespace } from '@gct/runtime';
  import { computed, ref } from 'vue';
  import { useMouseOffset } from './logic';

  const ns = useNamespace('split');

  const props = withDefaults(
    defineProps<{
      value?: number;
      position?: 'left' | 'right';
    }>(),
    {
      value: undefined,
      position: 'left',
    },
  );

  const emit = defineEmits<{
    (e: 'update:value', value: number): void;
  }>();

  const _draggedWidth = ref();
  const draggedWidth = computed({
    get() {
      return props.value !== undefined ? props.value : _draggedWidth.value;
    },
    set(v) {
      _draggedWidth.value = v;
      emit('update:value', v);
    },
  });

  let lastWidth = 0;
  const { handleMouseDown } = useMouseOffset({
    onStart: () => {
      lastWidth = draggedWidth.value;
    },
    onChange: ({ offsetX }) => {
      draggedWidth.value = props.position === 'left' ? lastWidth + offsetX : lastWidth - offsetX;
    },
  });
</script>

<style lang="scss" scoped>
  $split: ();

  @include b(split) {
    @include set-component-css-var(split, $split);

    display: flex;

    @include m(left) {
      @include e(left) {
        flex-shrink: 0;
      }

      @include e(right) {
        flex-grow: 1;
        width: 1px;
      }
    }

    @include m(right) {
      @include e(right) {
        flex-shrink: 0;
      }

      @include e(left) {
        flex-grow: 1;
        width: 1px;
      }
    }

    @include e(divider) {
      flex-shrink: 0;
      width: 5px;
      cursor: ew-resize;

      &::before {
        content: '';
        display: block;
        width: 1px;
        height: 100%;
        background-color: #f0f0f0;
      }
    }
  }
</style>
