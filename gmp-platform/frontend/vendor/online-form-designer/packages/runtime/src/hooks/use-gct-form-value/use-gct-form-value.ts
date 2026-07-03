import { getCurrentInstance, computed, WritableComputedRef } from 'vue';

/**
 * 获取编辑器双向数据绑定值对象，自动发送更新事件
 *
 * @author chitanda
 * @date 2025-06-22 16:06:25
 * @export
 * @template T
 * @param {*} [defVal] 默认值，如果没有传入则使用组件的 props.value 作为默认值
 * @returns {*}  {WritableComputedRef<T>}
 */
export function useGctFormValue<T = any>(defVal?: any): WritableComputedRef<T> {
  let vue = getCurrentInstance()!.proxy!;
  const props = vue.$props as any;
  const emit = vue.$emit;

  const val = computed({
    get: () => {
      return props.value ?? defVal;
    },
    set: (newVal: any) => {
      if (typeof newVal === 'string') {
        newVal = newVal.trim();
      }
      if (typeof newVal != 'object' && props.value == newVal) {
        return;
      }
      emit('update:value', newVal);
    },
  });

  // 用完置空避免内存泄漏
  vue = null as any;
  return val;
}

/**
 * 获取编辑器双向数据绑定值对象，自动发送更新事件（纯字符串）
 *
 * @author zhanghanrui
 * @date 2024-04-03 13:04:25
 * @export
 * @template T
 * @param {string} [prefix]
 * @param {string} [suffix]
 * @return {*}  {WritableComputedRef<T>}
 */
export function useGctFormValueByText(
  prefix?: string,
  suffix?: string,
): WritableComputedRef<string> {
  let vue = getCurrentInstance()!.proxy!;
  const props = vue.$props as any;
  const emit = vue.$emit;
  const prefixSize = prefix ? prefix.length : 0;
  const suffixSize = suffix ? suffix.length : 0;

  const val = computed({
    get: () => {
      if (!props.value) {
        return null as any;
      }
      let value = props.value;
      if (prefixSize > 0 && value.startsWith(prefix)) {
        value = value.substring(prefixSize);
      }
      if (suffixSize > 0 && value.endsWith(suffix)) {
        value = value.substring(0, value.length - suffixSize);
      }
      return value || null;
    },
    set: (newVal: any) => {
      if (props.value === newVal) {
        return;
      }
      // 取消此逻辑，避免在输入的中间输入空格时，无法输入空格的问题。逻辑需要编辑器在失焦时，自行处理trim操作
      // if (typeof newVal === 'string') {
      //   newVal = newVal.trim();
      // }
      if (newVal == '') {
        emit('update:value', '');
        return;
      }
      let value = newVal;
      if (prefixSize > 0) {
        value = prefix + value;
      }
      if (suffixSize > 0) {
        value = value + suffix;
      }
      emit('update:value', value);
    },
  });

  // 用完置空避免内存泄漏
  vue = null as any;
  return val;
}
