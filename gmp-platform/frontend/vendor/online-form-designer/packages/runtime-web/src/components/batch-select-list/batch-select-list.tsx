import { computed, defineComponent, ref, toRefs, watch } from 'vue';
import { debounce } from 'lodash-es';
import { useNamespace } from '@gct-paas/core';
import './batch-select-list.scss';

/**
 * @description 批量选择列表组件，提供全选和单选功能。
 * @example
 * <BatchSelectList v-model:value="selectedItems" :options="allItems" />
 */
export const BatchSelectList = defineComponent({
  name: 'BatchSelectList',
  props: {
    /**
     * 当前选中的值数组
     */
    value: {
      type: Array<string>,
      required: true,
    },
    /**
     * 可选项列表
     * @type {Array<{ label: string; value: string }>}
     */
    options: {
      type: Array<{ label: string; value: string }>,
      default: () => [],
    },
    /**
     * 可选项的总数，如果未提供，则使用 options.length
     * 用于计算全选状态，特别是当 options 列表是分页加载时
     */
    size: {
      type: Number,
    },
  },
  emits: ['update:value', 'select', 'cancelSelect', 'checkAll'],
  setup(props, { emit }) {
    const ns = useNamespace('batch-select-list');

    const { options, value, size } = toRefs(props);

    watch(value, (newVal) => {
      val.value = newVal;
    });

    const val = ref<string[]>(value.value);

    /**
     * 计算列表的总项目数
     * @returns {number} 如果 props.size 有效则返回 props.size，否则返回 props.options 的长度
     */
    const count = computed<number>(() => {
      if (size.value != null && size.value > 0) {
        return size.value;
      }
      return options.value.length;
    });

    /**
     * 全选复选框的选中状态
     */
    const isCheckAll = ref<boolean>(false);

    watch(options, () => {
      // 当 options 发生变化时，重新计算全选复选框的状态
      isCheckAll.value = val.value.length === count.value;
    });

    /**
     * 计算全选复选框的半选状态
     * @returns {boolean} 当已选项目数大于0且小于总项目数时为 true
     */
    const indeterminate = computed<boolean>(() => {
      return val.value.length > 0 && val.value.length < options.value.length;
    });

    /**
     * @description 全选复选框状态变更时的处理函数
     * @param {Event} e - 事件对象，期望 e.target.checked 存在
     * @returns {void}
     */
    function onCheckAllChange(e: Event): void {
      // 类型断言，因为 Ant Design Vue 的 Checkbox onChange 事件参数类型可能更具体
      const target = e.target as HTMLInputElement;
      const isCheck = target.checked;
      if (isCheck) {
        // options 有可能是过滤后的清单，所以只是向值清单中添加选项
        options.value.forEach((opt) => {
          if (!val.value.includes(opt.value)) {
            val.value.push(opt.value);
          }
        });
      } else {
        // options 有可能是过滤后的清单，如果全选被取消，则删除清单中的选项
        val.value = val.value.filter((item) => {
          return !options.value.some((opt) => opt.value === item);
        });
      }
      emit('update:value', val.value);
      emit('checkAll', val.value);
    }

    /**
     * 单个复选框状态变更时的处理函数（通过点击项目触发）
     *
     * @param {MouseEvent} e - 事件对象
     * @param {string} id - 发生变更的复选框的 value
     */
    const onCheckChange = debounce((e: MouseEvent, id: string): void => {
      e.stopPropagation(); // 阻止事件冒泡
      const index = val.value.indexOf(id);
      const newValue = [...val.value]; // 创建副本以避免直接修改
      if (index > -1) {
        // 如果该项已被选中，则从选中列表中移除
        newValue.splice(index, 1);
        emit('cancelSelect', id);
      } else {
        // 如果该项未被选中，则添加到选中列表中
        newValue.push(id);
        emit('select', id);
      }
      val.value = newValue;
      emit('update:value', val.value);
      // 当选中项发生变化时，更新全选状态
      isCheckAll.value = val.value.length === count.value;
    }, 30 /* 30 毫秒的防抖，是因为 a-checkbox 的 Bug，在点击文本时会触发两次事件。不调高防抖时间，再调高会影响人为操作 */);

    return () => {
      return (
        <div class={ns.b()}>
          <div class={ns.e('header')}>
            <a-checkbox
              v-model:checked={isCheckAll.value}
              indeterminate={indeterminate.value}
              onChange={onCheckAllChange}
            >
              全选（{val.value.length}/{count.value}）
            </a-checkbox>
          </div>
          <div class={ns.e('body')}>
            <a-checkbox-group value={val.value}>
              {options.value.map((opt) => {
                return (
                  <div
                    class={[ns.e('item'), ns.is('select', val.value.includes(opt.value))]}
                    key={opt.value}
                    onClick={(e) => onCheckChange(e, opt.value)}
                  >
                    <a-checkbox value={opt.value}>{opt.label}</a-checkbox>
                  </div>
                );
              })}
            </a-checkbox-group>
          </div>
        </div>
      );
    };
  },
});
