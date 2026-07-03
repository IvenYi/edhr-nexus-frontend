<template>
  <a-form-item :label="label" :required="required">
    <a-input
      v-if="!readonly"
      :placeholder="placeholder"
      :disabled="disabled"
      :addon-before="prefixText"
      :addon-after="suffixText"
    />
    <span v-else class="text-muted">{{ t('sys.pageDesigner.sampleText') }}</span>
  </a-form-item>
</template>

<script setup lang="ts" name="gct-affix-input">
  import { computed, toRefs, inject } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useStyle } from '/@page-designer/hooks/useStyle';
  import { IAffixInput } from './schema';

  const props = defineProps<{
    widget: IAffixInput;
  }>();

  const labelLayout = inject('labelLayout');

  const { label, readonly, required, disabled, openAffix, prefix, suffix, placeholder } = toRefs(
    props.widget.props,
  );

  const { labelFont, contentFont } = useStyle(props.widget);

  const { t } = useI18n();

  const prefixText = computed(() => (openAffix?.value && prefix?.value ? prefix.value : ''));
  const suffixText = computed(() => (openAffix?.value && suffix?.value ? suffix.value : ''));
</script>

<style lang="less" scoped>
  :deep(.ant-form-item-label) {
    text-align: v-bind('labelFont?.textAlign');
    width: v-bind('labelLayout?.width');

    > label {
      color: v-bind('labelFont.color');
      font-size: v-bind('labelFont.fontSize');
      font-style: v-bind('labelFont.fontStyle');
      font-weight: v-bind('labelFont.fontWeight');
      text-decoration-line: v-bind('labelFont.textDecorationLine');
    }
    &:has(div.label-wrap) {
      white-space: wrap;
      overflow: visible;
      > label {
        margin-top: 5px;
        max-height: none;
        align-items: start;
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
        text-align: v-bind('fontAlign');
        .ant-input,
        .ant-select .ant-select-selector,
        .ant-picker .ant-picker-input input {
          text-align: v-bind('contentFont.textAlign');
        }
      }
    }
  }

  .text-muted {
    color: v-bind('contentFont.color');
    font-size: v-bind('contentFont.fontSize');
    font-weight: v-bind('contentFont.fontWeight');
  }
</style>
