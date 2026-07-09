<template>
  <div v-if="readonly">{{ value ? checkedChildren : unCheckedChildren }}</div>
  <div class="ks-row-middle" v-else>
    <a-select
      v-model:value="value"
      v-bind="separatorAttr"
      class="ks-col"
      :disabled="disabled || !!useMore"
      dropdownClassName="gct-project-select-dropdown"
      @change="changeVlaue"
    >
      <a-select-option :key="item.value" :value="item.value" v-for="item in options">{{
        item.label
      }}</a-select-option>
    </a-select>
    <moreOption
      :disabled="disabled"
      @clear="$emit('update:modelValue', null)"
      v-model:useMore="useMore"
      v-model:ope="ope"
      :moreOptions="moreOptions"
      :label="label || fieldName"
      @change="changeVlaue"
    />
  </div>
</template>

<script name="gct-radio" setup lang="ts">
  import { computed, reactive, ref, toRefs } from 'vue';
  import { SearchSwitch } from '/@page-designer/types/web';
  import type { SelectProps } from 'ant-design-vue';
  import moreOption from '../more_option.vue';
  import { FieldSchema } from '/@page-designer/hooks/getFieldSchema';

  const props = defineProps<{ modelValue?: boolean; widget: SearchSwitch }>();
  const {
    placeholder,
    checkedChildren,
    unCheckedChildren,
    moreOptions,
    label,
    defaultValue,
    fieldName,
    modelKey,
    field,
  } = props.widget.props;
  const { ope, useMore, disabled, readonly } = toRefs(props.widget.props);
  const options = ref();
  const separatorAttr = computed(() => {
    let attr: SelectProps = {
      placeholder: placeholder,
      allowClear: true,
    };
    return attr;
  });
  const getOptions = async () => {
    const info = await FieldSchema.getConfigByField(modelKey, field);

    const option = info?.specificConfig;

    options.value = option
      ? Object.entries(option).map(([value, label]) => ({
          label,
       value: value === true || value === 'true' ? 1 : 0,
        }))
      : [];
  };
  getOptions();

  const emit = defineEmits(['update:modelValue', 'tableSearch']);

  const value = computed({
    get() {
      let value = props.modelValue;
      if (value === true) {
        return 1;
      }
      if (value === false) {
        return 0;
      }
      return value;
    },
    set(value) {
      if (props.modelValue !== value) {
        const val = value == null || value === '' ? undefined : !!value;
        emit('update:modelValue', val);
      }
    },
  });
  const changeVlaue = (val) => {
    emit('update:modelValue', val);
    emit('tableSearch');
  };
  // value.value = defaultValue;
  defineExpose({});
</script>
