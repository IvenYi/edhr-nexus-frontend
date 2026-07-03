<template>
  <div class="select-switcher-designer">
    <a-form-item :label="title" :required="required">
      <div class="container">
        <span class="text-muted">示例数据</span>
        <swap-outlined class="text-muted--icon" />
      </div>
    </a-form-item>
  </div>
</template>

<script lang="ts" setup>
  import { reactive, inject } from 'vue';
  import { ISelectSwitcher } from './schema';
  import { useStyle } from '/@page-designer/hooks/useStyle';

  const props = defineProps<{
    widget: ISelectSwitcher;
  }>();

  const { title, required } = reactive(props.widget.props);

  const labelLayout = inject('labelLayout');

  const { labelFont, contentFont } = useStyle(props.widget);

  console.log(labelFont, contentFont, 'widget: style');
</script>

<style lang="less" scoped>
  :deep(.ant-form-item-label) {
    width: v-bind('labelLayout?.width');
    text-align: v-bind('labelFont.textAlign');

    > label {
      color: v-bind('labelFont.color');
      font-size: v-bind('labelFont.fontSize');
      font-style: v-bind('labelFont.fontStyle');
      font-weight: v-bind('labelFont.fontWeight');
      text-decoration-line: v-bind('labelFont.textDecorationLine');
    }
  }
  .container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    height: 24px;
    line-height: 24px;

    .text-muted {
      font-size: v-bind('contentFont.fontSize');
      font-weight: v-bind('contentFont.fontWeight');

      &--icon {
        font-size: v-bind('contentFont.fontSize');
        font-weight: v-bind('contentFont.fontWeight');
        background: #ffffff;
        height: 24px;
        width: 24px;
        border-radius: 0.25rem;
        border: 1px solid #e0e3ebff;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
</style>
