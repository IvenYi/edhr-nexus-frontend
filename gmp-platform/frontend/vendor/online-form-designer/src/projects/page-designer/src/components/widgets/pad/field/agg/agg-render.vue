<template>
  <vantField v-model="separatorAttr.label" :props="widget.props" :style="widget.style" readonly>
    <template #input>
      <taglabel v-bind="separatorAttr" />
    </template>
  </vantField>
</template>

<script name="gct-agg" setup lang="ts">
  import { computed, reactive } from 'vue';
  import { Agg } from '/@page-designer/types/mobile';
  import vantField from '../../__components__/vantField.vue';
  import { useFormWidget } from '/@page-designer/components/widgets/hooks/formhook';
  import taglabel from '../../__components__/taglabel.vue';
  import { BindCmpStyleEnum } from '/@page-designer/enum';
  import dayjs from 'dayjs';
  import { IMobAggComponentExpose } from '/@/projects/page-designer/src/interface/mobile';

  const props = defineProps<{ modelValue?: string; widget: Agg }>();
  const emit = defineEmits(['update:modelValue']);
  const { getValue, setValue, value } = useFormWidget(props, emit);

  const {
    returnType,
    precision,
    displayCurrency,
    separator,
    currency,
    format,
    bindCompStyleType,
    displayTimeType,
  } = reactive(props.widget.props);

  const getReadyOnlyValue = () => {
    if (['date', 'time', 'date_time'].includes(returnType)) {
      if (value.value) {
        if (returnType === 'time') {
          return value.value.split(':').slice(0, format.split(':').length).join(':');
        }
        return dayjs(value.value).format(format);
      }

      return '';
    }
    if (value.value !== null && value.value !== undefined && value.value !== '') {
      let _value = Number(value.value).toFixed(precision || 0) + '';

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
    }

    return '';
  };

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

  const separatorAttr = computed(() => {
    return {
      type: returnType,
      tagWidgetStyle: props.widget.style,
      isDesign: false,
      disabled: false,
      label: getReadyOnlyValue(),
    };
  });

  defineExpose<IMobAggComponentExpose>({ getValue, setValue });
</script>

<style scoped lang="less"></style>
