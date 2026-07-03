<template>
  <div :class="ns.b()">
    <a-form :model="formData">
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item :label="$t('sys.edhr.materialStatus.LOT')">
            <span>{{ formData.name_ }}</span>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item :label="$t('sys.quantity')">
            {{ formData.original_qty_ }}
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>

    <div v-show="!data?.isViewMode" class="flex justify-end mb-2">
      <a-button
        type="primary"
        class="ml-2"
        @click="handleSnImport"
        :aria-label="$t('sys.edhr.importSth', { sth: 'sn' })"
      >
        <template #icon> <DownloadOutlined /> </template>
        {{ $t('sys.import') }}
      </a-button>
    </div>
    <a-table
      size="small"
      :columns="computedTableColumns"
      :dataSource="tableData"
      :pagination="false"
    >
      <template #bodyCell="{ record, index, column }">
        <div v-if="column.dataIndex === 'index'">{{ index + 1 }}</div>
        <template v-if="column.dataIndex === 'action'">
          <a-button v-show="!data?.isViewMode" type="text" danger @click="onDelete(record, index)">
            {{ $t('sys.delete') }}
          </a-button>
        </template>
      </template>
    </a-table>
  </div>

  <div
    v-if="modal && !data?.isViewMode"
    class="absolute bottom-0px left-0px border-top w-full text-right"
    :class="ns.e('footer')"
  >
    <a-button style="margin-right: 8px" @click="onCancel">{{ $t('sys.cancelText') }}</a-button>
    <a-button type="primary" @click="onSubmit" :loading="confirmLoading">
      {{ $t('sys.okText') }}
    </a-button>
  </div>
</template>

<script lang="ts" setup>
  import { computed, nextTick, onMounted, ref, createVNode } from 'vue';
  import { message as Message, Modal } from 'ant-design-vue';
  import { isObject } from 'lodash-es';
  import { IModal, useNamespace } from '@gct/runtime';
  import SnUploadModal from './modal/sn-upload.vue';
  import {
    getBizServiceByModelKeyByBsKey,
    postBizServiceByModelKeyByBsKey,
  } from '/@/apis/gct-apaas/BsServiceController';

  // ==================== Props ====================
  const defProps = defineProps<{
    modal: IModal;
    data: any;
  }>();

  const ns = useNamespace('txn-split');

  const columns = [
    {
      title: $t('sys.index'),
      dataIndex: 'index',
      key: 'index',
      width: 60,
      align: 'center',
    },
    {
      title: $t('sys.edhr.importFileName'),
      dataIndex: 'fileName',
      key: 'fileName',
      ellipsis: true,
    },
    {
      title: $t('sys.quantity'),
      dataIndex: 'number',
      key: 'number',
      width: 120,
      ellipsis: true,
    },
    {
      title: $t('sys.edhr.importTime'),
      dataIndex: 'importTime',
      key: 'importTime    ',
      ellipsis: true,
    },
    {
      title: $t('sys.operation'),
      dataIndex: 'action',
      key: 'action',
      ellipsis: true,
    },
  ];
  const computedTableColumns = computed(() => {
    if (defProps.data.isViewMode) {
      return columns.filter((item) => item.key !== 'action');
    }
    return columns;
  });

  const confirmLoading = ref(false);
  const formData = ref<any>({});

  const dataSource = ref<any[]>([]);
  const tableData = computed(() => {
    return dataSource.value?.filter((d) => !d.deleted_) || [];
  });

  async function handleSnImport() {
    const res = await gct.openUtil.modal<any>(
      SnUploadModal,
      {
        data: {
          splitType: 'sn',
          bindModelKey: 'em_sn',
          templateKey: 'import_sn_mryi',
          actionUrl: 'gct-apaas/api/edhr/upload/excel',
        },
      },
      {
        title: $t('sys.edhr.importSth', { sth: 'SN' }),
        width: 600,
        showFooter: false,
      },
    );
    if (res && res.ok) {
      const { data } = res;
      if (data && isObject(data)) {
        const { fileName, number, importTime } = data as any;
        dataSource.value.push({
          fileName,
          number,
          importTime,
          ...data,
        });
      }
    }
  }

  async function onSubmit() {
    try {
      confirmLoading.value = true;
      const res = await postBizServiceByModelKeyByBsKey(
        {
          bsKey: 'biz_container_sn_split',
          modelKey: 'em_sn_split',
        },
        {
          txnInstId: defProps.data.id_,
          mfgOrderId: defProps.data.mfg_order_id_,
          containerId: defProps.data.container_id_,
          number: (tableData.value ?? []).reduce((acc, cur) => acc + cur.number, 0),
          fileList: tableData.value,
        },
      );
      Message.success($t('sys.operationSuccess'));
      defProps.modal.dismiss({ ok: true, data: res } as any);
    } catch (error) {
      console.log(error);
    }
    confirmLoading.value = false;
  }

  function onCancel() {
    defProps.modal.dismiss();
  }

  async function onDelete(rowData, idx) {
    await new Promise((resolve, reject) => {
      Modal.confirm({
        title: createVNode('span', { style: 'color:#797a7d;' }, $t('sys.confirmExecution')),
        onOk: () => {
          resolve(true);
        },
        onCancel: () => {
          reject(false);
        },
      });
    });
    if (rowData.id_) {
      rowData.deleted_ = true;
    } else {
      dataSource.value?.splice(idx, 1);
    }
  }

  async function loadSplitRecord() {
    const res = await postBizServiceByModelKeyByBsKey(
      { bsKey: 'listAll', modelKey: 'em_sn_split' },
      {
        query: {
          container_id_: defProps.data.container_id_,
        },
      },
    );
    dataSource.value = (res?.data ?? [])?.map((it) => {
      return {
        ...it,
        id: it.id_,
        fileName: it.import_file_name_,
        number: it.qty_,
        importTime: it.import_date_,
      };
    });
  }

  onMounted(async () => {
    await nextTick();
    const { container_id_: id } = defProps.data;
    if (!id) return;
    const { data }: any =
      (await getBizServiceByModelKeyByBsKey(
        {
          bsKey: 'getById',
          modelKey: 'em_container',
        },
        {
          id,
        } as any,
      )) ?? {};
    formData.value = {
      ...data,
      container_id_: id,
    };
    if (defProps.data.isViewMode) {
      loadSplitRecord();
    }
  });
</script>
<style lang="scss">
  .txn-split-drawer {
    .ant-drawer-body {
      padding: 0;
      & > .scroll-container {
        padding: 24px;
        overflow-x: hidden;

        .scrollbar__bar.is-horizontal {
          display: none;
        }
      }
    }
  }
  @include b(txn-split) {
    @include e(title) {
      position: relative;
      padding: 12px 0;

      &::before {
        background-color: var(--ant-primary-color);
        width: 12px;
        height: 12px;
        position: absolute;
        top: 50%;
        left: 50%;
      }
    }

    @include e(footer) {
      display: flex;
      align-items: center;
      justify-content: end;
      min-height: 60px;
      padding: 0 16px 6px;
      background-color: #ffffff;
      box-shadow: 0 -2px 10px 0 rgba(0, 0, 0, 0.06);
      z-index: 999;
    }
  }
</style>
