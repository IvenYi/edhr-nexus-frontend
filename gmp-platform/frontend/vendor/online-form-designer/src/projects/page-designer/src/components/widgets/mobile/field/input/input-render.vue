<template>
  <vantField
    ref="fieldRef"
    v-model="value"
    :props="widget.props"
    :style="widget.style"
    :maxlength="maxlength"
    @update:model-value="onChange"
    @focus="onFocus"
    @blur="onBlur"
    @keypress.enter="onEnter"
    :key="showReadonly"
    :formData="formData"
  >
    <template #input v-if="showReadonly">
      <taglabel v-bind="separatorAttr" />
    </template>
  </vantField>
</template>

<script name="gct-input" setup lang="ts">
  import { computed, reactive, ref } from 'vue';
  import { Input } from '/@page-designer/types/mobile';
  import vantField from '../../__components__/vantField.vue';
  import { useFormWidget } from '/@page-designer/components/widgets/hooks/formhook';
  import taglabel from '../../__components__/taglabel.vue';
  import { useReadyonly, useDisabled } from '../../../hooks/useReadyonly';
  import { IInputComponentExpose } from '/@/projects/page-designer/src/interface/mobile';

  const props = defineProps<{ modelValue?: string; widget: Input; formData: any }>();
  const emit = defineEmits(['update:modelValue']);
  const fieldRef = ref();
  const { onChange, onEnter, onBlur, onFocus, getValue, setValue, value, setInputFocus } =
    useFormWidget(props, emit);
  const { maxlength, fieldType } = reactive(props.widget.props);
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

  defineExpose<IInputComponentExpose>({
    getValue,
    setValue,
    focus: () => setInputFocus(fieldRef, true),
  });
</script>

<style lang="less" scoped></style>
