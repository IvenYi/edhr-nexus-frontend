<template>
  <div>
    <div class="ks-row-middle mb-6px">
      <font-family-selector
        :disabled="disabled"
        v-model:value="formState.styles.fontFamily"
        class="flex-1"
      />

      <a-input-number
        class="font-size-editor ml8px"
        v-model:value="formState.styles.fontSize"
        :disabled="disabled"
        :min="12"
        :max="72"
        :step="1"
        :controls="false"
        :precision="0"
        size="small"
        addonAfter="px"
      />
      <g-color-picker
        class="ml8px"
        :class="{
          'pointer-events-none': disabled,
        }"
        :preset="presetColor"
        :color="formState.styles.color"
        @update:color="handleUpdateColor"
      >
        <template #icon>
          <div
            :style="{
              width: '22px',
              height: '22px',
              backgroundColor: formState.styles.color,
              borderRadius: '4px',
            }"
          ></div>
        </template>
      </g-color-picker>
    </div>
    <align-editor
      :disabled="disabled"
      type="fontStyle"
      :value="fontStyle"
      @update:value="handleUpdateFontStyle"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import GColorPicker from '/@/components/ColorPicker/src/ColorPicker.vue';
  import AlignEditor from './align-editor.vue';
  import type { PaperWidget } from '/@online-form/views/types/paper-widget';
  import { pick } from 'lodash-es';
  import FontFamilySelector from '/@online-form/views/designer/modules/base/font-family-selector.vue';

  const props = defineProps<{
    widget: PaperWidget.Text | PaperWidget.Pagination;
    disabled?: boolean;
  }>();

  const formState = computed({
    get() {
      return props.widget;
    },
    set(v) {
      Object.assign(props.widget, v);
    },
  });

  const fontColor = computed({
    get() {
      return props.widget.styles.color;
    },
    set(value) {
      // eslint-disable-next-line vue/no-mutating-props
      props.widget.styles.color = value;
    },
  });

  const fontStyle = computed(() => {
    return pick(props.widget.styles, ['fontWeight', 'fontStyle', 'textDecoration']);
  });

  const presetColor = [
    '#DBDBDB',
    '#FFE4E4',
    '#D1D1D1',
    '#838383',
    '#838383',
    '#FFEECB',
    '#D8E3FF',
    '#FF8888',
    '#FF8888',
    '#0DAA9C',
    '#3370FF',
  ];

  const handleUpdateColor = (_e, color) => {
    fontColor.value = color;
  };

  const handleUpdateFontStyle = (attr, val) => {
    Object.assign(props.widget.styles, {
      [attr]: props.widget.styles[attr] === val ? '' : val,
    });
  };
</script>

<style lang="less" scoped>
  .font-size-editor {
    --width: 88px;
    flex: none;
    width: var(--width);
    min-width: var(--width);
    max-width: var(--width);
  }
</style>
