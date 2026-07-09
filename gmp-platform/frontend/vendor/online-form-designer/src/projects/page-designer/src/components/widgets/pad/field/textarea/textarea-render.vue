<template>
  <vantField
    v-model="value"
    :props="widget.props"
    :style="widget.style"
    type="textarea"
    :maxlength="maxlength"
    :show-word-limit="!showReadonly"
    :placeholder="widget.props.placeholder"
    @update:model-value="onChange"
    @focus="onFocus"
    @blur="onBlur"
    rows="4"
    @keypress.enter="onEnter"
    :key="showReadonly"
    :formData="formData"
    clearable
    @clearValue="onClear"
    :readonly="showReadonly"
    :class="showReadonly ? 'readonly' : ''"
    :disabled="showDisabled"
  >
    <template #input v-if="showReadonly && props.widget.style?.tagStyleOpen">
      <taglabel v-bind="separatorAttr" />
    </template>
  </vantField>
</template>

<script name="gct-textarea" setup lang="ts">
  import { toRef, computed, reactive, nextTick } from 'vue';
  import { Input } from '/@page-designer/types/mobile';
  import { useFormWidget } from '/@page-designer/components/widgets/hooks/formhook';
  import vantField from '../../__components__/vantField.vue';
  import taglabel from '../../__components__/taglabel.vue';
  import { useReadyonly, useDisabled } from '../../../hooks/useReadyonly';
  import { IMobTextareaComponentExpose } from '/@/projects/page-designer/src/interface/mobile';

  const props = defineProps<{ modelValue?: string; widget: Input; formData: any }>();
  const { fieldType } = reactive(props.widget.props);
  const maxlength = toRef(() => props.widget.props.maxlength);
  const emit = defineEmits(['update:modelValue']);
  const { onChange, onEnter, onBlur, onFocus, getValue, setValue, value } = useFormWidget(
    props,
    emit,
  );

  const showReadonly = computed(() => useReadyonly(props.widget.props.readonly));

  const showDisabled = computed(() => useDisabled(props.widget.props.disabled));

  const separatorAttr = computed(() => {
    return {
      type: fieldType,
      tagWidgetStyle: props.widget.style,
      disabled: showDisabled.value,
      label: value.value ?? '',
    };
  });
  const onClear = async () => {
    emit('update:modelValue', null);
    await nextTick();
    onChange();
    onBlur();
  };
  defineExpose<IMobTextareaComponentExpose>({ getValue, setValue });
</script>

<style lang="less" scoped></style>
