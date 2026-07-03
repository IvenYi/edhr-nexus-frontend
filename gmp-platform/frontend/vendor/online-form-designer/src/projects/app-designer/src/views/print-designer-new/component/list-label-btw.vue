<template>
  <div class="h-full">
    <div class="flex-grow p-4">
      <div class="flex justify-between mb-4">
        <a-input
          v-model:value="searchVal"
          allowClear
          :placeholder="$t('sys.printDesigner.searchLabelName')"
          style="width: 360px"
          @pressEnter="queryTableData"
          @change="handleSearchChange"
        >
          <template #suffix>
            <i class="iconfont icon-sousuoMedpro text-[#212528]"></i>
          </template>
        </a-input>
        <div>
          <a-button
            v-if="userActions[CustomAction.BtwConvertTemplate]"
            type="primary"
            @click="handleModalOpen()"
          >
            <div class="flex items-center">
              <i class="icon gct-iconfont icon-icon_mobanzhuanhuan"></i>
              <span class="ml-1">{{ $t('sys.printDesigner.convertTmpl') }}</span>
            </div>
          </a-button>
        </div>
      </div>

      <basic-table
        :striped="false"
        :bordered="true"
        rowKey="id"
        :loading="isLoading"
        :expandedRowKeys="[]"
        :ellipsis="true"
        :columns="tableColumns"
        :data-source="dataSource"
        :pagination="pagination"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'tmplPath'">
            <span class="tmpl-path">
              <img class="tmpl-icon mr-2px" :src="svgPrinter" />
              <span>{{ record.printName }}</span>
              <template v-for="(item, index) in record.tmplPath" :key="index">
                /<img class="tmpl-icon ml-3px mr-2px" :src="svgFolder" />
                <span>{{ item?.replace(labelRegex, '\/') }}</span>
                <span
                  v-if="index === 0"
                  :class="['btw-label-tag', record.pathType === 'common' ? 'common' : 'local']"
                  >{{ record.pathType === 'common' ? $t('sys.shared') : $t('sys.local') }}</span
                >
              </template>
            </span>
          </template>
          <template v-if="column.dataIndex === 'actions'">
            <slot name="actions" v-bind="{ record }"></slot>
            <table-action-auto
              :actions="[
                {
                  label: t('sys.edit'),
                  ifShow: userActions[CustomAction.BtwUpdate],
                  onClick: () => handleModalOpen(record, 'update'),
                },
                {
                  label: t('sys.copy'),
                  ifShow: userActions[CustomAction.BtwCopy],
                  onClick: () => handleModalOpen(record, 'copy'),
                },
                {
                  label: t('sys.delete'),
                  ifShow: userActions[CustomAction.BtwDelete],
                  color: 'error',
                  popConfirm: {
                    title: t('sys.confirmExecution'),
                    confirm: handleDelete.bind(null, record),
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

  <BtwLabelModal @register="register" :isEdhr="isEdhr" @refresh="queryTableData" />
</template>

<script setup lang="ts" name="list-label-btw">
  import { computed, onMounted, reactive, ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useModal } from '/@/components/Modal';
  import { message } from 'ant-design-vue';
  import BtwLabelModal from '../modal/btw-label-modal.vue';
  import { BasicTable, TableActionAuto, BasicColumn } from '/@/components/Table';
  import { getPermissionByKey } from '/@web-render/utils/UserappPermissions';
  import { CustomAction } from '/@/enums/authActionEnum';
  import {
    getLabelBtwPageList,
    getLabelGetVersionById,
    deleteLabelBtwRemoveVersionById,
  } from '/@/apis/gct-apaas/LabelController';
  import svgPrinter from '/@/assets/svg/icon-print-printer.svg';
  import svgFolder from '/@/assets/svg/icon-print-folder.svg';

  const props = defineProps<{
    isFrontPrint: boolean;
    isEdhr?: boolean;
  }>();

  const { t } = useI18n();
  const [register, { openModal }] = useModal();

  const searchVal = ref('');
  const searchValCache = ref('');
  const isLoading = ref(false);
  const dataSource = ref<any>([]);
  const labelRegex = /(?<!\\)\\(?!\\)/g;

  const pagination = reactive({
    current: 1,
    total: 0,
    pageSize: 20,
    pageSizeOptions: ['10', '20', '30'],
  });

  const userActions = computed(() => {
    // 目前跟标签设计的共用
    const pageId = props.isEdhr ? 'print-designer-edhr' : 'LabelDesigner';
    return {
      [CustomAction.BtwConvertTemplate]:
        !props.isFrontPrint || getPermissionByKey(pageId, CustomAction.BtwConvertTemplate) || false,
      [CustomAction.BtwUpdate]:
        !props.isFrontPrint || getPermissionByKey(pageId, CustomAction.BtwUpdate) || false,
      [CustomAction.BtwCopy]:
        !props.isFrontPrint || getPermissionByKey(pageId, CustomAction.BtwCopy) || false,
      [CustomAction.BtwDelete]:
        !props.isFrontPrint || getPermissionByKey(pageId, CustomAction.BtwDelete) || false,
    };
  });

  const tableColumns: BasicColumn[] = [
    {
      title: $t('sys.printDesigner.labelTmplName'),
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      fixed: 'left',
    },
    {
      title: $t('sys.model.refModel'),
      dataIndex: 'modelName',
      key: 'modelName',
      ellipsis: true,
    },
    {
      title: 'BarTender ' + t('sys.labelTmplPath'),
      dataIndex: 'tmplPath',
      key: 'tmplPath',
      ellipsis: true,
      minWidth: 200,
    },
    {
      title: t('sys.macAddress'),
      dataIndex: 'macAddress',
      key: 'macAddress',
      ellipsis: true,
      width: 170,
    },
    {
      title: t('sys.creator'),
      dataIndex: 'createUserName',
      key: 'createUserName',
      ellipsis: true,
    },
    {
      title: t('sys.createTime'),
      dataIndex: 'createTime',
      key: 'createTime',
      minWidth: 170,
      width: 170,
    },
    {
      title: t('sys.modifier'),
      dataIndex: 'modifyUserName',
      key: 'modifyUserName',
      ellipsis: true,
    },
    {
      title: t('sys.modifyTime'),
      dataIndex: 'modifyTime',
      key: 'modifyTime',
      ellipsis: true,
      minWidth: 170,
      width: 170,
    },
    {
      width: 180,
      title: t('sys.operation'),
      dataIndex: 'actions',
      key: 'actions',
      fixed: 'right',
    },
  ];

  const queryTableData = () => {
    const params = {
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      name: searchVal.value.trim() || undefined,
    };

    isLoading.value = true;

    getLabelBtwPageList(params)
      .then((res) => {
        res?.data?.forEach((item: any) => {
          if (item?.fullPath) {
            const pathArr = item.fullPath?.split('/');
            pathArr.pop();
            pathArr.shift();
            item.tmplPath = pathArr;
          }
        });
        dataSource.value = res?.data || [];
        pagination.total = res?.totalCount || 0;
      })
      .finally(() => {
        isLoading.value = false;
      });
  };

  const handleSearchChange = (e: any) => {
    const val = e.target.value;

    if (!val || val.length < searchValCache.value.length) {
      queryTableData();
    }

    searchValCache.value = val;
  };

  const handleTableChange = (paginationInfo) => {
    const { current, pageSize } = paginationInfo;
    pagination.current = current;
    pagination.pageSize = pageSize;
    queryTableData();
  };

  const handleModalOpen = async (record?: any, type?: 'update' | 'copy') => {
    let data: any = undefined;
    if (record) {
      data = await getLabelGetVersionById({ id: record.id });
      data.printName = record.printName;
    }
    openModal(true, { type, data });
  };

  const handleDelete = async (record) => {
    await deleteLabelBtwRemoveVersionById({ id: record.id });
    message.success(t('sys.delSuccess'));
    queryTableData();
  };

  onMounted(() => {
    queryTableData();
  });

  defineExpose({
    refresh: queryTableData,
  });
</script>
<style lang="less" scoped>
  .tmpl-path {
    .tmpl-icon {
      width: 16px;
      height: 16px;
      vertical-align: text-bottom;
    }
  }

  .btw-label-tag {
    margin: 0 4px 0 5px;
    padding: 2px 6px;
    border-width: 1px;
    border-style: solid;
    border-radius: 4px;
    font-size: 12px;
  }

  .btw-label-tag.common {
    border-color: #c0dbff;
    background: #e8f5ff;
    color: #1990ff;
  }

  .btw-label-tag.local {
    border-color: #e4e9f2;
    background: #f5f7fa;
    color: #5e6b7f;
  }
</style>
