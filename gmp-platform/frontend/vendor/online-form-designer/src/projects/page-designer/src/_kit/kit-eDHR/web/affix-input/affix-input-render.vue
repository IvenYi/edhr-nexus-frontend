<template>
  <a-form-item
    ref="affixInputRef"
    :name="field"
    :label="label"
    :class="[fieldDisabled ? 'from-item--disabled' : null, readonly ? 'readonly-field-item' : '']"
    :rules="{
      required: !formReadonly && !readonly && !fieldDisabled && required,
      message: label + t('sys.pageDesigner.cannotBeEmpty'),
    }"
  >
    <FieldReadonly
      v-if="readonly"
      :tagWidgetStyle="props.widget.style"
      :label="props.modelValue"
      :is-design="false"
    />
    <a-input
      v-else
      :disabled="fieldDisabled"
      v-model:value="fieldValue"
      :addon-before="prefixText"
      :addon-after="suffixText"
      @change="handleChange"
      @enter="handleEnter"
      @blur="handleBlur"
      @focus="handleFocus"
    />
  </a-form-item>
</template>

<script setup lang="ts" name="gct-affix-input">
  import { ref, computed, reactive, inject } from 'vue';
  import type { IAffixInput } from './schema';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useStyle } from '/@page-designer/hooks/useStyle';
  import FieldReadonly from '/@page-designer/components/widgets/web/__components__/formcomponent/field-readonly.vue';

  const { t } = useI18n();

  const Event = getPageEvent();

  const props = defineProps<{
    modelValue?: string;
    widget: IAffixInput;
    formData: Object;
  }>();

  const { required, readonly, label, field, openAffix, suffix, prefix } = reactive(
    props.widget.props,
  );

  const formReadonly = inject('formReadonly');
  const labelLayout = inject('labelLayout');
  const { labelFont, contentFont } = useStyle(props.widget);

  const emit = defineEmits(['update:modelValue']);

  const affixInputRef = ref();
  const fieldDisabled = computed(() => props.widget.props.disabled);
  const prefixText = computed(() => (openAffix ? prefix : ''));
  const suffixText = computed(() => (openAffix ? suffix : ''));
  const fieldValue = computed<string>({
    get() {
      let value = props.modelValue || '';
      // 从后端获取的值可能包含前缀和后缀，需要移除
      if (openAffix) {
        if (prefix && value.startsWith(prefix)) {
          value = value.substring(prefix.length);
        }
        if (suffix && value.endsWith(suffix)) {
          value = value.substring(0, value.length - suffix.length);
        }
      }
      return value;
    },
    set(value: string) {
      // 保存到后端时，需要添加前缀和后缀
      let finalValue = value;
      if (openAffix) {
        if (prefix) {
          finalValue = prefix + finalValue;
        }
        if (suffix) {
          finalValue = finalValue + suffix;
        }
      }
      emit('update:modelValue', finalValue);
      affixInputRef.value?.onFieldChange();
    },
  });

  function handleChange() {
    Event.runEventByName('onChange', props.widget.events, fieldValue.value);
  }
  function handleEnter() {
    Event.runEventByName('onEnter', props.widget.events, fieldValue.value);
  }

  function handleBlur() {
    Event.runEventByName('onBlur', props.widget.events, fieldValue.value);
  }

  function handleFocus() {
    Event.runEventByName('onFocus', props.widget.events, fieldValue.value);
  }

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

  .from-item--disabled {
    :deep(.ant-form-item-label > label) {
      color: rgb(0 0 0 / 25%);
    }
  }
</style>
