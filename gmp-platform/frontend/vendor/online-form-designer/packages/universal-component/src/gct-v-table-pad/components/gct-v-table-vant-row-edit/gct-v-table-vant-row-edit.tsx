import { defineComponent, nextTick, onBeforeUnmount, provide, ref } from 'vue';
import { debounce } from 'lodash-es';
import { useNamespace } from '@gct-paas/core';
import {
  useGctVTableRowEditStore,
  GctVTableRowEdit,
  TABLE_EVENTS,
} from '@gct/universal-component/gct-v-table';
import { GctVTableVantRowEditItem } from '../gct-v-table-vant-row-edit-item/gct-v-table-vant-row-edit-item';
import './gct-v-table-vant-row-edit.scss';

export const GctVTableVantRowEdit = defineComponent({
  name: 'GctVTableVantRowEdit',
  emits: [TABLE_EVENTS.DATA_CHANGE],
  setup(_, { slots, emit }) {
    const ns = useNamespace('v-table-vant-row-edit');
    // 提供是否在表格内的标识，用于 vant-field 组件调整样式判断
    provide('is_v_table', true);

    const rowEditRef = ref();

    const store = useGctVTableRowEditStore();

    const vanFormRef = ref<any>(null);

    /**
     * 计算表单报错状态
     *
     * @param {boolean} isChange 是否为字段值变更触发的校验，用于决定是否滚动到报错字段位置
     */
    function calcVantFormError(isChange: boolean): void {
      const status = vanFormRef.value?.getValidationStatus();
      if (status) {
        store.isError = Object.values(status).some((item) => item === 'failed');
        if (isChange === false) {
          // 过滤出所有报错的字段标识
          const keys = Object.keys(status).filter((key) => {
            if (key === 'undefined') {
              console.warn('发现未定义字段的校验状态，跳过该字段的报错处理');
              return false;
            }
            return status[key] === 'failed';
          });
          // 取第一个报错字段，将其滚动到可视区域
          if (keys.length > 0) {
            // 将 keys 重新按照列顺序排序，后选择第一个
            const key = keys.sort((a, b) => {
              const indexA = store.normalCols.findIndex((col) => col?.name === a);
              const indexB = store.normalCols.findIndex((col) => col?.name === b);
              return indexA - indexB;
            })[0];
            // 找到所在位置
            const colIndex = store.contentWidths.findIndex((_, index) => {
              const col = store.normalCols[index];
              return col?.name === key;
            });
            if (colIndex !== -1) {
              rowEditRef.value?.errorScrollTo(colIndex);
            }
          }
        }
        nextTick(() => {
          calcErrorHeight();
        });
      } else {
        store.isError = false;
      }
    }

    const debouncedCalcVantFormError = debounce(calcVantFormError, 300, {
      leading: false,
      trailing: true,
    });

    async function onValidate(): Promise<boolean> {
      try {
        await vanFormRef.value!.validate();
        return true;
      } catch (error) {
        console.error(error);
        calcVantFormError(false);
      }
      return false;
    }

    async function calcErrorHeight() {
      // .van-field__error-message 最高元素高度
      const errorMessages = vanFormRef.value?.$el.querySelectorAll('.van-field__error-message');
      // 错误提示高度取最大值
      let maxHeight = 20 + 6; // 默认高度20px + 额外间距6px
      if (errorMessages && errorMessages.length > 0) {
        errorMessages.forEach((el: any) => {
          const height = el.offsetHeight;
          if (height > maxHeight) {
            maxHeight = height + 6; // 额外加 margin-top: 6px 间距
          }
        });
      }
      store.errorHeight = maxHeight;
    }

    provide('end-validate', () => {
      debouncedCalcVantFormError(true);
    });

    async function onInit(): Promise<void> {
      store.rowEditingItem?.evt.on('change', () => {
        debouncedCalcVantFormError(true);
      });
    }

    function onDataChange(...args: any[]): void {
      emit(TABLE_EVENTS.DATA_CHANGE, ...args);
    }

    onBeforeUnmount(() => {
      // 清理防抖函数
      debouncedCalcVantFormError.cancel();
    });

    onInit();

    return () => {
      return (
        <GctVTableRowEdit
          ref={rowEditRef}
          class={ns.b()}
          validate={onValidate}
          onDataChange={onDataChange}
        >
          {{
            tableForm({ content }) {
              return (
                <van-form ref={vanFormRef} class={ns.e('form-container')} show-error>
                  {content}
                </van-form>
              );
            },
            editorItem() {
              return <GctVTableVantRowEditItem />;
            },
            ...slots,
          }}
        </GctVTableRowEdit>
      );
    };
  },
});
