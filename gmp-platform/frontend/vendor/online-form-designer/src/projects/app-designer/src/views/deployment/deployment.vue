<template>
  <basic-page>
    <basic-table
      :striped="false"
      :bordered="true"
      :showIndexColumn="false"
      :ellipsis="true"
      :columns="publishColumns"
      :dataSource="tableData"
      :pagination="pagination"
      @change="handleTableChange"
    >
      <template #headerTop>
        <a-button type="primary" @click="handleDeploy">
          <i class="iconfont icon-a-Carryout mr-6px"></i>
          {{ t('sys.appDesigner.depolyment') }}
        </a-button>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'state'"
          ><a-tag :color="colorMap.get(record.state)">{{ deployState(record.state) }}</a-tag>
        </template>
        <template v-if="column.key === 'actions'">
          <table-action-auto
            :actions="[
              {
                label: t('sys.appDesigner.publishContent'),
                onClick: handleRowContent.bind(null, record),
              },
              {
                label: t('sys.appDesigner.detail'),
                onClick: handleRowDetail.bind(null, record),
              },
            ]"
            :stopButtonPropagation="true"
          />
        </template>
      </template>
    </basic-table>

    <!-- 弹窗部分 -->
    <publisher-content-modal @register="contentRegister" @need-loop="startLoop" />
    <publisher-detail-modal @register="detailRegister" />
  </basic-page>
</template>

<script setup lang="ts">
  import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
  import { BasicTable, TableActionAuto } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { publishColumns, colorMap, deployState } from './constant/publish';
  import { useI18n } from '/@/hooks/web/useI18n';
  import PublisherContentModal from './modal/publisher-content-modal.vue';
  import PublisherDetailModal from './modal/publisher-detail-modal.vue';
  import { getAppReleaseList } from '/@/apis/gct-apaas/AppReleaseController';
  import { AppReleaseResponse } from '/@/apis/gct-apaas/model';
  import { useAsyncLooper } from '/@/hooks/web/useAsyncLooper';

  const { t } = useI18n();
  const [contentRegister, { openModal: openContentModal }] = useModal();
  const [detailRegister, { openModal: openDetailModal }] = useModal();
  const pagination = reactive({});
  const handleTableChange = () => {};
  const tableData = ref<AppReleaseResponse[]>([]);
  const state = ['PREPARING', 'DEPLOYING'];
  let interval: NodeJS.Timer;

  onMounted(() => {
    getTableData();
    interval = setInterval(() => {
      tableData.value.some((item) => {
        if (state.includes(item.state!)) {
          getTableData();
        }
      });
    }, 20000);
  });

  onUnmounted(() => {
    clearInterval(interval);
  });

  const getTableData = async () => {
    tableData.value = (await getAppReleaseList()) || [];
  };

  const onRefresh = () => {
    getTableData();
  };

  const handleDeploy = () => {
    openContentModal(true, { isEdit: true });
  };

  const handleRowContent = (data) => {
    openContentModal(true, data);
  };

  const handleRowDetail = (data) => {
    openDetailModal(true, data);
  };

  // 轮询接口
  const { startLoop, stopLoop } = useAsyncLooper(onRefresh, {
    time: 1500,
    immediate: false,
  });
  // 当所有数据状态都为成功或者失败时停止轮询
  const needLooper = computed(() => {
    return tableData.value.some((item) => {
      return state.includes(item.state!);
    });
  });

  watch(
    () => needLooper.value,
    (v) => {
      if (v) {
        startLoop();
      } else {
        stopLoop();
      }
    },
  );
</script>

<style lang="less" scoped>
  :deep(.vben-basic-table-action) {
    justify-content: center;
  }
</style>
