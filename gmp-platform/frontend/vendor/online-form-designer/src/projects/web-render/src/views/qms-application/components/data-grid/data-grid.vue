<template>
  <div class="analytics-data-grid">
    <div class="analytics-data-grid_title"> {{ title }}</div>
    <table v-if="!isEmpty(defProps.dataSource)">
      <thead v-if="showHeader">
        <tr>
          <th v-for="(column, index) in columns" :key="index" :align="column.align">
            {{ column.title }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(record, rowIndex) in defProps.dataSource"
          :key="rowIndex"
          :style="rowStyle(record)"
          @click="handleRowClick(record)"
        >
          <td
            v-for="(column, colIndex) in columns"
            :key="colIndex"
            :style="{ width: `${column.width}px` }"
            :align="column.align"
          >
            <slot
              v-if="column.scopedSlots"
              :name="column.scopedSlots"
              :record="record"
              :column="column"
              :rowIndex="rowIndex"
            ></slot>
            <span v-else>{{ record[column.dataIndex] }}</span>
          </td>
        </tr>
      </tbody>
    </table>

    <a-empty v-else />
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { isEmpty } from 'lodash-es';

  interface IProps {
    title?: string;
    columns: Array<{
      title: string;
      dataIndex: string;
      scopedSlots?: string;
      width?: string | number;
      align?: 'left' | 'right' | 'center';
    }>;
    dataSource: Array<Record<string, any>>;
    showHeader?: boolean;
    showIndex?: boolean;
    config?;
  }
  const defProps = withDefaults(defineProps<IProps>(), {
    title: '',
    columns: [
      { title: '指标名称', dataIndex: 'name', align: 'center' },
      { title: '值', dataIndex: 'value', align: 'center' },
    ],
    dataSource: () => [],
    config: {
      clickable: false,
      highlight: false,
    },
    showHeader: true,
    showIndex: false,
  });

  const currentRow = ref<Record<string, any>>();
  const rowStyle = computed(() => (row) => {
    return {
      cursor: defProps.config?.clickable ? 'pointer' : 'default',
      'background-color':
        defProps.config?.highlight && currentRow.value && currentRow.value.id_ === row.id_
          ? '#e6f7ff'
          : '',
    };
  });

  const emit = defineEmits<{
    (e: 'rowClick', row: Record<string, any>): void;
  }>();

  function handleRowClick(row) {
    if (!defProps.config?.clickable) return;
    currentRow.value = row;
    emit('rowClick', row);
  }

  defineExpose({
    handleRowClick,
  });
</script>

<style lang="less">
  .analytics-data-grid {
    box-sizing: border-box;
    padding: 8px;
    background-color: #fff;
    height: auto;

    &_title {
      font-weight: bold;
      margin-bottom: 6px;
      position: relative;
      overflow: hidden;
      padding-left: 12px;
      &::after {
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        content: '';
        display: block;
        margin-right: 12px;
        width: 4px;
        height: 16px;
        background-color: var(--ant-primary-color);
      }
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th,
    td {
      padding: 8px 12px;
      border: 1px solid #ddd;
      white-space: nowrap;
    }

    th {
      background-color: #fafafa;
      font-weight: bold;
    }
  }
</style>
