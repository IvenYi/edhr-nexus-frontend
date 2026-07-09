import { defineComponent, ref, PropType, computed, watch, onMounted } from 'vue';
import { Popover } from 'vant';
import { LowCodeWidget, useNamespace } from '@gct-paas/core';
import { useStorage } from '@vueuse/core';
import { UserData } from '@mobile/stores/loginHooks';
import Sortable from 'sortablejs';
import './search-field-filter.scss';

export const SearchFieldFilter = defineComponent({
  name: 'SearchFieldFilter',
  props: {
    cacheKey: {
      type: String,
      required: true,
    },
    columns: {
      type: Array as PropType<LowCodeWidget.SearchSchema[]>,
      default: () => [],
    },
  },
  emits: ['changeColumns'],
  setup(props, { emit }) {
    const ns = useNamespace('search-field-filter');
    // 是否显示 Popover
    const showPopover = ref(false);
    // 需要隐藏的字段
    const hideItems = useStorage<string[]>(
      `${UserData.value.userId}_${props.cacheKey}_hide`,
      () => {
        return [];
      },
    );
    // 排序顺序（存储列ID数组）
    const sortOrder = useStorage<string[]>(
      `${UserData.value.userId}_${props.cacheKey}_sort`,
      () => {
        return [];
      },
    );

    // 根据排序顺序返回排序后的列
    const sortedColumns = computed(() => {
      if (!sortOrder.value || sortOrder.value.length === 0) {
        return props.columns;
      }
      // 创建一个ID到列的映射
      const columnMap = new Map(props.columns.map((col) => [col.id, col]));
      // 根据sortOrder排序
      const sorted: LowCodeWidget.SearchSchema[] = [];
      sortOrder.value.forEach((id) => {
        const col = columnMap.get(id);
        if (col) {
          sorted.push(col);
          columnMap.delete(id);
        }
      });
      // 添加新增的列（在sortOrder中不存在的）
      columnMap.forEach((col) => sorted.push(col));
      return sorted;
    });

    /**
     * 通知父组件更新顺序
     *
     * @author chitanda
     * @date 2025-10-15 19:10:20
     */
    function sendShowColumns(): void {
      // 如果没有排序数据，返回原始列（排除隐藏项）
      if (!sortOrder.value || sortOrder.value.length === 0) {
        emit(
          'changeColumns',
          props.columns.map((col) => col.id).filter((id) => !hideItems.value.includes(id)),
        );
        return;
      }
      // 有排序数据时，按排序顺序返回（排除隐藏项）
      emit(
        'changeColumns',
        sortOrder.value.filter((id) => !hideItems.value.includes(id)),
      );
    }

    function toggleColumnVisibility(columnId: string): void {
      const index = hideItems.value.indexOf(columnId);
      if (index > -1) {
        // 当前是隐藏状态，移除隐藏
        hideItems.value.splice(index, 1);
      } else {
        // 当前是显示状态，添加隐藏
        hideItems.value.push(columnId);
      }
      sendShowColumns();
    }

    function renderColumn(column: LowCodeWidget.SearchSchema) {
      const isHide = hideItems.value.includes(column.id);
      const label = column.props ? column.props.label || (column.props as IObject).fieldName : '';
      return (
        <div class={ns.e('filter-item')} key={column.id} data-id={column.id}>
          <div class={ns.e('filter-label')}>{label}</div>
          <div class={ns.e('filter-actions')}>
            <span
              class={[ns.e('action-item'), ns.e('action-hidden'), ns.is('hide', isHide)]}
              onClick={() => toggleColumnVisibility(column.id)}
            >
              <i
                class={[
                  'gct-iconfont',
                  isHide ? 'icon-chaxunzujian-yincang' : 'icon-chaxunzujian-xianshi',
                ]}
              />
            </span>
            <span class={[ns.e('action-item'), ns.e('action-handle')]}>
              <i class="gct-iconfont icon-chaxunzujian-tuozhuai" />
            </span>
          </div>
        </div>
      );
    }

    // filter-list DOM ref
    const filterListRef = ref<HTMLElement | null>(null);
    const sortableInstance = ref<Sortable | null>(null);

    watch(filterListRef, () => {
      if (sortableInstance.value) {
        sortableInstance.value.destroy();
      }
      if (filterListRef.value) {
        sortableInstance.value = Sortable.create(filterListRef.value as HTMLElement, {
          handle: `.${ns.e('action-handle')}`,
          animation: 150,
          onEnd: (evt) => {
            const oldIndex = evt.oldIndex;
            const newIndex = evt.newIndex;
            if (oldIndex === undefined || newIndex === undefined || oldIndex === newIndex) return;
            // 重新排序 sortedColumns
            const columns = [...sortedColumns.value];
            const moved = columns.splice(oldIndex, 1)[0];
            columns.splice(newIndex, 0, moved);
            // 保存新的排序顺序
            sortOrder.value = columns.map((col) => col.id);
            sendShowColumns();
          },
        }) as any;
      }
    });

    sendShowColumns();

    return () => {
      return (
        <Popover class={ns.b()} v-model:show={showPopover.value} placement="bottom-end">
          {{
            reference: () => {
              return (
                <span class={[ns.e('button'), ns.is('active', showPopover.value)]} title="筛选">
                  <i class="gct-iconfont icon-chaxunzujian-shaixuanshezhi"></i>
                </span>
              );
            },
            default: () => {
              return (
                <div class={ns.e('content')}>
                  <div class={ns.e('title')}>筛选项管理</div>
                  <div class={ns.e('filter-list')} ref={filterListRef}>
                    {sortedColumns.value.map((column) => renderColumn(column))}
                  </div>
                </div>
              );
            },
          }}
        </Popover>
      );
    };
  },
});
