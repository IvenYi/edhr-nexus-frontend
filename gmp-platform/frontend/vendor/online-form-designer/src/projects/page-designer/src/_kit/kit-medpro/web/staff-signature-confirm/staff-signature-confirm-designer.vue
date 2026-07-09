<template>
  <div class="staff-signature-confirm-designer">
    <a-button type="primary" style="margin-bottom: 8px" v-if="!computedHideAdd">添加</a-button>
    <a-table :pagination="false" :dataSource="designData" :columns="computedColumns">
      <template #bodyCell="{ column, index, record }">
        <template v-if="column.key === 'index'">
          <span>{{ index + 1 }}</span>
        </template>
        <template v-else-if="column.dataIndex === 'operation'">
          <a v-if="isSignRequired">签名验证</a>
          <a class="color-red-600 ml-2">删除</a>
        </template>
        <template v-else>
          <a-input v-model:value="record.key" />
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts" name="gct-staff-signature-confirm-designer">
  import { toRefs, computed } from 'vue';
  import { IStaffSignatureConfirm } from './schema';

  const defProps = defineProps<{ widget?: IStaffSignatureConfirm }>();
  const { isSignRequired, needOtherFields, otherFieldsData, hideAdd } = toRefs(
    defProps.widget.props,
  );

  const designData = [
    {
      name: 'Jayson',
    },
  ];

  const computedColumns = computed(() => {
    const columns = [
      {
        title: '人员',
        dataIndex: 'info',
      },
      {
        title: '操作',
        dataIndex: 'operation',
      },
    ];
    if (needOtherFields?.value && otherFieldsData?.value) {
      for (const key in otherFieldsData.value) {
        const element = otherFieldsData.value[key];
        if (element) {
          const addItem = {
            title: element.name,
            dataIndex: element.key,
            key: element.key,
            type: element.type,
          };
          columns.splice(columns.length - 1, 0, addItem);
        }
      }
    }
    return columns;
  });

  const computedHideAdd = computed(() => {
    return hideAdd?.value;
  });
</script>
