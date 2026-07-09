<template>
  <div class="h-full flex flex-col app-version-wrap">
    <div class="flex flex-none pl-16px pr-16px pb-12px pt-12px" style="margin-left: auto">
      <a-button type="link" @click="handleViewMergeLogs">
        {{ t('合并记录') }}
      </a-button>
      <a-button type="primary" ghost @click="handleMerge">
        {{ isImport ? t('sys.app.branch.merge') : t('sys.app.version.merge') }}
      </a-button>
      <a-button
        v-if="detail.sourceType === SourceTypeEnum.IMPORT"
        class="ml-10px"
        type="primary"
        ghost
        @click="handleImport"
      >
        <UploadOutlined />
        {{ t('sys.app.branch.import') }}
      </a-button>
      <a-button type="primary" @click="handleCreate" class="ml-10px">
        <plus-outlined />
        {{ isImport ? t('sys.app.branch.create') : t('sys.app.version.create') }}
      </a-button>
    </div>
    <a-table
      class="h-100px flex-1"
      row-key="id"
      :columns="columns"
      :data-source="tableData"
      bordered
      :pagination="false"
      :loading="loading"
      size="middle"
      ref="tableContainerRef"
      :scroll="{
        y: scrollHeight,
      }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'appVersion'">
          <span class="mr-8px">{{ isImport ? record.seq : record.appVersion }}</span>
          <a-tag
            color="error"
            v-if="record.releasable !== 1"
            class="important-pl-4px important-pr-4px"
          >
            <lock-outlined />
          </a-tag>
          <a-tag color="warning" v-if="record.head">
            {{ isImport ? t('sys.app.currentBranch') : t('sys.app.currentVersion') }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'actions'">
          <table-action-auto
            :actions="[
              {
                label: t('sys.app.version.toggle'),
                ifShow: record.head !== 1,
                popConfirm: {
                  title: t('sys.app.version.sureToToggle'),
                  confirm: () => handleToggle(record),
                },
              },
              {
                label: t('sys.export'),
                onClick: () => handleExport(record),
                ifShow: !!record.releaseTag && detail.sourceType !== SourceTypeEnum.IMPORT,
              },
            ]"
            :stopButtonPropagation="true"
          />
        </template>
      </template>
    </a-table>
  </div>
  <version-create-modal @register="register" :branches="versionsForCreate" @ok="getTableData" />
  <version-merge-modal @register="registerMerge" :branches="tableData" />
  <version-merge-logs-modal @register="registerMergeLogs" />
  <branch-import-modal
    @register="registerBranchImport"
    @ok="getTableData"
    :appId="pid"
    :branch="branchForImport"
  />
  <branch-create-modal
    :source-branch="branchForCreate"
    @register="registerBranchCreate"
    @ok="getTableData"
  />
</template>

<script setup lang="ts">
  import { ref, onMounted, computed, provide } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { TableColumnsType } from 'ant-design-vue';
  import { TableActionAuto } from '/@/components/Table';
  import { useAntTableScrollHeight } from '/@/hooks/component/useAntTable';
  import { useModal } from '/@/components/Modal';
  import { AppDetailTabEnum, PlatformEnum, SourceTypeEnum } from '../../constant/interface';
  import type { AppResponse, AppBranchResponse } from '/@/apis/gct-platform/model';
  import { message } from 'ant-design-vue';
  import {
    getAppListBranchByAppId,
    postAppSwitchBranchByAppId,
  } from '/@/apis/gct-platform/AppController';
  import VersionCreateModal from '../modal/version-create-modal.vue';
  import VersionMergeModal from '../modal/version-merge-modal.vue';
  import VersionMergeLogsModal from '../modal/version-merge-logs-modal.vue';
  import BranchImportModal from '../modal/branch-import-modal.vue';
  import BranchCreateModal from '../modal/branch-create-modal.vue';
  import { LockOutlined } from '@ant-design/icons-vue';
  import { downloadByUrl, downloadByData } from '/@/utils/file/download';
  import { fileUrlParser } from '/@/components/Cropper/hooks/useFile';
  import { useEmitter } from '/@/components/AppManageCmp/src/hooks/useEmitter';
  import { getMinioFileDownload } from '/@/apis/gct-platform/FileController';

  interface Props {
    /** 应用id */
    pid?: string;
    /** 租户id */
    tenantId: string;
    tabActiveKey: AppDetailTabEnum;
    /** 应用详情信息 */
    detail: AppResponse;
    platformType: PlatformEnum;
  }

  const props = defineProps<Props>();

  const { t } = useI18n();
  const [register, { openModal }] = useModal();
  const [registerMerge, { openModal: openMergeModal }] = useModal();
  const [registerMergeLogs, { openModal: openMergeLogsModal }] = useModal();
  const [registerBranchImport, { openModal: openImportModal }] = useModal();
  const [registerBranchCreate, { openModal: openBranchCreateModal }] = useModal();

  const { emitter, EmitterEnum } = useEmitter();

  const tableContainerRef = ref();
  const { scrollHeight } = useAntTableScrollHeight(tableContainerRef);

  onMounted(() => {
    getTableData();
  });

  const loading = ref<boolean>(false);
  const tableData = ref<AppBranchResponse[]>([]);
  const versionsForCreate = computed(() => {
    return tableData.value.filter((i) => i.releaseTag);
  });
  const branchForCreate = computed(() => {
    return tableData.value[0];
  });
  const branchForImport = computed(() => {
    return tableData.value[0];
  });

  const isImport = computed(() => props.detail.sourceType === SourceTypeEnum.IMPORT);
  provide('isImport', isImport);

  const getTableData = async () => {
    loading.value = true;
    const res = await getAppListBranchByAppId({
      appId: props.pid!,
    }).finally(() => {
      loading.value = false;
    });
    tableData.value = res ?? [];
  };

  const columns = computed(() => {
    const columns: TableColumnsType = [
      {
        title: isImport.value ? t('sys.app.branch.no') : t('sys.app.version.no'),
        dataIndex: 'appVersion',
        key: 'appVersion',
      },
      {
        title: isImport.value ? t('sys.app.branch.id') : t('sys.app.version.id'),
        dataIndex: 'id',
      },
      {
        title: t('sys.app.releaseTag'),
        dataIndex: 'releaseTag',
        ellipsis: true,
      },
      {
        title: t('sys.notes'),
        dataIndex: 'description',
        ellipsis: true,
      },
      {
        title: t('sys.createUser'),
        dataIndex: 'createUserName',
        ellipsis: true,
      },
      {
        title: t('sys.createTime'),
        dataIndex: 'createTime',
        width: 170,
      },
      {
        title: t('sys.operation'),
        dataIndex: 'actions',
        key: 'actions',
      },
    ];
    if (isImport.value) {
      columns.splice(2, 0, {
        title: t('sys.app.version.belong'),
        dataIndex: 'appVersion',
      });
    }
    return columns;
  });

  const handleCreate = () => {
    if (isImport.value) {
      openBranchCreateModal(true, {
        appId: props.pid,
      });
    } else {
      openModal(true, {
        appId: props.pid,
      });
    }
  };

  const handleToggle = (record: AppBranchResponse) => {
    postAppSwitchBranchByAppId(
      { appId: props.pid! },
      {
        appId: props.pid,
        branchId: record.id,
      },
    ).then(() => {
      message.success(t('sys.app.version.toggleSuccess'));
      getTableData();
      emitter.emit(EmitterEnum.on_refresh_app_detail, { id: props.pid });
    });
  };

  const handleExport = async (record: AppBranchResponse) => {
    let { data } = await getMinioFileDownload(
      { fileUrl: record.appPkgUrl },
      {
        isReturnNativeResponse: true,
        transferToConfig: {
          responseType: 'blob',
          responseEncoding: 'utf8',
        },
      },
    );

    downloadByData(data, { filename: record.appPkgUrl });
    // if (record.appPkgUrl) {
    //   downloadByUrl({
    //     url: fileUrlParser(record.appPkgUrl),
    //   });
    // }
  };

  const handleMerge = () => {
    openMergeModal(true, {
      appId: props.pid,
    });
  };

  const handleViewMergeLogs = () => {
    openMergeLogsModal(true, {
      appId: props.pid,
    });
  };

  const handleImport = () => {
    openImportModal(true, {});
  };
</script>

<style lang="less" scoped>
  .app-version-wrap {
    :deep(.ant-table-container) {
      border-left: none;
      border-right: none;
      border-bottom: none;
    }
  }
</style>
