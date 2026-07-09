<template>
  <div>
    <!-- {{ selectedStyle }} -->
    <div class="ks-row-middle mb5px">
      <!-- <a-input v-model:value="fontSize" suffix="px" type="number" size="small" /> -->
      <a-input-number
        v-model:value="fontSize"
        :min="0"
        :controls="true"
        :precision="0"
        style="width: 100%"
        size="small"
        addonAfter="px"
      />
      <g-color-picker
        class="ml8px"
        :preset="presetColor"
        :color="fontColor"
        v-if="!hiddenColor"
        @update:color="handleUpdateColor"
      >
        <template #icon>
          <div
            :style="{
              width: '22px',
              height: '22px',
              backgroundColor: fontColor,
              borderRadius: '4px',
            }"
          ></div>
        </template>
      </g-color-picker>
    </div>
    <align-group :name="name" :widget="widget" :options="options" />
    <font-style-group :name="name" :widget="widget" />
  </div>
</template>

<script setup lang="ts" name="font-editor">
  import GColorPicker from '/@/components/ColorPicker/src/ColorPicker.vue';
  import FontStyleGroup from './font-style-group.vue';
  import AlignGroup from './align-group.vue';
  import { presetColor } from '/@page-designer/hooks/useStyleEditor';
  import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
  import { computed } from 'vue';
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';
  import { platform } from '/@page-designer/hooks/usePage';
  import { Platform } from '@gct/runtime';

  const { selectedStyle } = useSelectedWidget();

  const props = defineProps({
    name: {
      type: String,
      default: 'labelFont',
    },
    widget: {
      type: Object as PropType<LowCodeWidget.BasicSchema>,
    },
    options: {
      type: Array,
    },
    hiddenColor: {
      type: Boolean,
      default: false,
    },
  });
  const defaultFont = {
    fontSize: platform.value === Platform.PAD ? '16' : '14',
    color: '#000000',
  };
  const fontSize = computed({
    get() {
      return selectedStyle.value[props.name]?.fontSize || defaultFont.fontSize;
    },
    set(value) {
      if (selectedStyle.value[props.name]) {
        selectedStyle.value[props.name].fontSize = value;
      } else {
        selectedStyle.value[props.name] = { fontSize: value };
      }
    },
  });
  const fontColor = computed({
    get() {
      return selectedStyle.value[props.name]?.color || defaultFont.color;
    },
    set(value) {
      if (selectedStyle.value[props.name]) {
        selectedStyle.value[props.name].color = value;
      } else {
        selectedStyle.value[props.name] = { color: value };
      }
    },
  });
  const handleUpdateColor = (_e, color) => {
    fontColor.value = color;
  };
</script>

<style lang="less" scoped></style>
