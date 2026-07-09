<template>
  <div :class="[prefixCls]">
    <div
      :class="[
        `${prefixCls}__body`,
        { 'time-input__disabled': disabled },
        labelLayout?.layout.label === 'top' || labelLayout?.layout.inputAlign === 'left' || isVTable
          ? 'justify-start'
          : 'justify-end',
      ]"
      class="ks-row"
    >
      <input
        v-if="timeTypeHasDay"
        class="day w80px"
        type="number"
        :placeholder="$t('sys.component.time.days')"
        maxlength="8"
        min="0"
        :value="day"
        :allowClear="false"
        :disabled="disabled"
        @input="handleInput($event, 'day')"
      />
      <template v-if="timeTypeHasHour">
        <span v-if="timeTypeHasDay">:</span>
        <input
          type="number"
          :placeholder="$t('sys.component.time.hour')"
          class="hour w80px"
          :maxlength="widget.props.displayTimeType?.startsWith('h') ? null : 2"
          :value="hour"
          :allowClear="false"
          :disabled="disabled"
          max="24"
          min="0"
          @input="handleInput($event, 'hour')"
        />
      </template>
      <template v-if="timeTypeHasMinute">
        <span v-if="timeTypeHasHour">:</span>
        <input
          type="number"
          class="hour w80px"
          :placeholder="$t('sys.component.time.minute')"
          :maxlength="widget.props.displayTimeType?.startsWith('m') ? null : 2"
          :value="min"
          :allowClear="false"
          :disabled="disabled"
          max="60"
          min="0"
          @input="handleInput($event, 'min')"
        />
      </template>
      <template v-if="timeTypeHasSecond">
        <span v-if="timeTypeHasMinute">:</span>
        <input
          type="number"
          class="hour w80px"
          :placeholder="$t('sys.component.time.seconds')"
          :maxlength="widget.props.displayTimeType?.startsWith('s') ? null : 2"
          :value="sec"
          :allowClear="false"
          :disabled="disabled"
          max="60"
          min="0"
          @input="handleInput($event, 'sec')"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, inject, ref, watch } from 'vue';
  import { InputNumber } from '/@page-designer/types/web';

  enum TimeTypeEnum {
    TIME_DAY = 'day',
    TIME_HOUR = 'hour',
    TIME_MIN = 'min',
    TIME_SEC = 'sec',
  }
  const isVTable = inject('is_v_table', false);
  const labelLayout = inject('labelLayout');
  console.log('labelLayout', labelLayout);
  const props = defineProps<{
    modelValue?: number;
    widget: InputNumber;
    readonly?: boolean;
    disabled?: boolean;
  }>();
  const emit = defineEmits(['update']);
  const prefixCls = 'time-input';
  const day = ref<number | string>('');
  const hour = ref<number | string>('');
  const min = ref<number | string>('');
  const sec = ref<number | string>('');

  const timeTypeHasDay = computed(() => {
    return props.widget.props.displayTimeType?.includes('d');
  });

  const timeTypeHasHour = computed(() => {
    return props.widget.props.displayTimeType?.includes('h');
  });

  const timeTypeHasMinute = computed(() => {
    return props.widget.props.displayTimeType?.includes('m');
  });

  const timeTypeHasSecond = computed(() => {
    return props.widget.props.displayTimeType?.includes('s');
  });

  const timeValue = computed({
    get() {
      return props.modelValue;
    },
    set(value) {
      emit('update', value);
    },
  });

  watch(
    () => props.modelValue,
    (val) => {
      handleNum2Time(val);
    },
    { deep: true, immediate: true },
  );

  function handleNum2Time(value: any) {
    day.value = value ? Math.floor(value / 86400) : props.readonly ? 0 : '';

    let secVal = Math.floor(((value % 86400) % 3600) % 60);
    if (props.widget.props.displayTimeType?.startsWith('s')) {
      secVal = Math.floor(value);
      sec.value = isNaN(secVal) ? '' : secVal;
      return;
    } else {
      sec.value = value ? secVal : props.readonly ? 0 : '';
    }

    let minVal = Math.floor(((value % 86400) % 3600) / 60);
    if (props.widget.props.displayTimeType?.startsWith('m')) {
      minVal = Math.floor(value / 60);
      min.value = isNaN(minVal) ? '' : minVal;
      return;
    } else {
      min.value = value ? minVal : props.readonly ? 0 : '';
    }

    let hourVal = Math.floor((value % 86400) / 3600);
    if (props.widget.props.displayTimeType?.startsWith('h')) {
      hourVal = Math.floor(value / 3600);
      hour.value = isNaN(hourVal) ? '' : hourVal;
    } else {
      hour.value = value ? hourVal : props.readonly ? 0 : '';
    }
  }

  const handleTime2Num = () => {
    const num =
      Number(day.value) * 86400 +
      Number(hour.value) * 3600 +
      Number(min.value) * 60 +
      Number(sec.value) * 1;
    return num;
  };

  const handleChange = () => {
    timeValue.value = handleTime2Num();
  };

  function handleInput(e, type) {
    let v = e.target.value;
    const value = Number(v);
    if (isNaN(value)) return;
    switch (type) {
      case TimeTypeEnum.TIME_DAY:
        day.value = v === '' ? v : value;
        break;
      case TimeTypeEnum.TIME_HOUR:
        if (!props.widget.props.displayTimeType?.startsWith('h')) {
          if (value > 23) {
            hour.value = 23;
          } else if (value < 0) {
            hour.value = 0;
          } else {
            hour.value = v === '' ? v : value;
          }
        } else {
          hour.value = v === '' ? v : value;
        }
        break;
      case TimeTypeEnum.TIME_MIN:
        if (!props.widget.props.displayTimeType?.startsWith('m')) {
          if (value > 59) {
            min.value = 59;
          } else if (value < 0) {
            min.value = 0;
          } else {
            min.value = v === '' ? v : value;
          }
        } else {
          min.value = v === '' ? v : value;
        }
        break;
      case TimeTypeEnum.TIME_SEC:
        if (!props.widget.props.displayTimeType?.startsWith('s')) {
          if (value > 59) {
            sec.value = 59;
          } else if (value < 0) {
            sec.value = 0;
          } else {
            sec.value = v === '' ? v : value;
          }
        } else {
          sec.value = v === '' ? v : value;
        }
        break;
    }
    handleChange();
    return;
  }

  const getValue = () => {
    return timeValue;
  };

  defineExpose({ getValue });
</script>

<style lang="less" scoped>
  @prefix-cls: ~'time-input';

  .@{prefix-cls} {
    width: 100%;
    background-color: transparent;

    &__body {
      overflow: hidden;
      flex-wrap: nowrap;
      align-items: center;
      width: 100%;

      input {
        display: inline-block;
        width: 32px;
        height: 44px !important;
        border: none;
        border-radius: 4px;
        background-color: #f9fafb !important;
        text-align: left !important;

        &::placeholder {
          padding-left: 12px;
          color: #c6c6c6;
        }
      }

      .day {
        width: 160px !important;
      }

      .hour {
        width: 80px !important;
      }

      span {
        padding: 0 7px;
        color: #000;
        line-height: 30px;
      }

      .ant-input-affix-wrapper,
      .ant-input-number {
        flex-shrink: 0;
        width: 44px;
        min-width: 44px;
      }

      :deep(.ant-input-affix-wrapper) {
        .ant-input-suffix {
          display: none;
        }
      }
    }

    &__disabled {
      input {
        border-color: #e6e6e6;
      }
    }
  }
</style>
