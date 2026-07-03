<template>
  <div>
    <div class="ks-row-middle mb5px">
      <a-input v-model:value="fontSize" suffix="px" type="number" />
      <g-color-picker
        class="ml8px"
        :preset="presetColor"
        :color="fontColor"
        @update:color="handleUpdateColor"
      >
        <template #icon>
          <div
            :style="{
              width: '24px',
              height: '24px',
              backgroundColor: fontColor,
            }"
          ></div>
        </template>
      </g-color-picker>
    </div>

    <font-style-group :fontStyle="fontStyle" />
  </div>
</template>

<script setup lang="ts" name="font-editor">
  import GColorPicker from '/@/components/ColorPicker/src/ColorPicker.vue';
  import FontStyleGroup from './table-font-style-group.vue';
  import { presetColor } from '/@page-designer/hooks/useStyleEditor';
  import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
  import { computed, ref, watch } from 'vue';
  import { platform } from '/@page-designer/hooks/usePage';
  import { Platform } from '/@page-designer/enum';

  const defaultFont = {
    fontSize: platform.value === Platform.PAD ? '16' : '14',
    color: '#000000',
  };
  const props = defineProps<{ fontStyle: LowCodeWidget.FontStyle }>();

  const handleUpdateColor = (_e, color) => {
    fontColor.value = color;
  };
  const fontSize = computed({
    get() {
      return props.fontStyle.fontSize || defaultFont.fontSize;
    },
    set(value) {
      props.fontStyle.fontSize = value;
    },
  });
  const fontColor = computed({
    get() {
      return props.fontStyle.color || defaultFont.color;
    },
    set(value) {
      props.fontStyle.color = value;
    },
  });
</script>

<style lang="less" scoped></style>
