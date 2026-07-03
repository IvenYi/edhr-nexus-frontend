<template>
  <van-field
    v-if="isRang"
    v-bind="formAttr"
    :name="widget.id"
    v-model="rangeValue"
    style="padding: 0; background-color: transparent"
  >
    <template #input>
      <template v-if="readonly && !startValue && !endValue">
        {{ emptyDisplayValue }}
      </template>
      <div v-else class="ks-row-middle" style="width: 100%">
        <div class="start-item" @click="() => showPopup(PosEnum.Left)">
          <div class="start-val" v-if="startValue || readonly">
            {{ startValue || emptyDisplayValue }}
          </div>
          <div class="input-placeholder" v-else>{{ placeholder }}</div>
          <van-icon
            v-if="startValue && !showIcon"
            name="clear"
            size="20"
            color="#c8c9cc"
            @click.stop="() => onClear(PosEnum.Left)"
          />
        </div>
        <div class="w6 text-center">-</div>
        <div class="end-item" @click="() => showPopup(PosEnum.Right)">
          <div class="end-val" v-if="endValue || readonly">
            {{ endValue || emptyDisplayValue }}
          </div>
          <div class="input-placeholder" v-else>{{ placeholder }}</div>
          <van-icon
            v-if="endValue && !showIcon"
            name="clear"
            size="20"
            color="#c8c9cc"
            @click.stop="() => onClear(PosEnum.Right)"
          />
        </div>
      </div>
    </template>
  </van-field>
  <van-field
    v-else
    v-bind="formAttr"
    :modelValue="showDataTime"
    style="padding: 0; background-color: transparent"
    @click="() => showPopup(PosEnum.Single)"
  >
    <template #button v-if="value && !showIcon">
      <van-icon
        name="clear"
        size="20"
        color="#c8c9cc"
        @click.stop="() => onClear(PosEnum.Single)"
      />
    </template>
  </van-field>

  <van-popup v-model:show="show.isShow" position="bottom" teleport="body">
    <van-picker-group
      v-if="show.isShow"
      v-model:active-tab="active"
      :tabs="isDate ? ['选择日期', '选择时间'] : ['选择日期']"
      @confirm="onConfirm"
      @cancel="onCancel"
    >
      <van-date-picker
        ref="currDateRef"
        v-model="currentDateTime.compDateValue"
        :min-date="range[0]"
        :max-date="range[1]"
      />
      <van-time-picker
        ref="currTimeRef"
        v-model="currentDateTime.compTimeValue"
        v-bind="timePickerAttr"
        :min-time="minTime"
        :max-time="maxTime"
      />
    </van-picker-group>
  </van-popup>
</template>

<script setup lang="ts" name="gct-datetimepicker">
  import { computed, toRefs, reactive, ref, watch } from 'vue';
  import dayjs from 'dayjs';
  import { SearchDateTime } from '/@page-designer/types/web';
  import { DateFormat } from '/@page-designer/components/widgets/hooks/const';
  import type { FieldProps } from 'vant';
  import { timeReg } from '@gct/runtime';
  import { useGlobalSetting } from '/@/hooks/platform/globalSetting';

  const { displayValue: emptyDisplayValue } = useGlobalSetting();

  const PosEnum = {
    Left: 'left',
    Right: 'right',
    Single: 'single',
  } as const;

  type Position = (typeof PosEnum)[keyof typeof PosEnum];

  const props = defineProps<{
    modelValue?: string | string[];
    widget: SearchDateTime;
    showIcon: boolean;
  }>();

  const emit = defineEmits(['update:modelValue']);

  const { placeholder, dateType, isRang, readonly } = toRefs(props.widget.props);

  const show = reactive<{ isShow: boolean; pos: Position | '' }>({ isShow: false, pos: '' });

  // 格式化是否包含时间
  const isDate = timeReg.test(dateType.value);

  const currDateRef = ref<any>();

  const currTimeRef = ref<any>();

  const active = ref<string>('选择日期');

  // 当前选中的日期（用于时间限制计算）
  const currDate = computed(() => {
    // 始终获取日期选择器当前的值，不管是在哪个标签页
    const dateVal = currDateRef.value?.getSelectedDate?.();
    return dateVal?.length ? dateVal.join('-') : undefined;
  });

  const formAttr = computed<FieldProps>(() => ({
    name: props.widget.id,
    placeholder: placeholder.value,
    inputAlign: 'right',
    readonly: true,
    clickable: false,
    border: false,
  }));

  // 为纯日期格式添加时间部分
  const appendTimeToDate = (dateStr: string, isEnd = false): string => {
    if (dateStr.includes('00:00:00') || dateStr.includes('23:59:59')) {
      return dateStr;
    }
    return `${dateStr} ${isEnd ? '23:59:59' : '00:00:00'}`;
  };

  const value = computed({
    get() {
      return props.modelValue;
    },
    set(newValue?: string | string[]) {
      if (!isDate && newValue) {
        if (isRang.value && Array.isArray(newValue)) {
          const result = [
            newValue[0] ? appendTimeToDate(newValue[0]) : newValue[0],
            newValue[1] ? appendTimeToDate(newValue[1]) : newValue[1],
          ];
          emit('update:modelValue', result);
        } else if (typeof newValue === 'string') {
          emit('update:modelValue', appendTimeToDate(newValue));
        } else {
          emit('update:modelValue', newValue);
        }
      } else {
        emit('update:modelValue', newValue);
      }
    },
  });
  const formatDateValue = (val?: string) => (val ? dayjs(val).format(dateType.value) : undefined);

  const showDataTime = computed(() => formatDateValue(value.value as string));

  const startValue = computed(() => formatDateValue((value.value as string[])?.[0]));

  const endValue = computed(() => formatDateValue((value.value as string[])?.[1]));

  const rangeValue = computed(() => props.modelValue);

  const range = computed<[Date | undefined, Date | undefined]>(() => {
    if (show.pos === PosEnum.Left) {
      return [undefined, endValue.value ? new Date(endValue.value) : undefined];
    }
    if (show.pos === PosEnum.Right) {
      return [startValue.value ? new Date(startValue.value) : undefined, undefined];
    }
    return [undefined, undefined];
  });

  // 计算时间限制
  const getTimeLimitByDate = (date: Date | undefined): string | undefined => {
    if (!isRang.value || !date || !currDate.value) return undefined;

    const format = dateType.value?.split(' ')?.[1];
    if (!format) return undefined;

    return currDate.value === dayjs(date).format('YYYY-MM-DD')
      ? dayjs(date).format(format)
      : undefined;
  };

  const maxTime = computed(() => getTimeLimitByDate(range.value[1]));

  const minTime = computed(() => getTimeLimitByDate(range.value[0]));

  const currentDateTime = computed(() => {
    // 根据当前位置获取对应的值
    const getCurrentValue = () => {
      switch (show.pos) {
        case PosEnum.Left:
          return startValue.value;
        case PosEnum.Right:
          return endValue.value;
        case PosEnum.Single:
          return value.value as string;
        default:
          return undefined;
      }
    };

    const val = getCurrentValue();
    if (!val) {
      return { compDateValue: [], compTimeValue: [] };
    }

    const date = dayjs(val).format('YYYY-MM-DD');
    const time = dayjs(val).format(dateType.value).replace(date, '');

    return {
      compDateValue: date.split('-'),
      compTimeValue: time.split(':'),
    };
  });

  const timePickerAttr = computed(() =>
    isDate
      ? { columnsType: DateFormat[dateType.value.replace('YYYY-MM-DD ', '')].columnsType }
      : {},
  );

  const showPopup = (pos = '') => {
    if (props.showIcon) return;
    show.isShow = true;
    active.value = '选择日期';
    show.pos = pos;
  };

  const getValue = (
    pos: Position | string,
    val: string | undefined,
  ): string | string[] | undefined => {
    switch (pos) {
      case PosEnum.Left:
        return [val, (value.value as string[])?.[1]];
      case PosEnum.Right:
        return [(value.value as string[])?.[0], val];
      case PosEnum.Single:
        return val;
      default:
        return undefined;
    }
  };

  const onConfirm = () => {
    const selectedDate = currDateRef.value?.getSelectedDate();
    const selectedTime = currTimeRef.value?.getSelectedTime();

    if (!selectedDate || !selectedTime) {
      onCancel();
      return;
    }

    const datetime = dayjs(`${selectedDate.join('-')} ${selectedTime.join(':')}`).format(
      DateFormat[dateType.value].valueFormat,
    );
    value.value = getValue(show.pos, datetime);
    onCancel();
  };

  const onCancel = () => {
    show.isShow = false;
    show.pos = '';
  };

  const onClear = (pos: string = '') => {
    value.value = getValue(pos, undefined);
  };
</script>
<style scoped lang="less">
  .start-item,
  .end-item {
    display: flex;
    position: relative;
    flex: 1;
    align-items: center;
    justify-content: space-between;
  }

  .input-placeholder {
    color: #c8c9cc;
  }
</style>
