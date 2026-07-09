<template>
  <van-field v-bind="formAttr" style="width: auto; padding: 0" v-model="value">
    <template v-if="isEmptyValueDisplay" #input>
      {{ emptyDisplayValue }}
    </template>
    <template #button v-if="value && !showIcon">
      <van-icon name="clear" size="20" color="#c8c9cc" @click.stop="onClear" />
    </template>
  </van-field>
</template>

<script name="gct-search-input" setup lang="ts">
  import { computed, reactive } from 'vue';
  import { SearchInput } from '/@page-designer/types/web';
  import type { FieldProps } from 'vant';
  import { useGlobalSetting } from '/@/hooks/platform/globalSetting';

  const { displayValue: emptyDisplayValue } = useGlobalSetting();

  const props = defineProps<{ modelValue?: string; widget: SearchInput; showIcon: boolean }>();

  const emit = defineEmits(['update:modelValue', 'search']);

  // const isEmptyValueDisplay = ref(false);

  const { defaultValue, placeholder, maxlength, readonly, disabled } = reactive(props.widget.props);

  const formAttr = computed(() => {
    return {
      name: props.widget.id,
      placeholder,
      maxlength: maxlength,
      inputAlign: 'right',
      disabled,
      readonly,
    } as FieldProps;
  });

  const value = computed({
    get() {
      return props.modelValue;
    },
    set(value) {
      emit('update:modelValue', value);
    },
  });

  value.value = defaultValue;

  const isEmptyValueDisplay = computed(() => {
    return props.widget.props.readonly && !value.value;
  });

  const onClear = () => {
    emit('update:modelValue', undefined);
  };

  defineExpose({});
</script>

<style lang="less" scoped></style>
