<template>
  <a-form-item
    ref="formItemRef"
    :name="field"
    :label="label"
    :rules="{
      required: required,
      message: label + t('sys.pageDesigner.cannotBeEmpty'),
    }"
  >
    <RulesConfig v-model="fieldValue" :disabled="disabled || readonly" />
  </a-form-item>
</template>

<script setup lang="ts" name="gct-affix-input">
  import { ref, computed, reactive, inject } from 'vue';
  import type { ILabelParsingRules } from './schema';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useStyle } from '/@page-designer/hooks/useStyle';
  import RulesConfig from './components/rules-config.vue';

  const { t } = useI18n();

  const Event = getPageEvent();

  const props = defineProps<{
    modelValue?: string;
    widget: ILabelParsingRules;
    formData: Object;
  }>();

  const { required, disabled, readonly, label, field } = reactive(props.widget.props);

  const labelLayout = inject('labelLayout');
  const { labelFont } = useStyle(props.widget);

  const emit = defineEmits(['update:modelValue']);

  const formItemRef = ref();

  const fieldValue = computed<string>({
    get() {
      return props.modelValue || '';
    },
    set(value: string) {
      emit('update:modelValue', value);
      formItemRef.value?.onFieldChange();
      Event.runEventByName('onChange', props.widget.events, value);
    },
  });

  defineExpose({
    getValue() {
      return fieldValue.value;
    },
    setValue(value) {
      fieldValue.value = value;
    },
  });
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
