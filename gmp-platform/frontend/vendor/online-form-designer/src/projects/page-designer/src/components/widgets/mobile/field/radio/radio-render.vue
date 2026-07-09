<template>
  <vantField :props="widget.props" :style="widget.style" :formData="formData" :modelValue="value">
    <template #input>
      <FieldRadio
        v-model:value="value"
        :disabled="showDisabled"
        :readonly="showReadonly"
        :fieldType="fieldType"
        :tagStyle="props.widget.style"
        :design="false"
        :options="selectOptions"
        @change="changeRadio"
      />
    </template>
  </vantField>
</template>

<script name="gct-radio" setup lang="ts">
  import { nextTick, toRaw, reactive, computed } from 'vue';
  import { Radio } from '/@page-designer/types/web';
  import { useFormWidget } from '/@page-designer/components/widgets/hooks/formhook';
  import vantField from '../../__components__/vantField.vue';
  import FieldRadio from '../../__components__/FieldRadio';
  import { useReadyonly, useDisabled } from '../../../hooks/useReadyonly';
  import { useAsyncOptions, getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { IMobRadioComponentExpose } from '/@/projects/page-designer/src/interface/mobile';

  const props = defineProps<{ modelValue?: string; widget: Radio; formData: any }>();
  const emit = defineEmits(['update:modelValue']);
  const { fieldType, modelKey, field, bindModelKey, bindFieldKey, customMenu, customMenuFilter } =
    reactive(props.widget.props);
  const Event = getPageEvent();
  const { getAsyncOptions, options } = useAsyncOptions(fieldType!);
  const preLocation = !bindFieldKey ? props.widget.preLocation! : null;
  //父表单获取模型大类型
  const modelCategory = preLocation
    ? Event.context.gctWidgets[preLocation]?.props?.modeldata?.modelCategory
    : undefined;
  getAsyncOptions({ modelKey, fieldKey: field, bindModelKey, modelCategory });
  const { onChange, setValue, value } = useFormWidget(props, emit);

  const showReadonly = computed(() => useReadyonly(props.widget.props.readonly));

  const showDisabled = computed(() => useDisabled(props.widget.props.disabled));
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
    onChange(data);
  }
  /**
   * 获取选中的options
   */
  function getOptionValue() {
    let data = options.value.find((i) => i.value === value.value);
    return toRaw(data);
  }
  defineExpose<IMobRadioComponentExpose>({
    getValue({ option }: { option?: boolean } = {}) {
      if (option) {
        return getOptionValue();
      } else {
        return value.value;
      }
    },
    setValue,
  });
</script>
