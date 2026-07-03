import { ref, Ref, watch, getCurrentInstance } from 'vue';

/**
 * 返回一个编辑用的双向数据绑定的值
 *
 * @author zhanghanrui
 * @date 2024-03-27 15:03:50
 * @export
 * @template T
 * @return {*}  {Ref<T>}
 */
export function useFormValue<T = any>(): Ref<T> {
  let vue = getCurrentInstance()!.proxy!;
  const props = vue.$props as any;
  const emit = vue.$emit;
  const val = ref(props.value);

  watch(
    () => props.value,
    (newVal: any) => {
      if (val.value !== newVal) {
        val.value = newVal;
      }
    },
  );

  // 监听值变化，触发更新事件
  watch(val, (newVal: any, oldVal: any) => {
    if (oldVal !== newVal) {
      emit('update:value', newVal);
    }
  });

  // 用完置空避免内存泄漏
  vue = null as any;
  return val;
}
