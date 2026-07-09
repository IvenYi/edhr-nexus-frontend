<template>
  <van-field
    class="app-design-select"
    v-model="value"
    :is-link="!readonly"
    readonly
    :label="label"
    :required="widget.props.required"
    :disabled="widget.props.disabled"
    :placeholder="widget.props.placeholder"
    :style="wrapperStyle"
  />
</template>
<script name="gct-select" setup lang="ts">
  import { computed, toRefs, inject } from 'vue';
  import { useStyle } from '/@page-designer/hooks/useStyle';
  import { widgetProps } from '/@page-designer/hooks/useWidget';

  const layout: any = inject('form-layout', {});
  const props = defineProps(widgetProps);
  const { readonly } = toRefs(props.widget.props);
  const { labelFont, wrapperStyle, contentFont } = useStyle(props.widget || props);

  const label = computed(() => {
    if (!props.widget.props.displayLabelText) {
      return '';
    }
    return props.widget.props.label;
  });

  const value = computed(() => {
    return readonly.value ? '设备一' : '';
  });
</script>

<style lang="less" scoped>
  :deep(.van-field__label) {
    color: v-bind('labelFont.color');
    font-size: v-bind('labelFont.fontSize');
    font-style: v-bind('labelFont.fontStyle');
    font-weight: v-bind('labelFont.fontWeight');
    text-align: v-bind('labelFont.textAlign');
    text-decoration-line: v-bind('labelFont.textDecorationLine');
  }
  :deep(.app-tag-cell-box.van-cell .van-cell__value) {
    & > div {
      display: inline-block;
    }
  }
  :deep(.van-field__body) {
    padding: v-bind("layout.inputBg && !notNeedBgColor?'10px 0':''");
    border-radius: 4px;
    background-color: v-bind("layout.inputBg && !notNeedBgColor?'#F9FAFB':''");
    font-size: 16px;
    textarea {
      padding-left: v-bind("layout.inputBg?'12px':''");
      text-align: v-bind(
        "contentFont.textAlign ? contentFont.textAlign : layout.inputAlign||'left'"
      );
    }
    input {
      padding-left: v-bind("layout.inputBg?'12px':''");
      text-align: v-bind(
        "contentFont.textAlign ? contentFont.textAlign : layout.inputAlign||'left'"
      );
    }
  }
  :deep(.van-field__body:has(.van-field__control .time-input)) {
    padding: 0;
    background-color: transparent;
    .time-input {
      input {
        width: v-bind("layout.inputBg?'32px':'24px'");
        height: v-bind("layout.inputBg?'32px':'24px'");
        border-width: v-bind("layout.inputBg?'1px':0");
      }
      span {
        line-height: v-bind("layout.inputBg?'32px':'24px'");
      }
    }
    .time-input__null {
      input {
        background-color: v-bind("layout.inputBg?'#F9FAFB':'transparent'");
      }
    }
  }
  :deep(.van-cell__right-icon) {
    display: flex;
    align-items: center;
    height: auto;
    margin-left: -2px;
    padding: v-bind("layout.inputBg?'10px 0':''");
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
    background-color: v-bind("layout.inputBg?'#F9FAFB':''");
    line-height: inherit;
  }
  :deep(.van-cell__value) {
    text-align: v-bind("contentFont.textAlign ? contentFont.textAlign : layout.inputAlign||'left'");
    word-break: break-all;
  }
  .van-cell {
    background: transparent;

    &::after {
      border: none;
    }
  }
  .tag-label-disabled {
    padding-left: v-bind("layout.inputBg?'12px':''");
    opacity: 1;
    color: var(--van-field-input-disabled-text-color);
  }
</style>
