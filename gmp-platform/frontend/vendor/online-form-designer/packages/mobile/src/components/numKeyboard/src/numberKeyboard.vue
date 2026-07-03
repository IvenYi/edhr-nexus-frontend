<template>
  <van-number-keyboard
    theme="custom"
    :extra-key="extraKey"
    close-button-text="完成"
    v-model="value"
    :show="isShow"
    @blur="onBlur"
    @close="onEnter"
    @input="onInput"
    @delete="onDelete"
    z-index="9999"
    :maxlength="15"
  />
</template>

<script setup name="numberKeyboard" lang="ts">
  import { ref, nextTick, computed } from 'vue';
  import { type openPickerCallback } from './typing';
  import { has, isNil, toNumber } from 'lodash-es';

  const isShow = ref<boolean>(false);
  const numberValue = ref<string>('');
  // 过滤小数点函数
  function filterDecimals(str) {
    // 查找所有小数点的位置
    const decimalIndices = [];
    for (let i = 0; i < str.length; i++) {
      if (str[i] === '.') {
        decimalIndices.push(i);
      }
    }

    // 如果没有小数点或只有一个小数点，直接返回
    if (decimalIndices.length <= 1) {
      return str;
    }

    // 保留第一个小数点，移除其他小数点
    let result = '';
    let decimalCount = 0;

    for (let i = 0; i < str.length; i++) {
      if (str[i] === '.') {
        if (decimalCount === 0) {
          result += '.';
          decimalCount++;
        }
        // 跳过后续的小数点
      } else {
        result += str[i];
      }
    }
    return result;
  }
  const value = computed({
    get() {
      return numberValue.value;
    },
    set(v) {
      numberValue.value = filterDecimals(v);
    },
  });
  const extraKey = ref('.');
  const minmaxMap = ref({});

  let handleOk: openPickerCallback;
  let customBlur = null;
  let customEnter = null;

  const openNumKeyboardOpen = ({ val, extra, minmax, callback, onEnter, onBlur, onFocus }: any) => {
    value.value = !isNil(val) ? String(val) : '';

    isShow.value = true;
    if (extra !== null || extra !== undefined) {
      extraKey.value = extra;
    }
    minmaxMap.value = minmax;
    handleOk = callback;
    customEnter = onEnter;
    customBlur = onBlur;

    // 移动端当键盘打开时认为focus状态
    onFocus && onFocus();
  };

  async function onInput(val: any) {
    await nextTick();
    handleOk && handleOk(value.value);
  }

  async function onDelete() {
    await nextTick();
    handleOk && handleOk(value.value);
  }

  async function onEnter() {
    await nextTick();
    customEnter && customEnter(value.value);
  }

  async function onBlur() {
    // 丢失焦点时修正小数
    if (value.value) {
      // 丢失焦点，处理最大最小值问题
      if (has(minmaxMap.value, 'maxValue') && value.value > minmaxMap.value.maxValue) {
        value.value = minmaxMap.value.maxValue;
      } else if (has(minmaxMap.value, 'minValue') && value.value < minmaxMap.value.minValue) {
        value.value = minmaxMap.value.minValue;
      }
      value.value = isNaN(value.value) ? '' : value.value;
      handleOk && handleOk(value.value);
    }
    isShow.value = false;
    await nextTick();
    customBlur && customBlur(value.value);
  }

  defineExpose({ openNumKeyboardOpen });
</script>

<style scoped lang="less"></style>
