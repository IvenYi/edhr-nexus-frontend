<template>
  <a-select
    v-if="!(readonly || rowReadonly)"
    v-model:value="value"
    :dropdown-match-select-width="180"
    dropdown-class-name="gct-project-select-dropdown vxe-table--ignore-clear"
  >
    <a-select-option v-for="item in map[formData.type_]" :value="item">{{
      item && t('sys.pageDesigner.' + item)
    }}</a-select-option>
  </a-select>
  <div v-else>{{ value && t('sys.pageDesigner.' + value) }}</div>
</template>

<script name="gct-dynamic-show-type" setup lang="ts">
  import { computed, toRefs } from 'vue';
  import { Select } from '/@page-designer/types/web';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();

  const props = defineProps<{
    modelValue?: string;
    widget: Select;
    formData: Object;
    rowReadonly?: boolean;
  }>();
  const emit = defineEmits(['update:modelValue']);
  const { readonly, modeldata } = toRefs(props.widget.props);
  const { formData } = toRefs<{ [key: string]: any }>(props);

  const value = computed<any>({
    get() {
      let value = props.modelValue;
      return value;
    },
    set(v) {
      emit('update:modelValue', v);
    },
  });
  // 新版edhr需要
  const map = computed(() => {
    if (modeldata?.value && modeldata.value?.modelType === 'CHECK_LIST') {
      return {
        boolean: ['checkbox', 'radio', 'select'],
        decimal: ['input', 'select'],
        integer: ['input', 'select'],
        string: ['input', 'textarea', 'select'],
      };
    }
    return {
      boolean: ['switch', 'radio', 'select'],
      decimal: ['input', 'select'],
      integer: ['input', 'select'],
      string: ['input', 'textarea', 'select'],
    };
  });

  defineExpose({
    getValue() {
      return value.value;
    },
    setValue(v) {
      value.value = v;
    },
  });
</script>
