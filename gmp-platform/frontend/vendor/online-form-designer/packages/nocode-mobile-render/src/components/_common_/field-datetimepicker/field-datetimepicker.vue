<template>
  <NocodeField
    :class="['field-datetimepicker']"
    v-model="value"
    :label="label"
    v-bind="$attrs"
    @click="showPopup"
    @clearValue="onClear"
    clearable
    readonly
  >
    <template v-for="(_slot, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps"></slot>
    </template>
  </NocodeField>
  <van-popup
    v-model:show="show"
    position="bottom"
    v-bind="popupProps"
    :style="{
      ...style,
      width: '375px',
      left: 'auto',
      right: 0,
      height: 'auto',
    }"
  >
    <van-picker-group :tabs="['选择日期', '选择时间']" @confirm="confirm" @cancel="cancel">
      <van-date-picker v-model="dateArr" />
      <van-time-picker v-model="timeArr" :columnsType="dateFormat.columnsType" />
    </van-picker-group>
  </van-popup>
</template>

<script lang="ts" setup name="field-datetimepicker">
  import { computed, nextTick, ref } from 'vue';
  import dayjs from 'dayjs';
  import { DateFormat } from '@gct/nocode-base';
  import NocodeField from '../nocode-field/nocode-field.vue';

  const props = withDefaults(
    defineProps<{
      label?: string;
      modelValue?: string;
      format?: string;
      dateType: string;
      style?: object;
      popupProps?: object;
      onChange?: Function;
    }>(),
    {
      format: 'YYYY-MM-DD HH:mm:ss',
    },
  );

  const emit = defineEmits<{
    (e: 'update:modelValue', value: string | undefined): void;
  }>();

  const dateArr = ref<any[]>([]);
  const timeArr = ref<any[]>([]);

  const show = ref(false);

  const value = computed({
    get() {
      if (props.modelValue) {
        return dayjs(props.modelValue).format(props.format);
      }
      return undefined;
    },
    set(val) {
      emit('update:modelValue', val);
    },
  });

  const dateFormat = computed(() => DateFormat[props.dateType]);

  const onClear = () => {
    emit('update:modelValue', undefined);
    props.onChange?.();
  };

  const showPopup = () => {
    show.value = true;

    const baseDateTime = props.modelValue ? props.modelValue : dayjs();
    const dt = dayjs(baseDateTime).format(props.dateType);
    const d = dayjs(baseDateTime).format(`YYYY-MM-DD`);
    const t = dt.replace(d, '');
    dateArr.value = d.split('-');
    timeArr.value = t.split(':');
  };

  const confirm = async () => {
    await nextTick();

    const datetime = dayjs(`${dateArr.value.join('-')} ${timeArr.value.join(':')}`).format(
      dateFormat.value.valueFormat,
    );

    show.value = false;
    value.value = datetime;
    props.onChange?.();
  };

  const cancel = () => {
    show.value = false;
  };
</script>
