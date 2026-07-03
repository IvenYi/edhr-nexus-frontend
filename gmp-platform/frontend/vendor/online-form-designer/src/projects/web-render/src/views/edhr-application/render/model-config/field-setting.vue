<template>
  <div class="field-setting">
    <div class="field-setting-header flex items-center mb-10px">
      <div class="field-setting-title">{{ t('sys.platform.extendsField') }}</div>
      <a-button type="primary" @click="handleAddField">
        <plus-outlined />
        {{ t('sys.add') + t('sys.appDesigner.field') }}
      </a-button>
    </div>
    <div class="field-setting-container">
      <basic-table
        class="table"
        :striped="false"
        :bordered="true"
        :showIndexColumn="false"
        :ellipsis="true"
        :columns="tableColumns"
        :dataSource="fieldsData"
        :pagination="false"
        :loading="loading"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'required'">
            <span>{{ record.required === 0 ? t('sys.false') : t('sys.true') }}</span>
          </template>
          <template v-if="column.key === 'action'">
            <table-action-auto
              :actions="[
                {
                  label: t('sys.edit'),
                  onClick: handleFieldEdit.bind(null, record),
                },
                {
                  label: t('sys.delete'),
                  color: 'error',
                  popConfirm: {
                    title: t('sys.sureToDelete'),
                    confirm: handleFieldDelete.bind(null, record),
                  },
                },
              ]"
              :stopButtonPropagation="true"
            />
          </template>
        </template>
      </basic-table>
    </div>
  </div>
  <field-modal ref="fieldModal" :allRelationFields="allRelationFields" @change="handleChange" />
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useModelConfig } from './useModelConfig';
  import { FieldMetaDTO } from '@gct/runtime';
  import { BasicColumn, TableActionAuto } from '/@/components/Table';

  import FieldModal from './modal/field-modal.vue';

  const { t } = useI18n();

  const tableColumns: BasicColumn[] = [
    {
      title: t('sys.model.fieldName'),
      dataIndex: 'name',
      align: 'left',
    },
    {
      title: t('sys.model.refField'),
      dataIndex: 'key',
      align: 'left',
    },
    {
      title: t('sys.requiredOrNot'),
      dataIndex: 'required',
      align: 'left',
    },
    {
      title: t('sys.operation'),
      dataIndex: 'action',
      width: 150,
      align: 'left',
    },
  ];

  const props = defineProps<{
    fieldsData: Array<any>;
    allRelationFields: FieldMetaDTO[];
    modelKey: string;
    loading: boolean;
  }>();

  const emit = defineEmits(['update']);

  const fieldModal = ref<InstanceType<typeof FieldModal> | null>(null);

  const { updateFieldMeta } = useModelConfig();

  // 添加字段
  const handleAddField = () => {
    fieldModal.value?.open({ isEdit: false });
  };

  // 编辑字段
  const handleFieldEdit = (item) => {
    fieldModal.value?.open({ ...item, isEdit: true });
  };

  // 删除字段
  const handleFieldDelete = async (record) => {
    const relationFieldId = record.id;
    await updateFieldMeta(relationFieldId, record, { isDelete: true });
    emit('update');
  };

  const handleChange = async (data) => {
    if (!data) return;
    const relationField = props.allRelationFields.find((item) => item.key === data.key) as any;
    const relationFieldId = props.allRelationFields.find((item) => item.key === data.key)?.id;
    await updateFieldMeta(relationFieldId, { ...relationField, ...data }, { isDelete: false });
    emit('update');
  };
</script>

<style lang="less" scoped>
  .field-setting {
    &-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 16px;
    }
    &-title {
      font-size: 16px;
      font-weight: 600;
      color: #212528;
    }
    &-container {
      background: #ffffff;
      .table {
        :deep(.ant-table-body) {
          // max-height: 600px !important;
        }
      }
    }
  }
</style>
