<template>
  <div class="ks-row-center-between text-center gct-select">
    <div class="w110px" @click="changeValue(pageLayoutModeEnum.SHOW_BOX_SCROLL)">
      <icon-next
        value="icon-platform:page-layout"
        :size="64"
        :style="{
          stroke:
            value === pageLayoutModeEnum.SHOW_BOX_SCROLL ? 'var(--ant-primary-color)' : '#E8EBF0',
        }"
      />

      <div>
        <a-radio
          size="small"
          class="text-12px"
          :checked="value === pageLayoutModeEnum.SHOW_BOX_SCROLL"
        >
          {{ $t(`sys.pageDesigner.${pageLayoutModeEnum.SHOW_BOX_SCROLL}`) }}</a-radio
        >
      </div>
    </div>
    <div class="w110px" @click="changeValue(pageLayoutModeEnum.SHOW_ALL_DATA)">
      <icon-next
        value="icon-platform:page-active"
        :size="64"
        :style="{
          stroke:
            value === pageLayoutModeEnum.SHOW_ALL_DATA ? 'var(--ant-primary-color)' : '#E8EBF0',
        }"
      />
      <div class="text-12px">
        <a-radio
          :checked="value === pageLayoutModeEnum.SHOW_ALL_DATA"
          size="small"
          class="text-12px"
        >
          {{ $t(`sys.pageDesigner.${pageLayoutModeEnum.SHOW_ALL_DATA}`) }}
        </a-radio>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watchEffect, computed } from 'vue';
  import { pageLayoutModeEnum } from '@gct/runtime';

  const props = defineProps<{ modelValue?: string }>();
  const emit = defineEmits(['update:modelValue']);
  const value = computed<pageLayoutModeEnum>({
    get() {
      return props.modelValue ?? '';
    },
    set(value) {
      emit('update:modelValue', value ?? '');
    },
  });
  function changeValue(v) {
    value.value = v;
  }
</script>
<style scoped lang="less">
  .gct-select {
    white-space: nowrap;

    & > div {
      cursor: pointer;
    }

    :deep(.ant-radio-wrapper) {
      margin: 0;
    }
  }
</style>
