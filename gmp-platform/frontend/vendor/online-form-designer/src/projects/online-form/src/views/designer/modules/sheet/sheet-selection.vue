<template>
  <div v-show="selection.t > 0" class="selection" :style="style">
    <div
      class="selection__mask"
      :style="{
        'clip-path': clipPath,
      }"
    >
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';

  const { selection, colWidthStage: ws, rowHeightStage: rs } = useSpreadSheet();
  const clipPath = computed(() => {
    const {
      l,
      t,
      e: { _l, _r, _t, _b },
    } = selection;
    return `polygon(
          ${ws.value[_r] - ws.value[l - 1]}px  ${rs.value[_t - 1] - rs.value[t - 1]}px,
          0 ${rs.value[_t - 1] - rs.value[t - 1]}px,
          0 0,
          100% 0,
          100% 100%,
          0 100%,
          0 ${rs.value[_t - 1] - rs.value[t - 1]}px,
          ${ws.value[_l - 1] - ws.value[l - 1]}px ${rs.value[_t - 1] - rs.value[t - 1]}px,
          ${ws.value[_l - 1] - ws.value[l - 1]}px ${rs.value[_b] - rs.value[t - 1]}px,
          ${ws.value[_r] - ws.value[l - 1]}px ${rs.value[_b] - rs.value[t - 1]}px,
          ${ws.value[_r] - ws.value[l - 1]}px ${rs.value[_t - 1] - rs.value[t - 1]}px
        )`;
  });

  const style = computed(() => {
    return {
      top: `${rs.value[selection.t - 1]}px`,
      left: `${ws.value[selection.l - 1]}px`,
      width: `${ws.value[selection.r] - ws.value[selection.l - 1] + 1}px`, // +1是覆盖右下边框线
      height: `${rs.value[selection.b] - rs.value[selection.t - 1] + 1}px`,
    };
  });
</script>

<style lang="less" scoped>
  .selection {
    pointer-events: none;
    position: absolute;
    z-index: 199;
    &__mask {
      height: 100%;
      width: 100%;
      background-color: rgba(from var(--ant-primary-color) r g b / 10%);
    }
    outline: 2px solid var(--ant-primary-color);
    outline-offset: -2px;
  }
</style>
