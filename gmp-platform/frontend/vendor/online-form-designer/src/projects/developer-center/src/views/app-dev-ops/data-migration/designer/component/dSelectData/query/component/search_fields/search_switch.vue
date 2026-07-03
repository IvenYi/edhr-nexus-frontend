<template>
  <!-- <div v-if="readonly">{{ value ? checkedChildren : unCheckedChildren }}</div> -->
  <div class="ks-row-middle">
    <a-select
      v-model:value="value"
      v-bind="separatorAttr"
      class="ks-col"
      :disabled="disabled || !!useMore"
      dropdownClassName="gct-project-select-dropdown"
      @change="emit('tableSearch')"
    >
      <a-select-option :key="item.value" :value="item.value" v-for="item in options">{{
        item.label
      }}</a-select-option>
    </a-select>
  </div>
</template>

<script name="gct-radio" setup lang="ts">
  import { computed, reactive, toRefs } from 'vue';
  import { SearchSwitch } from '/@page-designer/types/web';
  import type { SelectProps } from 'ant-design-vue';
  import moreOption from '../more_option.vue';

  const props = defineProps<{ modelValue?: boolean; widget: SearchSwitch }>();
  const { name: label } = props.widget;

  const separatorAttr = computed(() => {
    let attr: SelectProps = {
      placeholder: '请选择',
      allowClear: true,
    };
    return attr;
  });
  const options = computed(() => {
    return [
      { label: '是', value: 1 },
      { label: '否', value: 0 },
    ];
  });

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

  defineExpose({});
</script>
