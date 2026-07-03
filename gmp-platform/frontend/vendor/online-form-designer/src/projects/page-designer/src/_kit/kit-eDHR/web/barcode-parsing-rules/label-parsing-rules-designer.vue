<template>
  <a-form-item :label="label" :required="required">
    <RulesConfig v-model="form" :disabled="disabled" :readonly="readonly" />
  </a-form-item>
</template>

<script setup lang="ts" name="gct-affix-input">
  import { ref, toRefs, inject } from 'vue';
  import { useStyle } from '/@page-designer/hooks/useStyle';
  import type { ILabelParsingRules } from './schema';
  import RulesConfig from './components/rules-config.vue';
  import { Config_Fields } from './components/type';

  const props = defineProps<{
    widget: ILabelParsingRules;
  }>();

  const labelLayout = inject('labelLayout');

  const { label, readonly, required, disabled } = toRefs(props.widget.props);

  const { labelFont } = useStyle(props.widget);

  const form = ref(
    JSON.stringify({
      list: [Config_Fields.materialCode],
    }),
  );
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
</style>
