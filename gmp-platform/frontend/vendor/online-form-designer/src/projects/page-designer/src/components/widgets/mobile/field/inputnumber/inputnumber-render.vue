<template>
  <vantField
    v-model="value"
    :props="widget.props"
    :style="widget.style"
    readonly
    @click="openView"
    clearable
    @clearValue="onClear"
    :key="showReadonly"
    :formData="formData"
  >
    <template #input v-if="showReadonly">
      <taglabel v-bind="separatorAttr" />
    </template>
    <template #input v-if="!showReadonly && bindCompStyleType === BindCmpStyleEnum.CMP_TIME">
      <TimeInput @update="updateValue" :widget="widget" :modelValue="Number(modelValue)" />
    </template>
    <template #input v-else-if="valueLabel">
      <span :class="showDisabled ? 'lable-disabled' : ''">{{ valueLabel }}</span>
    </template>
  </vantField>
</template>

<script name="gct-inputnumber" setup lang="ts">
  import { computed, reactive, toRef, nextTick } from 'vue';
  import { InputNumber } from '/@page-designer/types/mobile';
  import vantField from '../../__components__/vantField.vue';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import { useFormWidget } from '/@page-designer/components/widgets/hooks/formhook';
  import { createNumKeyboardPopup } from '@mobile/components/numKeyboard';
  import { createTimePicker } from '@mobile/components/timePicker';
  import taglabel from '../../__components__/taglabel.vue';
  import { toNumber, isNil } from 'lodash-es';
  import { useReadyonly, useDisabled } from '../../../hooks/useReadyonly';
  import { BindCmpStyleEnum } from '/@page-designer/enum';
  import TimeInput from './component/timeInput.vue';
  import BigNumber from 'bignumber.js';
  import { IMobInputnumberComponentExpose } from '/@/projects/page-designer/src/interface/mobile';

  const props = withDefaults(
    defineProps<{
      modelValue?: string;
      widget: InputNumber;
      validateRange?: boolean;
      formData: any;
    }>(),
    {
      validateRange: true,
    },
  );

  const valueLabel = ref();
  const emit = defineEmits(['update:modelValue']);
  const { getValue, setValue, onChange, onEnter, onBlur, onFocus, value } = useFormWidget(
    props,
    emit,
  );

  const { fieldType, separator, currency, bindCompStyleType, displayTimeType } = reactive(
    props.widget.props,
  );
  const precision = toRef(() => props.widget.props.precision);
  const maxValue: any = toRef(() => props.widget.props.maxValue);
  const minValue: any = toRef(() => props.widget.props.minValue);

  const { openNumKeyPopup } = createNumKeyboardPopup({});

  const { openTimePicker } = createTimePicker({});

  const showReadonly = computed(() => useReadyonly(props.widget.props.readonly));

  const showDisabled = computed(() => useDisabled(props.widget.props.disabled));

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

  watch(value, (v) => {
    valueLabel.value = readyOnlyValue.value;
  });
  function openView(e) {
    if (showReadonly.value || showDisabled.value) return;
    if (bindCompStyleType !== BindCmpStyleEnum.CMP_TIME) {
      const res: any = {};
      if (!props.widget.props.notAutoFix && props.validateRange) {
        if (!isNil(maxValue?.value) && maxValue?.value !== '') {
          Object.assign(res, {
            maxValue: maxValue.value,
          });
        }
        if (!isNil(minValue?.value) && minValue?.value !== '') {
          Object.assign(res, {
            minValue: minValue.value,
          });
        }
      }
      openNumKeyPopup({
        val: value.value,
        extra: fieldType === FIELD_TYPE.DECIMAL ? '.' : '',
        minmax: res,
        precision: precision.value,
        callback(a: any) {
          valueLabel.value = a;
          onChange();
        },
        onBlur(e) {
          value.value = e;
          onBlur(e);
        },
        onEnter,
        onFocus,
      });
    } else {
      const dayDom = document.getElementById('DayTime');
      const minVal = dayDom?.offsetParent?.offsetLeft;
      const maxVal = dayDom?.offsetWidth + dayDom?.offsetParent?.offsetLeft;
      const currentTime = [
        setTimeVal(value.value, 'hours') || 0,
        setTimeVal(value.value, 'minutes') || 0,
        setTimeVal(value.value, 'seconds') || 0,
      ];
      let firstNum = Math.floor(value.value / 86400) || 0;

      if (props.widget.props.displayTimeType?.startsWith('h')) {
        firstNum = currentTime[0];
      } else if (props.widget.props.displayTimeType?.startsWith('m')) {
        firstNum = currentTime[1];
      } else if (props.widget.props.displayTimeType?.startsWith('s')) {
        firstNum = currentTime[2];
      }

      if (e.clientX >= minVal && e.clientX <= maxVal) {
        openNumKeyPopup({
          val: firstNum,
          extra: '',
          minmax: { minValue: 0, maxValue: 99999999 },
          callback(a: any) {
            if (props.widget.props.displayTimeType?.startsWith('h')) {
              value.value = a * 3600 + Number(currentTime[1]) * 60 + Number(currentTime[2]);
            } else if (props.widget.props.displayTimeType?.startsWith('m')) {
              value.value = a * 60 + Number(currentTime[2]);
            } else if (props.widget.props.displayTimeType?.startsWith('s')) {
              value.value = Number(a);
            } else {
              value.value =
                a * 86400 +
                Number(currentTime[0]) * 3600 +
                Number(currentTime[1]) * 60 +
                Number(currentTime[2]);
            }

            onChange();
          },
          onEnter,
          onBlur,
          onFocus,
        });
      } else if (e.clientX > maxVal) {
        let columnsType = [];
        let val = [];
        if (timeTypeHasDay.value) {
          if (timeTypeHasHour.value) {
            columnsType.push('hour');
            val.push(currentTime[0]);
          }
          if (timeTypeHasMinute.value) {
            columnsType.push('minute');
            val.push(currentTime[1]);
          }
          if (timeTypeHasSecond.value) {
            columnsType.push('second');
            val.push(currentTime[2]);
          }
        } else if (timeTypeHasHour.value) {
          if (timeTypeHasMinute.value) {
            columnsType.push('minute');
            val.push(currentTime[1]);
          }
          if (timeTypeHasSecond.value) {
            columnsType.push('second');
            val.push(currentTime[2]);
          }
        } else if (timeTypeHasMinute.value) {
          if (timeTypeHasSecond.value) {
            columnsType.push('second');
            val.push(currentTime[2]);
          }
        }
        openTimePicker({
          val,
          columnsType,
          callback(a: any[]) {
            let obj = {
              hour: 0,
              minute: 0,
              second: 0,
            };

            columnsType.forEach((item, index) => {
              obj[item] = Number(a[index]);
            });

            if (props.widget.props.displayTimeType?.startsWith('h')) {
              value.value = firstNum * 3600 + obj.minute * 60 + obj.second;
            } else if (props.widget.props.displayTimeType?.startsWith('m')) {
              value.value = firstNum * 60 + obj.second;
            } else if (props.widget.props.displayTimeType?.startsWith('s')) {
              value.value = obj.second;
            } else {
              value.value = firstNum * 86400 + obj.hour * 3600 + obj.minute * 60 + obj.second;
            }
            onChange();
          },
        });
      }
    }
  }

  const onClear = async () => {
    emit('update:modelValue', null);
    await nextTick();
    onChange();
    onBlur();
  };

  const readyOnlyValue = computed(() => {
    if (!isNil(value?.value) && value.value !== '') {
      let _value = value.value ? new BigNumber(value.value).toFixed(precision.value, 1) : '';
      if (bindCompStyleType === BindCmpStyleEnum.CMP_CURRENCY) {
        if (separator) {
          const currentValue = parseFloat(_value);
          if (!Number.isInteger(currentValue)) {
            const integerVal = _value.toString().replace(new RegExp(`^(\\d*)(\\..*)`), '$1');
            const decimalVal = _value.toString().replace(new RegExp(`^(\\d*)(\\..*)`), '$2');
            _value = `${`${integerVal}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}${decimalVal}`;
          } else {
            _value = `${_value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          }
        }
        if (currency) {
          _value = `${currency}${_value}`;
        }
      }
      if (bindCompStyleType === BindCmpStyleEnum.CMP_TIME) {
        _value = handle2TimeValue(_value);
      }

      return _value;
    } else {
      return '';
    }
  });

  const separatorAttr = computed(() => {
    return {
      type: fieldType,
      tagWidgetStyle: props.widget.style,
      disabled: props.widget.props.disabled,
      label: readyOnlyValue.value,
    };
  });

  const handle2TimeValue = (_value) => {
    let days, hours, minutes, seconds;
    days = _value ? Math.floor(_value / 86400) : 0;
    hours =
      !displayTimeType?.includes('d') && days > 0
        ? days * 24 + Number(setTimeVal(_value, 'hours'))
        : setTimeVal(_value, 'hours');
    minutes =
      !displayTimeType?.includes('h') && hours > 0
        ? hours * 60 + Number(setTimeVal(_value, 'minutes'))
        : setTimeVal(_value, 'minutes');
    seconds =
      !displayTimeType?.includes('m') && minutes > 0
        ? minutes * 60 + Number(setTimeVal(_value, 'seconds'))
        : setTimeVal(_value, 'seconds');
    const day = displayTimeType?.includes('d') ? days + ' 天 ' : '';
    const hour = displayTimeType?.includes('h') ? hours + ' 时 ' : '';
    const minute = displayTimeType?.includes('m') ? minutes + ' 分 ' : '';
    const second = displayTimeType?.includes('s') ? seconds + ' 秒' : '';
    return `${day}${hour}${minute}${second}`;
  };

  const setTimeVal = (_value, type) => {
    let val = 0;
    const str1 = _value % 86400;
    const str2 = _value % 3600;
    switch (type) {
      case 'hours':
        val = Math.floor(str1 / 3600);
        break;
      case 'minutes':
        val = Math.floor(str2 / 60);
        break;
      case 'seconds':
        val = Math.floor(str2 % 60);
        break;
    }
    return _value ? (val < 10 ? '0' + val : val) : 0;
  };

  const updateValue = (val) => {
    if (bindCompStyleType === BindCmpStyleEnum.CMP_TIME) {
      value.value = val;
    }
  };

  defineExpose<IMobInputnumberComponentExpose>({ getValue, setValue });
</script>

<style lang="less" scoped>
  .lable-disabled {
    color: var(--van-field-input-disabled-text-color);
  }
</style>
