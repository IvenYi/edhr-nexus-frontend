<template>
  <FieldRadio
    v-model:value="value"
    :readonly="readonly"
    :fieldType="fieldType"
    :tagStyle="widget.style"
    :design="false"
    :options="selectOptions"
    @change="changeRadio"
  />
</template>

<script name="gct-radio" setup lang="ts">
  import { nextTick, toRaw, reactive, toRefs, computed } from 'vue';
  import { useAsyncOptions, getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { Radio } from '/@page-designer/types/web';
  import { useFormWidget } from '/@page-designer/components/widgets/hooks/formhook';
  import FieldRadio from '../../__components__/formcomponent/FieldRadio';
  import { IRadioComponentExpose } from '/@/projects/page-designer/src/interface/web';

  const props = defineProps<{ modelValue?: string; widget: Radio; formData: Object }>();
  const emit = defineEmits(['update:modelValue', 'saveTableRow']);
  const { fieldType, modelKey, field, bindModelKey, bindFieldKey, customMenu, customMenuFilter } =
    reactive(props.widget.props);
  const { readonly } = toRefs(props.widget.props);
  const { formData } = toRefs<{ [key: string]: any }>(props);
  const { getAsyncOptions, options } = useAsyncOptions(fieldType!);

  const { setValue, value } = useFormWidget(props, emit);
  const Event = getPageEvent();
  const preLocation = !bindFieldKey ? props.widget.preLocation! : null;
  //父表单获取模型大类型
  const modelCategory = preLocation
    ? Event.context.gctWidgets[preLocation]?.props?.modeldata?.modelCategory
    : undefined;
  getAsyncOptions({ modelKey, fieldKey: field, bindModelKey, modelCategory });
  /**
   * 获取选中的options
   */
  function getOptionValue() {
    let data = options.value.find((i) => i.value === value.value);
    return toRaw(data);
  }
  const selectOptions = computed<any>(() => {
    if (customMenu) {
      const customOption = options.value.filter((item) => {
        return customMenuFilter.includes(item.value);
      });
      return customOption;
    } else {
      return options.value;
    }
  });
  async function changeRadio() {
    await nextTick();
    let data = getOptionValue();
    Event.runEventByName('onChange', props.widget.events, value.value, data, formData.value);
    !!formData.value._DICT || (formData.value._DICT = {});
    if (data) {
      /**填充翻译后的值 */
      formData.value._DICT[field] = { [value.value]: data.map((i) => i.label) };
    }
    /**列字段时候触发保存 */
    emit('saveTableRow');
  }
  defineExpose<IRadioComponentExpose>({
    setValue,
    getValue({ option }: { option?: boolean } = {}) {
      if (option) {
        return getOptionValue();
      } else {
        return value.value;
      }
    },
    reload() {},
  });
</script>
