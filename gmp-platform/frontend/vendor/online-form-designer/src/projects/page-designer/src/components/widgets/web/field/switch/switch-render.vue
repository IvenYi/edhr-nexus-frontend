<template>
  <component
    :is="cmp[bindCompStyleType]"
    v-bind="separatorAttr"
    v-model:value="value"
    v-model:checked="value"
    @change="onChangeDate"
  />
</template>

<script setup lang="ts" name="gct-switch">
  import { toRefs, computed, reactive, onBeforeMount, h } from 'vue';
  import { BindCmpStyleEnum } from '/@page-designer/enum';
  import { Switch as ASwitch } from 'ant-design-vue';
  import { useFormWidget } from '/@page-designer/components/widgets/hooks/formhook';
  import { useAsyncOptions } from '/@page-designer/components/widgets/hooks/hooks';
  import {
    FieldSelect,
    FieldRadio,
    FieldCheckbox,
  } from '/@page-designer/components/widgets/web/__components__/formcomponent';

  import { Switch } from '/@page-designer/types/web';
  import { ISwitchComponentExpose } from '/@/projects/page-designer/src/interface/web';

  const cmp = {
    [BindCmpStyleEnum.CMP_BOOLEAN]: ASwitch,
    [BindCmpStyleEnum.CMP_SELECT_LIST]: FieldSelect,
    [BindCmpStyleEnum.CMP_RADIO]: FieldRadio,
    [BindCmpStyleEnum.CMP_CHECKBOX]: FieldCheckbox,
  };

  const props = defineProps<{ modelValue?: string; widget: Switch; formData: Object }>();
  const {
    checkedChildren,
    unCheckedChildren,
    fieldType,
    field,
    modelKey,
    bindCompStyleType = '',
  } = reactive(props.widget.props);
  const { readonly } = toRefs(props.widget.props);
  const emit = defineEmits(['update:modelValue', 'saveTableRow']);

  const { onChange, getValue } = useFormWidget(props, emit);
  const onChangeDate = async () => {
    await onChange();
    emit('saveTableRow');
  };
  const { getAsyncOptions, options } = useAsyncOptions(fieldType!);

  onBeforeMount(() => {
    getAsyncOptions({ fieldKey: field, modelKey });
    // 初次因为值为null，表格编辑但未发生改变，需要从null转化为false
    if (!readonly.value) {
      emit('update:modelValue', getBoolValue(props.modelValue));
    }
  });

  const separatorAttr = computed(() => {
    const res = {};
    if (bindCompStyleType === BindCmpStyleEnum.CMP_BOOLEAN) {
      Object.assign(res, {
        class: readonly.value ? 'field-boolean--readyonly wauto' : '',
      });
    }
    return {
      checkedChildren,
      unCheckedChildren,
      readonly: readonly.value,
      fieldType: fieldType,
      tagStyle: props.widget.style,
      options: options.value,
      ...res,
    };
  });
  const getBoolValue = (val) => {
    if (val === 'true' || val === 'false') {
      return JSON.parse(val);
    }
    if (val === undefined || val === null || isNaN(parseInt(val))) {
      return Boolean(val);
    }

    return Boolean(parseInt(val));
  };

  const value = computed({
    get() {
      return getBoolValue(props.modelValue);
    },
    set(value) {
      if (readonly.value) return;
      emit('update:modelValue', value);
    },
  });

  defineExpose<ISwitchComponentExpose>({
    getValue,
    setValue(v) {
      props.formData[field] = v;
    },
  });
</script>
<style scoped lang="less">
  .ant-switch {
    min-width: 32px;
    height: 20px;
    line-height: 20px;

    &:not(.ant-switch-disabled).field-boolean--readyonly {
      opacity: 0.5;
      // pointer-events: none;
    }

    :deep(.ant-switch-handle) {
      top: 4px;
      left: 4px;
      width: 12px;
      height: 12px;
    }
  }

  .ant-switch-checked {
    :deep(.ant-switch-handle) {
      top: 3px;
      left: calc(100% - 16px);
      width: 14px;
      height: 14px;
    }
  }
</style>
