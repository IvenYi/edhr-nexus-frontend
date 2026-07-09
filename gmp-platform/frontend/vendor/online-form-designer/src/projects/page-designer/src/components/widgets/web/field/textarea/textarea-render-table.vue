<template>
  <tagelabel
    v-if="readonly"
    :label="value"
    :type="fieldType"
    :tagWidgetStyle="widget.style"
    :isDesign="false"
  />
  <a-textarea
    v-else
    ref="textareaRef"
    v-model:value="value"
    @change="onChange"
    @pressEnter="onEnter"
    @blur="onBlur"
    @focus="onFocus"
    :auto-size="{ minRows: 1, maxRows: 1 }"
    v-bind="separatorAttr"
  />
</template>

<script name="gct-textarea" setup lang="ts">
  import { computed, reactive, toRefs, onMounted, ref } from 'vue';
  import { useFormWidget } from '/@page-designer/components/widgets/hooks/formhook';
  import { Textarea } from '/@page-designer/types/web';
  import type { TextAreaProps } from 'ant-design-vue';
  import tagelabel from '../../__components__/formcomponent/field-label/taglabel.vue';
  import { BindCmpStyleEnum } from '/@page-designer/enum';

  const props = defineProps<{ modelValue?: string; widget: Textarea; formData: Object }>();
  const emit = defineEmits(['update:modelValue']);
  const { onChange, onEnter, onBlur, onFocus, getValue, setValue, setInputFocus, value } =
    useFormWidget(props, emit);
  const { getFocus, placeholder, maxlength, clearable, fieldType, bindCompStyleType } = reactive(
    props.widget.props,
  );
  const { readonly } = toRefs(props.widget.props);

  const textareaRef = ref();

  onMounted(() => {
    setInputFocus(textareaRef, getFocus);
  });

  const separatorAttr = computed(() => {
    let attr: TextAreaProps = {
      // autofocus: getFocus,
      placeholder: placeholder,
      maxlength: maxlength,
      allowClear: clearable,
    };
    return attr;
  });

  defineExpose({ getValue, setValue });
</script>

<style lang="less" scoped></style>
