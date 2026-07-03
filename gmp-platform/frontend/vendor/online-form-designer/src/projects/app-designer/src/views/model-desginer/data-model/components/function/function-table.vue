<template>
  <div class="table-wrap">
    <basic-table
      class="model-designer-basic-table"
      ref="tableRef"
      :striped="false"
      :bordered="true"
      :showIndexColumn="false"
      :ellipsis="true"
      :pagination="false"
      :columns="functionColumns"
      :dataSource="tableData"
    >
      <template #headerTop>
        <a-row justify="space-between" type="flex">
          <a-col style="display: flex">
            <a-input
              v-model:value="searchKey"
              :placeholder="t('sys.appDesigner.searchByFunctionVerification')"
              alowClear
              @pressEnter="searchList"
            >
              <template #prefix>
                <!-- <search-outlined /> -->
                <i class="iconfont icon-sousuo1" style="height: 22px"></i>
              </template>
            </a-input>
          </a-col>
        </a-row>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'type'">
          <div>{{ Ch_FunctionType[record.type] }}</div>
        </template>
        <!-- <template v-if="column.key === 'action'">
          <table-action-auto
            :actions="[
              {
                label: t('sys.detail'),
                onClick: handleRowDetail.bind(null, record),
              },
            ]"
            :stopButtonPropagation="true"
          />
        </template> -->
      </template>
    </basic-table>
    <function-detail-modal @register="register" />
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { BasicTable, TableActionAuto } from '/@/components/Table';
  import FunctionDetailModal from './modal/function-detail-modal.vue';
  import { useModal } from '/@/components/Modal';

  import { functionColumns } from './constant/columns';
  import { Ch_FunctionType } from './constant/index';
  import type { ModelMethodResponse } from '/@/apis/gct-apaas/model';
  import { getModelComprehensiveMethodListByModelCategory } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { DataModelResponse } from '/@/apis/gct-apaas/model';
  import { useI18n } from '/@/hooks/web/useI18n';

  const props = defineProps<{
    model: DataModelResponse;
    category: string;
  }>();

  const { t } = useI18n();

  const tableData = ref<ModelMethodResponse[]>([]);
  const [register, { openModal }] = useModal();
  const tableRef = ref();
  const searchKey = ref<string>('');

  const getTableData = async () => {
    const params: any = {
      modelKey: props.model.key,
    };
    tableData.value =
      (await getModelComprehensiveMethodListByModelCategory(
        {
          modelCategory: 'data',
        },
        params,
      )) || [];
  };

  const searchList = async () => {
    await getTableData();
    tableData.value = tableData.value.filter((ele) => {
      if (
        ele.key.toLowerCase().includes(searchKey.value.toLowerCase()) ||
        ele.name.toLowerCase().includes(searchKey.value.toLowerCase())
      ) {
        return ele;
      }
    });
  };

  watch(
    () => props.model.key,
    () => {
      getTableData();
    },
    {
      immediate: true,
    },
  );

  watch(
    () => searchKey.value,
    (val) => {
      if (!val) {
        getTableData();
      }
    },
  );

  const handleRowDetail = (info) => {
    openModal(true, {
      content: info.usage ?? '',
    });
  };

  defineExpose({
    redoHeight() {
      tableRef.value && tableRef.value.redoHeight();
    },
  });
</script>

<style lang="less" scoped>
  .table-wrap {
    .column-enabled {
      display: flex;
      align-items: center;
      justify-content: center;

      > i {
        width: 6px;
        height: 6px;
        margin-right: 8px;
        border-radius: 3px;
        background-color: #00000040;
      }

      &.enable-enabled {
        > i {
          background-color: #00b578;
        }
      }
    }
  }
</style>
