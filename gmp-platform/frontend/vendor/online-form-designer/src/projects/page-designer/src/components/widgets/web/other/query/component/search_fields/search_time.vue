<template>
  <rangReadonly v-if="widget.props.readonly" :value="modelValue" :isRang="isRang" />
  <rang-time
    v-else-if="isRang"
    v-model="valueRang"
    :props="separatorAttr"
    style="width: 100%"
    @change="emit('tableSearch')"
  />
  <a-time-picker
    v-model:value="value"
    v-bind="separatorAttr"
    style="width: 100%"
    v-else
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
  const { placeholder, clearable, isRang } = reactive(props.widget.props);
  const separatorAttr = computed(() => {
    let attr: TimePickerProps = {
      allowClear: clearable,
      placeholder: placeholder,
      valueFormat: 'HH:mm:ss',
      // format: format,
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
