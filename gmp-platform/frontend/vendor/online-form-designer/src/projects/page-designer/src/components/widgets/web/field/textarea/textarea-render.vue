<template>
  <FieldReadonly
    v-if="readonly"
    :label="value"
    :type="fieldType"
    :tagWidgetStyle="widget.style"
    :isDesign="false"
  />
  <a-textarea
    v-else
    class="flex-1"
    ref="textareaRef"
    v-model:value="value"
    @change="onChange"
    @pressEnter="onEnter"
    @blur="onBlur"
    @focus="onFocus"
    :auto-size="{ minRows: 2, maxRows: 5 }"
    v-bind="separatorAttr"
    show-count
  />
</template>

<script name="gct-textarea" setup lang="ts">
  import { computed, reactive, toRefs, ref, onMounted } from 'vue';
  import { useFormWidget } from '/@page-designer/components/widgets/hooks/formhook';
  import { Textarea } from '/@page-designer/types/web';
  import type { TextAreaProps } from 'ant-design-vue';
  import FieldReadonly from '../../__components__/formcomponent/field-readonly.vue';
  import { ITextareaComponentExpose } from '/@/projects/page-designer/src/interface/web';

  const props = defineProps<{ modelValue?: string; widget: Textarea; formData: Object }>();
  const emit = defineEmits(['update:modelValue']);
  const { onChange, onEnter, onBlur, onFocus, getValue, setValue, setInputFocus, value } =
    useFormWidget(props, emit);
  const { getFocus, placeholder, clearable, fieldType } = reactive(props.widget.props);
  const { readonly, maxlength } = toRefs(props.widget.props);
  const textareaRef = ref();

  onMounted(() => {
    setInputFocus(textareaRef, getFocus);
  });

  const separatorAttr = computed(() => {
    let attr: TextAreaProps = {
      // autofocus: getFocus,
      placeholder: placeholder,
      maxlength: maxlength?.value,
      allowClear: clearable,
    };
    return attr;
  });

  defineExpose<ITextareaComponentExpose>({ getValue, setValue });
</script>

<style lang="less" scoped></style>
