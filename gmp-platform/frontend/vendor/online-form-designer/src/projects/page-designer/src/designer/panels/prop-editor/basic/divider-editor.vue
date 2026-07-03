<template>
  <div class="flex items-center">
    <a-select
      v-model:value="borderStyle"
      size="small"
      class="mr-2 w-2/5"
      :options="
        ['solid', 'dashed', 'dotted'].map((style) => ({
          label: t(`sys.pageDesigner.dividerBorder.${style}`),
          value: style,
        }))
      "
    />
    <a-select
      v-model:value="borderWidth"
      size="small"
      class="mr-2 w-2/5"
      :options="[1, 2, 3, 4, 5].map((width) => ({ label: `${width}px`, value: width }))"
    />

    <div class="flex items-center p-[2px] rounded border-solid border-[#e0e3eb]">
      <color-picker :preset="presetColor" :color="borderColor" @update:color="handleUpdateColor">
        <template #icon>
          <div
            class="w-5 h-5 rounded"
            :style="{
              backgroundColor: borderColor,
            }"
          ></div>
        </template>
      </color-picker>
    </div>
  </div>
</template>

<script setup lang="ts" name="divider-editor">
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { computed, inject } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { presetColor } from '@gct/runtime';

  const { t } = useI18n();
  const globFieldInfo = inject<any>('globFieldInfo', {});

  const defProps = defineProps(props);
  const { propValue } = usePropEditor(
    defProps.propName,
    defProps.changeCallback,
    defProps.propConfig.supportGlobData ? globFieldInfo : {},
  );

  const borderStyle = computed({
    get() {
      return propValue.value.borderStyle;
    },
    set(val) {
      propValue.value = { ...propValue.value, borderStyle: val };
    },
  });

  const borderWidth = computed({
    get() {
      return propValue.value.borderWidth;
    },
    set(val) {
      propValue.value = { ...propValue.value, borderWidth: val };
    },
  });

  const borderColor = computed({
    get() {
      return propValue.value.borderColor;
    },
    set(val) {
      propValue.value = { ...propValue.value, borderColor: val };
    },
  });

  const handleUpdateColor = ({ r, g, b, a }) => {
    borderColor.value = `rgba(${r}, ${g}, ${b}, ${a})`;
  };
</script>
