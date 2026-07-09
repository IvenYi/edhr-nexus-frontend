<template>
  <rangReadonly v-if="readonly" :value="modelValue" :isRang="isRang" />
  <rang-date
    v-else-if="isRang"
    v-model="valueRang"
    :props="separatorAttr"
    style="width: 100%"
    @change="emit('tableSearch')"
  />
  <a-date-picker
    v-model:value="value"
    v-bind="separatorAttr"
    style="width: 100%"
    v-else
    @change="emit('tableSearch')"
  />
</template>

<script setup lang="ts" name="gct-datetimepicker">
  import { computed, toRefs } from 'vue';
  import { SearchDateTime } from '/@page-designer/types/web';
  import type { DatePickerProps } from 'ant-design-vue';
  import { DateFormat } from '/@page-designer/components/widgets/hooks/const';
  import rangDate from './rangs/rang_date.vue';
  import rangReadonly from './rangs/rang_readonly.vue';
  import { timeReg } from '@gct/runtime';
  import { clone } from 'lodash-es';

  type Rangvalue = InstanceType<typeof rangDate>['$props']['modelValue'];
  const props = defineProps<{ modelValue?: any; widget: SearchDateTime }>();
  const { placeholder, clearable, isRang, readonly } = toRefs(props.widget.props);
  const dateType = props.widget.props.isShowTime ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD';
  const separatorAttr = computed(() => {
    let attr: DatePickerProps = {
      allowClear: clearable.value,
      placeholder: placeholder?.value,
      valueFormat: DateFormat[dateType].valueFormat,
      picker: DateFormat[dateType].picker,
      showTime: isDate ? { format: dateType } : false,
      format: dateType,
    };
    return attr;
  });
  const isDate = timeReg.test(dateType);

  const emit = defineEmits(['update:modelValue', 'tableSearch']);
  const valueRang = computed({
    get() {
      if (!isDate) {
        const arr = clone(props.modelValue) as string[];
        if (arr) {
          const items: string[] = [];
          if (arr[0]) {
            items[0] = arr[0].replace(' 00:00:00', '');
          }
          if (arr[1]) {
            items[1] = arr[1].replace(' 00:00:00', '');
          }
          return items;
        }
      }
      return props.modelValue;
    },
    set(value: Rangvalue) {
      if (!isDate && value) {
        const items: string[] = [];
        if (value[0]) {
          items[0] = `${value[0]} 00:00:00`;
        }
        if (value[1]) {
          items[1] = `${value[1]} 00:00:00`;
        }
        emit('update:modelValue', items);
      } else {
        emit('update:modelValue', value);
      }
    },
  });
  const value = computed({
    get() {
      if (!isDate && props.modelValue) {
        return props.modelValue.replace(' 00:00:00', '');
      }
      return props.modelValue;
    },
    set(value?: string) {
      if (!isDate && value) {
        emit('update:modelValue', `${value} 00:00:00`);
      } else {
        emit('update:modelValue', value);
      }
    },
  });
</script>
<style scoped lang="less"></style>
