<template>
  <a-table :columns="columns" :dataSource="dataSource" size="small" :pagination="false">
    <template #headerCell="{ title, column }">
      <slot name="headerCell" :title="title" :column="column">
        <div v-if="column.required">
          <span class="text-red mr-2">*</span>
          <span>{{ title }}</span>
        </div>
        <div v-else-if="column.tooltip">
          <a-tooltip placement="top">
            <template #title>
              <span>{{ column.tooltip }}</span>
            </template>
            {{ title }}
            <info-circle-outlined class="ml5px cursor-pointer" />
          </a-tooltip>
        </div>
        <div v-else>
          <span>{{ title }}</span>
        </div>
      </slot>
    </template>

    <!-- 动态单元格插槽 -->
    <template #bodyCell="{ record, column, index }">
      <!-- 1. 自定义渲染逻辑 (通过 slot 暴露给父组件，保持最大灵活性) -->
      <slot name="bodyCell" :record="record" :column="column" :index="index" :disabled="disabled">
        <!-- 默认 fallback: 如果父组件没传 bodyCell slot，这里可以放一些极简的默认逻辑，或者留空强制父组件传递 -->
      </slot>

      <!-- 2. 操作列默认逻辑 (如果父组件没有完全接管 operation_ 列) -->
      <template v-if="column.dataIndex === 'operation_' && !hasCustomOperationSlot">
        <table-action-auto
          v-if="record.sysBuiltin !== 1 && !disabled"
          :actions="[
            {
              label: $t('sys.delete'),
              color: 'error',
              onClick: () => emit('delete', record),
            },
          ]"
          :stopButtonPropagation="true"
        />
      </template>
    </template>
  </a-table>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { InfoCircleOutlined } from '@ant-design/icons-vue';
  import { TableActionAuto } from '/@/components/Table';
  import { operationEntryColumns } from '../config';

  const props = defineProps<{
    type: 'form_entries_' | 'document_entries_' | string; // 支持扩展
    dataSource: any[];
    disabled: boolean;
    // 允许父组件覆盖默认的列配置，或者补充额外属性（如 required, tooltip）
    columnOverrides?: Record<string, Partial<any>>;
  }>();

  const emit = defineEmits<{
    (e: 'delete', record: any): void;
  }>();

  // 检查父组件是否提供了自定义的操作列插槽，以避免重复渲染
  const slots = defineSlots();
  const hasCustomOperationSlot = computed(() => !!slots.bodyCell);

  const columns = computed(() => {
    const baseColumns =
      operationEntryColumns[props.type as keyof typeof operationEntryColumns] || [];

    return baseColumns
      .filter((col) => {
        if (props.disabled && col.dataIndex === 'operation_') return false;
        return true;
      })
      .map((col) => {
        // 应用父组件传来的覆盖配置（比如标记哪些列是必填的，用于 header 显示红星）
        const override = props.columnOverrides?.[col.dataIndex];
        return {
          ...col,
          ...override,
        };
      });
  });
</script>
