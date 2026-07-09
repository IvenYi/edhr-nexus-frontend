<template>
  <form-item :label="$t('sys.onlineForm.lineDirection')" :inline="false">
    <a-radio-group v-model:value="formState.direction" name="radioGroup">
      <a-radio :value="LineDirection.vertical" :disabled="disabled">
        <div
          class="rounded-4px line h48px ml--24px mb4px"
          :class="[formState.direction === LineDirection.vertical && 'active']"
        >
          <div class="line1"></div>
        </div>
        <div>{{ $t('sys.appDesigner.printDesign.form.portrait') }}</div>
      </a-radio>
      <a-radio :value="LineDirection.horizontal" :disabled="disabled">
        <div
          class="rounded-4px line h48px ml--24px mb4px"
          :class="[formState.direction === LineDirection.horizontal && 'active']"
        >
          <div class="line2"></div>
        </div>
        <div>{{ $t('sys.appDesigner.printDesign.form.landscape') }}</div>
      </a-radio>
    </a-radio-group>
  </form-item>
  <form-item :label="$t('sys.onlineForm.lineAppearance')" :inline="false">
    <div class="ks-row-middle">
      <a-select
        :disabled="disabled"
        class="w-full"
        v-model:value="formState.lineStyle.borderStyle"
        size="small"
      >
        <a-select-option v-for="item in LineStyleOptions" :value="item.value" :key="item.value">
          <span>{{ item.label }}</span>
        </a-select-option>
      </a-select>

      <a-select
        :disabled="disabled"
        class="w-full important-ml8px"
        v-model:value="formState.lineStyle.borderWidth"
        size="small"
      >
        <a-select-option v-for="item in lineWidthOptions" :value="item" :key="item">
          <span>{{ item }}</span>
        </a-select-option>
      </a-select>

      <g-color-picker
        class="ml8px"
        :class="{
          'pointer-events-none': disabled,
        }"
        :preset="presetColor"
        :color="formState.lineStyle.borderColor"
        @update:color="handleUpdateColor"
      >
        <template #icon>
          <div
            :style="{
              width: '22px',
              height: '22px',
              backgroundColor: formState.lineStyle.borderColor,
              borderRadius: '4px',
            }"
          ></div>
        </template>
      </g-color-picker>
    </div>
  </form-item>
  <form-item :label="$t('sys.onlineForm.componentWidth')" :inline="false">
    <a-input-number
      :disabled="disabled"
      v-model:value="formState.layout.width"
      addon-after="px"
      size="small"
      :placeholder="$t('sys.onlineForm.pleaseEnterWidth')"
      :min="1"
      :step="1"
      :precision="0"
    />
  </form-item>
  <form-item label="旋转角度°" :inline="false">
    <a-input-number
      :disabled="disabled"
      v-model:value="formState.rotate"
      size="small"
      :placeholder="$t('sys.onlineForm.pleaseEnterAngle')"
      :precision="0"
      :min="0"
      :max="180"
    />
  </form-item>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { LineDirection } from '@gct/nocode-base';
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';
  import GColorPicker from '/@/components/ColorPicker/src/ColorPicker.vue';
  import { LineStyleOptions } from '/@online-form/views/designer/enums';
  import type { PaperWidget } from '/@online-form/views/types/paper-widget';

  const props = defineProps<{
    widget: PaperWidget.Line;
    disabled?: boolean;
  }>();

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

  const lineWidthOptions = [1, 2, 3, 4, 5, 6];

  const formState = computed({
    get() {
      if (!props.widget.direction) {
        props.widget.direction = LineDirection.horizontal;
      }
      return props.widget;
    },
    set(v) {
      Object.assign(props.widget, v);
    },
  });

  const lineColor = computed({
    get() {
      return props.widget.lineStyle.borderColor;
    },
    set(value) {
      // eslint-disable-next-line vue/no-mutating-props
      props.widget.lineStyle.borderColor = value;
    },
  });

  const handleUpdateColor = (_e, color) => {
    lineColor.value = color;
  };
</script>

<style lang="scss">
  .line {
    border: 1px solid #e8ebf0;
    width: 96px;
    position: relative;

    &.active {
      border-color: var(--ant-primary-color);
    }

    .line1,
    .line2 {
      background-color: #000000;
      position: absolute;
    }
    .line1 {
      width: 1px;
      height: 40px;
      top: 4px;
      left: 50%;
    }
    .line2 {
      width: 40px;
      height: 1px;
      top: 50%;
      left: 28px;
    }
  }
</style>
