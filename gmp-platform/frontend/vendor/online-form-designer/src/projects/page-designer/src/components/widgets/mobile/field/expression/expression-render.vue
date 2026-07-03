<template>
  <vantField :props="widget.props" :style="widget.style" readonly>
    <template #input>
      <van-switch
        v-if="isBool && BindCmpStyleEnum.CMP_BOOLEAN === bindCompStyleType"
        v-bind="separatorAttr"
      />
      <component v-else-if="isBool" :is="cmp[bindCompStyleType]" v-bind="separatorAttr" />

      <taglabel v-else v-bind="separatorAttr" />
    </template>
  </vantField>
</template>

<script name="gct-expression" setup lang="ts">
  import { computed, reactive, onBeforeMount } from 'vue';
  import { Expression } from '/@page-designer/types/mobile';
  import vantField from '../../__components__/vantField.vue';
  import { BindCmpStyleEnum } from '/@page-designer/enum';
  import { useFormWidget } from '/@page-designer/components/widgets/hooks/formhook';
  import taglabel from '../../__components__/taglabel.vue';
  // import { useAsyncOptions } from '/@page-designer/components/widgets/hooks/hooks';
  import {
    FieldSelect,
    FieldRadio,
    FieldCheckbox,
  } from '/@page-designer/components/widgets/mobile/__components__';
  import { IMobExpressionComponentExpose } from '/@/projects/page-designer/src/interface/mobile';

  const cmp = {
    [BindCmpStyleEnum.CMP_SELECT_LIST]: FieldSelect,
    [BindCmpStyleEnum.CMP_RADIO]: FieldRadio,
    [BindCmpStyleEnum.CMP_CHECKBOX]: FieldCheckbox,
  };

  const props = defineProps<{ modelValue?: string; widget: Expression }>();
  const emit = defineEmits(['update:modelValue']);
  const { getValue, setValue, value } = useFormWidget(props, emit);

  const {
    field,
    returnType,
    bindCompStyleType,
    fieldType,
    precision,
    displayCurrency,
    separator,
    currency,
    modelKey,
    readonly,
    displayTimeType,
  } = reactive(props.widget.props);

  // const { getAsyncOptions, options } = useAsyncOptions(fieldType!);

  // onBeforeMount(() => {
  //   getAsyncOptions({ fieldKey: field, modelKey });
  // });

  const options = computed(() => {
    return [
      {
        label: props.widget.props?.truelabel,
        value: true,
      },
      {
        label: props.widget.props?.falselabel,
        value: false,
      },
    ];
  });

  const isBool = computed(() => {
    return returnType === 'boolean';
  });

  const getBoolValue = (val) => {
    if (val === 'true' || val === 'false') {
      return JSON.parse(val);
    }
    if (val === undefined || val === null || isNaN(parseInt(val))) {
      return Boolean(val);
    }

    return Boolean(parseInt(val));
  };

  const getReadyOnlyValue = () => {
    if (['text', 'long_text'].includes(returnType)) {
      return value.value || '';
    }

    if (isBool.value) {
      return getBoolValue(value.value);
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
    if (isBool.value) {
      const res = {};

      if (bindCompStyleType.value === BindCmpStyleEnum.CMP_BOOLEAN) {
        Object.assign(res, {
          class: readonly.value ? 'mobile-field-boolean--readyonly' : '',
          // todo tangjian 移动端主题色
          // activeColor: '#0DAA9C',
        });
      }

      console.log('options', options.value);
      return {
        readonly: readonly,
        disabled: false,
        fieldType: returnType,
        tagStyle: props.widget.style,
        options: options.value,
        multiple: false,
        ...res,
        checked: getReadyOnlyValue(),
        value: getReadyOnlyValue(),
      };
    }

    return {
      type: returnType,
      tagWidgetStyle: props.widget.style,
      isDesign: false,
      disabled: false,
      label: getReadyOnlyValue(),
    };
  });

  defineExpose<IMobExpressionComponentExpose>({ getValue, setValue });
</script>

<style scoped lang="less">
  .van-switch.mobile-field-boolean--readyonly {
    pointer-events: none;

    &.van-switch--on {
      background-color: rgb(13 170 156 / 50%) !important;
    }
  }

  :deep(.van-field__body) {
    // background-color: var(--cel);
  }
</style>
