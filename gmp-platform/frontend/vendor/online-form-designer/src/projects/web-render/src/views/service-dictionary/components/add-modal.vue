<template>
  <div class="p16px ks-column">
    <a-form ref="formRef" :model="form">
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="业务字典名称" required name="name">
            <a-input
              v-model:value="form.name"
              type="text"
              :disabled="isSystem"
              allowClear
              maxlength="64"
              placeholder="请输入业务字典名称"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="业务字典编码" required name="code">
            <a-input
              v-model:value="form.code"
              :disabled="isSystem"
              type="text"
              allowClear
              maxlength="64"
              placeholder="请输入业务字典编码"
            />
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="描述">
            <a-textarea
              :disabled="isSystem"
              v-model:value="form.description"
              show-count
              :maxlength="120"
              placeholder="请输入描述"
            />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>

    <div class="title">字典项列表</div>
    <div class="text-right mb16px">
      <a-button type="primary" size="small" ghost @click="onAdd()">+ {{ $t('sys.add') }}</a-button>
    </div>
    <a-table
      ref="tableContainerRef"
      class="h-full flex-1 h-100px"
      row-key="id"
      :columns="columns"
      :data-source="tableData"
      :pagination="false"
      :loading="loading"
      size="middle"
    >
      <template #bodyCell="{ column, index, record }">
        <template v-if="column.key === 'actions'">
          <table-action-auto
            :actions="[
              {
                ifShow: record.source !== 'BUILTIN',
                label: $t('sys.edit'),
                onClick: () => onAdd(record, index),
              },
              {
                ifShow: record.source !== 'BUILTIN',
                label: $t('sys.delete'),
                color: 'error',
                popConfirm: {
                  title: $t('sys.sureToDo'),
                  confirm: () => onDelete(index),
                },
              },
            ]"
            :stopButtonPropagation="true"
          />
        </template>
      </template>
    </a-table>
    <!-- <div class="absolute bottom-0px left-0px p16px text-right w-full footer">
      <a-button @click="modal.dismiss()">{{ $t('sys.cancel') }}</a-button>
      <a-button type="primary" class="ml16px" @click="onSave">{{ $t('sys.okText') }}</a-button>
    </div> -->
  </div>
</template>
<script setup lang="ts">
  import { onMounted, ref, toRaw } from 'vue';
  import { TableActionAuto } from '/@/components/Table';
  import addItemModal from './add-item-modal.vue';
  import { IModal, useModal } from '@gct/runtime';
  import { getEnumModelFieldPageList } from '/@/apis/gct-apaas/EnumModelFieldController';
  import {
    EnumModelFieldResponse,
    EnumModelResponse,
  } from '../../../../../../apis/gct-apaas/model';
  import { postEnumModelSubmitWithFields } from '/@/apis/gct-apaas/EnumModelController';
  import { message } from 'ant-design-vue';

  const props = defineProps<{
    modal: IModal;
    data?: EnumModelResponse;
    isSystem?: boolean;
  }>();

  const formRef = ref();
  const form = ref({});
  const tableData = ref<Array<EnumModelFieldResponse>>([]);
  const loading = ref(false);

  const columns = [
    {
      title: '字典项目名称',
      dataIndex: 'text',
      key: 'text',
      ellipsis: true,
    },
    {
      title: '字典项目编码',
      dataIndex: 'value',
      key: 'value',
      ellipsis: true,
    },
    {
      title: $t('sys.operation'),
      dataIndex: 'actions',
      key: 'actions',
      align: 'left',
      fixed: 'right',
      width: 100,
    },
  ];

  onMounted(() => {
    if (!props.data) {
      return;
    }
    form.value = {
      ...props.data,
    };
    props.data?.id && getItemData();
  });

  const onAdd = async (record?, index?) => {
    const res: { ok: boolean; params: any } = await gct.openUtil.modal(
      addItemModal,
      {
        data: record ? toRaw(record) : {},
      },
      {
        title: record ? '编辑字典项' : '新建字典项',
        width: 640,
        okText: $t('sys.okText'),
      },
    );
    if (res.ok) {
      if (index == undefined) {
        tableData.value.unshift({ ...res.params });
      } else {
        tableData.value.splice(index, 1, { ...res.params });
      }
    }
  };

  const onSave = async () => {
    await formRef.value.validate();
    await postEnumModelSubmitWithFields({
      ...form.value,
      fields: tableData.value,
    });
    props.modal.dismiss({ ok: true });
  };

  const onDelete = (index) => {
    tableData.value.splice(index, 1);
  };

  async function getItemData() {
    const res = await getEnumModelFieldPageList({
      enumModelId: props.data?.id,
      enumModelKey: props.data?.key,
      pageNo: 1,
      pageSize: 9999,
    });
    tableData.value = res?.data || [];
  }

  useModal(onSave);
</script>
<style lang="less" scoped>
  :deep(.ant-form .ant-form-item) {
    margin-bottom: 16px;
  }
  .title {
    color: #000;
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 16px;

    &::before {
      content: '';
      display: inline-block;
      width: 3px;
      height: 14px;
      background-color: var(--van-primary-color);
      border-radius: 10px;
      margin-right: 8px;
      vertical-align: -2px;
    }
  }
  .footer {
    border-top: 1px solid #ecedf1;
  }
</style>
