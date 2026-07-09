<template>
  <a-form-item :label="label" :required="widget.props.required">
    <a-select v-if="!widget.props.readonly"></a-select>
    <span v-else>示例治具</span>
  </a-form-item>
</template>

<script setup lang="ts" name="gct-fixture-select">
  import { computed } from 'vue';
  import { IFixtureSelect } from './schema';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useStyle } from '/@page-designer/hooks/useStyle';

  const { t } = useI18n();
  const props = defineProps<{
    widget: IFixtureSelect;
  }>();

  const { wrapperStyle, labelFont, contentFont } = useStyle(props.widget);

  const label = computed(() => {
    if (!props.widget.props.displayLabelText) {
      return '';
    }
    return props.widget.props.label || t('sys.kit.fixsure');
  });
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

    &:has(div.label-wrap) {
      overflow: visible;
      white-space: wrap;

      > label {
        align-items: start;
        max-height: none;
        margin-top: 5px;
      }
    }

    .label-ellipsis {
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  :deep(.ant-form-item-control) {
    .ant-form-item-control-input {
      .ant-form-item-control-input-content {
        text-align: v-bind('contentFont.textAlign');

        .ant-input,
        .ant-select .ant-select-selector,
        .ant-picker .ant-picker-input input {
          text-align: v-bind('contentFont.textAlign');
        }
      }
    }
  }
</style>
