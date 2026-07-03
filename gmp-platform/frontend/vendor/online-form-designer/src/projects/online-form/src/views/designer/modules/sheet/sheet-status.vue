<template>
  <div :class="[ns.b(), isHidden && ns.m('hidden')]">
    <span :class="[ns.e('size-item')]">
      <span :class="[ns.e('label')]">W</span>
      <span :class="[ns.e('value')]">{{ width }}</span>
    </span>
    <span :class="[ns.e('size-item')]">
      <span :class="[ns.e('label')]">H</span>
      <span :class="[ns.e('value')]">{{ height }}</span>
    </span>
  </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import { range } from 'lodash-es';

  const ns = {
    b: () => 'gct-sheet-status',
    e: (element: string) => `gct-sheet-status__${element}`,
    m: (modifier: string) => `gct-sheet-status--${modifier}`,
  };

  const { selection, paper } = useSpreadSheet();

  const isHidden = computed(() => selection.l === 0 || selection.t === 0);

  const width = computed(() => {
    if (isHidden.value) return 0;
    const total = range(selection.l, selection.r + 1).reduce((sum, colNum) => {
      return sum + paper.value.cols[colNum - 1].width;
    }, 0);
    return Math.round(total);
  });

  const height = computed(() => {
    if (isHidden.value) return 0;
    const total = range(selection.t, selection.b + 1).reduce((sum, rowNum) => {
      return sum + paper.value.rows[rowNum - 1].height;
    }, 0);
    return Math.round(total);
  });
</script>

<style lang="scss" scoped>
  @include b(sheet-status) {
    position: absolute;
    top: calc(var(--y-size) + 10px);
    left: calc(var(--x-size) + 10px);
    background-color: #ffffff;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    padding: 8px;
    z-index: 10;

    @include m(hidden) {
      display: none;
    }

    @include e(size-item) {
      display: inline-block;
      & ~ & {
        margin-left: 16px;
      }
    }

    @include e(label) {
      font-weight: bold;
      margin-right: 8px;
    }
  }
</style>
