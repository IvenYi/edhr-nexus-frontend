<template>
  <a-input-number
    ref="inputNumberRef"
    v-bind="inputAttr"
    v-model:value="inputValue"
    @blur="onChangeValue"
    @pressEnter="onPressEnter"
  >
    <template #addonBefore v-if="enableStepCounter">
      <slot name="step-down"></slot>
    </template>
    <template #addonAfter v-if="enableStepCounter || renderScript">
      <component v-if="renderScript" :is="renderScript" />
      <slot v-if="enableStepCounter" name="step-up"></slot>
    </template>
  </a-input-number>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { isNil } from 'lodash-es';
  import BigNumber from 'bignumber.js';

  interface Props {
    doubleValue: any;
    isSeparator?: boolean;
    onEnter?: Function;
    /** 角标组件 */
    renderScript?: any;
    /** 小数位数 */
    digits?: number;
    /** 是否启用计步器 */
    enableStepCounter?: boolean;
    rules?: 1 | 4 | 6; // 1:截取；4:四舍五入；6:四舍六入(银行家舍入法)
  }

  const props = defineProps<Props>();

  const emit = defineEmits(['update:doubleValue']);

  const inputAttr = ref({});
  const inputNumberRef = ref();

  const inputValue = computed<string>({
    get() {
      const { val, precision } = getFormatterValue(props.doubleValue);
      setInputAttr(precision);
      return val;
    },
    set(value: string) {
      emit('update:doubleValue', value);
    },
  });

  const countDecimals = (num) => {
    // 将数值转换为字符串
    const str = String(num);
    // 匹配小数点及其后面的数字
    const match = str.match(/\.(\d+)/);
    // 返回小数位数
    return match ? match[1].length : 0;
  };

  const formatterValue = (inputValue) => {
    let value = inputValue?.toString();

    if (props.isSeparator && value) {
      value = value.replace(/\$\s?|(,*)/g, '');
    }

    const currentValue = parseFloat(value);
    if (isNaN(currentValue)) {
      return {
        val: null,
      };
    }

    // 点开头处理为 0.
    if (value.toString().indexOf('.') === 0) {
      value = `0${value}`;
    }

    // 判断是否是整数
    if (Number.isInteger(currentValue)) {
      // 判断是否是【整数+.】开头
      const reg = new RegExp(`^${currentValue}(\\.)`, 'g');
      if (reg.test(value)) {
        // 从字符串中截取出【整数+.】
        const firstVal = value.replace(new RegExp(`^(${currentValue}(\\.))(.*)`), '$1');
        // 判断是否相等
        if (firstVal === `${currentValue}.`) {
          // 截取剩余的值
          const otherVal = value.replace(reg, '');
          let dIndex = otherVal.toString().indexOf('.');
          // 如果剩余的值的开头是点
          if (dIndex === 0) {
            return {
              val: currentValue,
            };
          }
          if (parseFloat(otherVal) === 0) {
            // 如果是 0 那么说明输入的值小数点后面有 0 需要保留
            const decimalValue = otherVal.toString().replace(new RegExp(`^(\\d*)(.*)`), '$1');
            return {
              val: `${currentValue}.${decimalValue}`,
              precision: decimalValue.length,
            };
          }
        }
      }
      return {
        val: currentValue,
      };
    } else {
      // 解决 11.2200000fefefe 的情况
      const _val = value.replace(new RegExp(`^(\\d*\\.\\d*)(.*)`), '$1');

      if (_val === currentValue.toString()) {
        return {
          val: _val,
        };
      }

      return {
        val: _val,
        precision: countDecimals(_val),
      };
    }
  };

  const getFormatterValue = (inputValue) => {
    const res = formatterValue(inputValue);

    if (isNil(props.digits)) {
      return res;
    }

    const { val, precision } = res;
    return {
      val: val ? Number(new BigNumber(val).toFixed(props.digits, props.rules || 1)) : val,
      precision,
    };
  };

  const setInputAttr = (precision) => {
    inputAttr.value = {};

    // 如果外部传入了digits，那不需要在内部自己设置小数位数，外部已经设置好了
    if (precision !== undefined && isNil(props.digits)) {
      inputAttr.value = {
        precision: precision,
      };
    }
  };

  const onChangeValue = (event) => {
    const {
      target: { value: inputValue },
    } = event || {};
    const { val, precision } = getFormatterValue(inputValue);

    setInputAttr(precision);
    emit('update:doubleValue', val);
  };

  const onPressEnter = (event) => {
    onChangeValue(event);
    if (props.onEnter && typeof props.onEnter === 'function') {
      props.onEnter?.(event);
    }
  };

  defineExpose({
    input: inputNumberRef,
    onChangeValue,
  });
</script>
