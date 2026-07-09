<template>
  <div class="table-wrap">
    <basic-table
      class="model-designer-basic-table"
      :striped="false"
      :bordered="true"
      :showIndexColumn="false"
      :ellipsis="true"
      :pagination="false"
      :columns="viewFunctionColumns"
      :dataSource="tableData"
    >
      <template #headerTop>
        <a-row justify="space-between" type="flex">
          <a-col style="display: flex">
            <a-input
              v-model:value="searchKey"
              :placeholder="t('sys.appDesigner.searchByFunctionVerification')"
              alowClear
              @pressEnter="getTableData"
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
        <template v-if="column.key === 'action'">
          <table-action-auto
            :actions="[
              {
                label: t('sys.detail'),
                onClick: handleRowDetail.bind(null, record),
              },
            ]"
            :stopButtonPropagation="true"
          />
        </template>
      </template>
    </basic-table>
    <function-detail-modal @register="register" :modelKey="model.key" @refresh="onRefresh" />
  </div>
</template>

<script setup lang="ts" name="view-function-table">
  import { ref, watch } from 'vue';
  import { BasicTable, TableActionAuto } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import FunctionDetailModal from '../modal/function-detail-modal.vue';

  import { viewFunctionColumns } from '../constant/columns';
  import { useI18n } from '/@/hooks/web/useI18n';

  import { getModelMethodViewModelList } from '/@/apis/gct-apaas/ModelMethodController';

  import type { ModelMethodResponse } from '/@/apis/gct-apaas/model';

  const { t } = useI18n();

  const props = defineProps<{
    model;
  }>();

  const tableData = ref<ModelMethodResponse[]>([]);
  const searchKey = ref<string>('');

  const [register, { openModal }] = useModal();

  const getTableData = async () => {
    tableData.value =
      (await getModelMethodViewModelList({
        keyword: searchKey.value ? searchKey.value : undefined,
      })) || [];
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

  const onRefresh = () => {
    getTableData();
  };

  const handleRowDetail = (info) => {
    openModal(true, {
      content: info.usage ?? '',
    });
  };
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
