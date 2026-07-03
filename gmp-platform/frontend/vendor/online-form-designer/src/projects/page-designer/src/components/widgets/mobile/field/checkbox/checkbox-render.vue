<template>
  <vantField
    :props="widget.props"
    :style="widget.style"
    :formData="formData"
    :modelValue="value + ''"
  >
    <template #input>
      <FieldCheckbox
        v-model:value="value"
        :disabled="showDisabled"
        :readonly="showReadonly"
        :fieldType="fieldType"
        :tagStyle="props.widget.style"
        :options="selectOptions"
        :design="false"
        @change="changeCheckbox"
      />
    </template>
  </vantField>
</template>

<script setup lang="ts" name="gct-checkbox">
  import { ref, computed, reactive, toRaw, nextTick } from 'vue';
  import { useAsyncOptions, getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { Checkbox } from '/@page-designer/types/web';
  import vantField from '../../__components__/vantField.vue';
  import FieldCheckbox from '../../__components__/FieldCheckbox';
  import { useReadyonly, useDisabled } from '../../../hooks/useReadyonly';
  import { ICheckboxComponentExpose } from '/@/projects/page-designer/src/interface/web';

  const props = defineProps<{ modelValue?: string; widget: Checkbox; formData: any }>();
  const { modelKey, fieldType, field, bindModelKey, bindFieldKey, customMenu, customMenuFilter } =
    reactive(props.widget.props);
  const { getAsyncOptions, options } = useAsyncOptions(fieldType!);
  const Event = getPageEvent();
  //父表单获取模型大类型
  const preLocation = !bindFieldKey ? props.widget.preLocation! : null;
  const modelCategory = preLocation
    ? Event.context.gctWidgets[preLocation]?.props?.modeldata?.modelCategory
    : undefined;
  getAsyncOptions({ modelKey, fieldKey: field, bindModelKey, modelCategory });
  const emit = defineEmits(['update:modelValue']);

  const showReadonly = computed(() => useReadyonly(props.widget.props.readonly));

  const showDisabled = computed(() => useDisabled(props.widget.props.disabled));

  // 自定义枚举值
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

  const value = props.widget.props.field
    ? computed({
        get() {
          return props.modelValue?.split(',').filter((i) => i) || [];
        },
        set(value: string[]) {
          emit('update:modelValue', value?.join(','));
        },
      })
    : ref();
  /**
   * 获取选中的options
   */
  function getOptionValue() {
    return options.value.filter((i) => value.value.indexOf(i.value) > -1).map((i) => toRaw(i));
  }

  async function changeCheckbox() {
    await nextTick();
    let data = getOptionValue();
    Event.runEventByName('onChange', props.widget.events, value.value, data);
  }
  defineExpose<ICheckboxComponentExpose>({
    getValue({ option }: { option?: boolean } = {}) {
      if (option) {
        return getOptionValue();
      } else {
        return value.value;
      }
    },
    setValue(v) {
      value.value = v;
    },
  });
</script>
<style scoped lang="less">
  :deep(.van-checkbox .van-checkbox__icon .van-icon) {
    border-radius: 2px;
  }
</style>
