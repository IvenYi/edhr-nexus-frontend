<template>
  <NocodeField
    :class="['field-timepicker']"
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
    <van-time-picker
      v-model="currentTime"
      @confirm="confirm"
      @cancel="cancel"
      :columns-type="dateFormat.columnsType"
      :title="'选择时间'"
    />
  </van-popup>
</template>

<script lang="ts" setup name="field-timepicker">
  import { computed, nextTick, ref } from 'vue';
  import dayjs from 'dayjs';
  import { DateFormat } from '@gct/nocode-base';
  import NocodeField from '../nocode-field/nocode-field.vue';

  const props = withDefaults(
    defineProps<{
      label?: string;
      modelValue?: string;
      format?: string;
      timeType: string;
      style?: object;
      popupProps?: object;
      onChange?: Function;
    }>(),
    {
      format: 'HH:mm:ss',
    },
  );

  const emit = defineEmits<{
    (e: 'update:modelValue', value: string | undefined): void;
  }>();

  const currentTime = ref();
  const show = ref(false);

  const value = computed({
    get() {
      if (props.modelValue) {
        return dayjs('0000-01-01 ' + props.modelValue).format(props.format);
      }
      return undefined;
    },
    set(val) {
      emit('update:modelValue', val);
    },
  });

  const dateFormat = computed(() => DateFormat[props.timeType]);

  const onClear = () => {
    emit('update:modelValue', undefined);
    props.onChange?.();
  };

  const showPopup = () => {
    show.value = true;
    // 选择时间来源：已有值或当前时间
    const baseTime = props.modelValue ? '0000-01-01 ' + props.modelValue : dayjs();
    const time = dayjs(baseTime).format(props.timeType);
    currentTime.value = time.split(':');
  };

  const confirm = async () => {
    await nextTick();
    show.value = false;

    const time = dayjs(`0000-01-01 ${currentTime.value.join(':')}`).format(
      dateFormat.value.valueFormat,
    );

    value.value = time;
    props.onChange?.();
  };

  const cancel = () => {
    show.value = false;
  };
</script>
