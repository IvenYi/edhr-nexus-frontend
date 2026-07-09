<template>
  <NocodeField
    :class="['field-datepicker']"
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
    <van-date-picker
      v-model="currentDate"
      :columnsType="dateFormat.columnsType"
      :title="'选择日期'"
      @confirm="confirm"
      @cancel="cancel"
    />
  </van-popup>
</template>

<script lang="ts" setup name="field-datepicker">
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
      format: 'YYYY-MM-DD',
    },
  );

  const emit = defineEmits<{
    (e: 'update:modelValue', value: string | undefined): void;
  }>();

  const currentDate = ref();
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

    const baseDate = props.modelValue ? props.modelValue : dayjs();
    const date = dayjs(baseDate).format(props.dateType);
    currentDate.value = date.split('-');
  };

  const confirm = async () => {
    await nextTick();
    show.value = false;

    const date = dayjs(currentDate.value?.join('-')).format(dateFormat.value.valueFormat);

    value.value = date;
    props.onChange?.();
  };

  const cancel = () => {
    show.value = false;
  };
</script>
