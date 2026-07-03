<template>
  <rang-time
    v-model="valueRang"
    :props="separatorAttr"
    style="width: 100%"
    @change="emit('tableSearch')"
  />
</template>

<script setup lang="ts" name="gct-timepicker">
  import { ref, computed, reactive } from 'vue';
  import { SearchTime } from '/@page-designer/types/web';
  import type { TimePickerProps } from 'ant-design-vue';
  import rangTime from './rangs/rang_times.vue';
  import rangReadonly from './rangs/rang_readonly.vue';
  type Rangvalue = InstanceType<typeof rangTime>['$props']['modelValue'];
  const props = defineProps<{ modelValue?: any; widget: SearchTime }>();

  const separatorAttr = computed(() => {
    let attr: TimePickerProps = {
      allowClear: true,
      placeholder: '请选择',
      valueFormat: 'HH:mm:ss',
    };
    return attr;
  });
  const emit = defineEmits(['update:modelValue', 'tableSearch']);
  const valueRang = computed({
    get() {
      return props.modelValue;
    },
    set(value: Rangvalue) {
      emit('update:modelValue', value);
    },
  });
  const value = computed({
    get() {
      return props.modelValue;
    },
    set(value?: string) {
      emit('update:modelValue', value);
    },
  });
</script>
<style scoped lang="less"></style>
