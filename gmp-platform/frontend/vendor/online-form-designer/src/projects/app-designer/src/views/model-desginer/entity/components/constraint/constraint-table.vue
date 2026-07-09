<template>
  <basic-table
    ref="tableRef"
    :striped="false"
    :bordered="true"
    :showIndexColumn="false"
    :ellipsis="true"
    :pagination="false"
    class="model-designer-basic-table"
    :columns="tableColumns"
    :dataSource="tableData"
  >
    <template #headerTop>
      <div style="text-align: right">
        <a-button @click="handleNew" type="primary">{{ t('sys.new') }}</a-button>
      </div>
    </template>
    <template #bodyCell="{ column, record, index }">
      <template v-if="column.key === 'type'">
        {{ getTypeName(record.type) }}
      </template>
      <template v-if="column.key === 'range'">
        {{ t('sys.' + Constraint_TYPE_LANG['tree_' + record.type]) }}
      </template>
      <template v-if="column.key === 'fieldNames'">
        {{ record.fieldNames.toString() }}
      </template>
      <template v-if="column.key === 'actions'">
        <table-action-auto
          :actions="[
            {
              label: t('sys.edit'),
              onClick: handleRowEdit.bind(null, record, index),
            },
            {
              label: t('sys.delete'),
              color: 'error',
              popConfirm: {
                title: t('sys.sureToDo'),
                confirm: handleRowDelete.bind(null, index),
              },
            },
          ]"
          :stopButtonPropagation="true"
        />
      </template>
    </template>
  </basic-table>
  <constraint-modal @register="registerEvent" :modelKey="model.key" @refresh="onRefresh" />
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import { message } from 'ant-design-vue';
  import { useModal } from '/@/components/Modal';
  import { BasicTable, TableActionAuto } from '/@/components/Table';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { constraintColumns, treeModelConstraintColumns } from './constant/columns';
  import ConstraintModal from './modal/constraint-modal.vue';
  import { EntityModelTypeEnum } from '/@/projects/app-designer/src/enum';
  import { Constraint_TYPE_LANG } from './constant/enum';
  import { putModelMetaConstantByModelKey } from '/@/apis/gct-apaas/ModelMetaController';
  import { cloneDeep } from 'lodash-es';

  const props = defineProps<{
    model;
  }>();

  const emit = defineEmits(['update']);
  const { t } = useI18n();
  const [registerEvent, { openModal }] = useModal();
  const tableData = ref([]);
  const tableRef = ref();

  const isTree = computed(() => {
    return props.model?.type === EntityModelTypeEnum.TREE;
  });

  const tableColumns = computed(() => {
    return isTree.value ? treeModelConstraintColumns : constraintColumns;
  });

  const handleNew = () => {
    openModal(true, { model: props.model });
  };

  const initTableData = async () => {
    tableData.value = props.model?.constraint || [];
  };

  watch(
    () => props.model,
    () => {
      initTableData();
    },
    {
      immediate: true,
      deep: true,
    },
  );

  const onRefresh = () => {
    emit('update', props.model.key);
  };

  // 编辑
  const handleRowEdit = (data, index) => {
    openModal(true, { rowData: { ...data }, model: props.model, index });
  };

  // 删除
  const handleRowDelete = async (index) => {
    const path = {
      modelKey: props.model.key,
    };

    const constraint = cloneDeep(tableData.value);
    constraint.splice(index, 1);

    await putModelMetaConstantByModelKey(
      path,
      { constraint },
      {
        transferToConfig: { headers: { operateType: 'DELETE' } },
      },
    );
    message.success('删除成功');
    onRefresh();
  };

  const getTypeName = (type) => {
    if (isTree.value && type.includes('UNIQUE')) {
      return t('sys.' + Constraint_TYPE_LANG['GLOBAL_UNIQUE']);
    } else {
      return t('sys.' + Constraint_TYPE_LANG[type]);
    }
  };

  defineExpose({
    redoHeight() {
      tableRef.value && tableRef.value.redoHeight();
    },
  });
</script>

<style lang="less" scoped></style>
