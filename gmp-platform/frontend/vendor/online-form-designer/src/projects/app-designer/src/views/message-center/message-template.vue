<template>
  <basic-page>
    <div class="message-template-container">
      <a-form ref="formRef" :model="formState" autocomplete="off">
        <a-row :gutter="24">
          <a-col :span="8">
            <a-form-item name="key" :label="t('sys.message.templateKey')">
              <a-input v-model:value="formState.key" :placeholder="t('sys.inputText')" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item name="name" :label="t('sys.message.templateName')">
              <a-input v-model:value="formState.name" :placeholder="t('sys.inputText')" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item name="modelName" :label="t('sys.message.relationModal')">
              <a-input v-model:value="formState.modelName" :placeholder="t('sys.inputText')" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="8">
            <a-form-item name="opened" :label="t('sys.message.isOpen')">
              <a-select
                v-model:value="formState.opened"
                :placeholder="t('sys.chooseText')"
                allowClear
              >
                <a-select-option :value="1">{{ t('sys.message.open') }}</a-select-option>
                <a-select-option :value="0">{{ t('sys.message.notOpen') }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8" :offset="8" style="text-align: right">
            <a-button @click="() => formRef?.resetFields()">
              <template #icon>
                <undo-outlined />
              </template>
              {{ t('sys.reset') }}
            </a-button>
            <a-button style="margin: 0 8px" type="primary" @click="handleSearch">
              <template #icon>
                <search-outlined />
              </template>
              {{ t('sys.queryText') }}
            </a-button>
          </a-col>
        </a-row>
      </a-form>
      <div class="table-wrap">
        <BasicTable
          :dataSource="tableData"
          :columns="columns"
          :showIndexColumn="false"
          :pagination="pagination"
          :striped="false"
          :bordered="true"
          @change="handleTableChange"
        >
          <template #headerTop>
            <a-button class="mr-16px" type="primary" @click="handleAdd">
              <template #icon>
                <plus-outlined />
              </template>
              {{ t('sys.new') }}
            </a-button>
          </template>
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.key === 'opened'">
              <div :class="{ 'record-tag': true, 'record-tag-open': record.opened }">
                {{ record.opened ? t('sys.message.open') : t('sys.message.notOpen') }}
              </div>
            </template>
            <template v-if="column.key === 'index'">
              <div>{{ getPageIndex(index) }}</div>
            </template>
            <template v-if="column.key === 'pushType'">
              <div>{{ getPushTypeList(record.pushType) }}</div>
            </template>
            <template v-if="column.key === 'custom'">
              <div>{{ record.custom ? t('sys.customize') : t('sys.model') }}</div>
            </template>
            <template v-if="column.key === 'action'">
              <table-action-auto
                :actions="[
                  {
                    label: !record.opened ? t('sys.edit') : t('sys.view'),
                    color: 'success',
                    onClick: clickRow.bind(null, record, !record.opened),
                  },
                  {
                    label: t('sys.delete'),
                    color: 'text',
                    popConfirm: {
                      title: t('sys.sureToDelete'),
                      confirm: handleRowDelete.bind(null, record),
                    },
                  },
                  {
                    label: t('sys.message.openTemplate'),
                    ifShow: !record.opened,
                    onClick: onPublic.bind(null, record),
                    // popConfirm: {
                    //   title: h('div', { class: 'gct-open-confirm' }, [
                    //     h('h1', t('sys.message.openTips')),
                    //     h('p', t('sys.message.openDescription')),
                    //   ]),
                    //   confirm: () => handleChangeStatus(record),
                    // },
                  },
                ]"
                :stopButtonPropagation="true"
              />
            </template>
          </template>
        </BasicTable>
      </div>
    </div>
    <template-modal @register="templateRegister" @ok="handleModalOk" />
  </basic-page>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, createVNode, h } from 'vue';
  import type { FormInstance } from 'ant-design-vue';
  import { SearchOutlined, UndoOutlined, PlusOutlined } from '@ant-design/icons-vue';
  import { useModal } from '/@/components/Modal';
  import { useI18n } from 'vue-i18n';
  import { BasicTable, TableActionAuto } from '/@/components/Table';
  import {
    getMessageTmplPageList,
    postMessageTmpl,
    putMessageTmplById,
    deleteMessageTmpl,
    putMessageTmplOpened,
  } from '/@/apis/gct-apaas/MessageTmplController';
  import templateModal from './modal/template-modal.vue';
  import { pushTypeObj } from './constant/enum';
  import { Modal, message } from 'ant-design-vue';

  type ColumType = {
    title: string;
    dataIndex: string;
  };

  const { t } = useI18n();
  const [templateRegister, { openModal }] = useModal();

  //搜索过滤部分
  const formRef = ref<FormInstance>();
  const formState = reactive({
    key: null,
    name: null,
    modelName: null,
    opened: null,
  });
  // 分页
  const pagination = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const loading = ref<boolean>(false);

  const tableData = ref([]);

  const columns: ColumType[] = [
    {
      title: t('sys.pageDesigner.index'),
      dataIndex: 'index',
      width: 72,
      fixed: 'left',
    },
    {
      title: t('sys.message.templateName'),
      dataIndex: 'name',
      fixed: 'left',
    },
    {
      title: t('sys.message.templateKey'),
      dataIndex: 'key',
    },
    {
      title: t('sys.integration.dataSource'),
      dataIndex: 'custom',
    },
    {
      title: t('sys.message.relationModal'),
      dataIndex: 'modelName',
    },
    {
      title: t('sys.message.pushType'),
      dataIndex: 'pushType',
    },
    {
      title: t('sys.message.isOpen'),
      dataIndex: 'opened',
    },
    {
      title: t('sys.creator'),
      dataIndex: 'createUserName',
    },
    {
      title: t('sys.createTime'),
      dataIndex: 'createTime',
      minWidth: 170,
      width: 170,
    },
    {
      title: t('sys.modifier'),
      dataIndex: 'modifyUserName',
    },
    {
      title: t('sys.modifyTime'),
      dataIndex: 'modifyTime',
      minWidth: 170,
      width: 170,
    },
    {
      title: t('sys.operation'),
      dataIndex: 'action',
      fixed: 'right',
      align: 'left',
      width: 200,
    },
  ];

  const getTableData = async (params?, current?) => {
    loading.value = true;
    const result = await getMessageTmplPageList({
      pageNo: current ?? pagination.current,
      pageSize: pagination.pageSize,
      ...params,
    });
    loading.value = false;

    pagination.total = result?.totalCount ?? 0;

    if (result && result.data) {
      tableData.value = result.data;
    }
  };

  onMounted(getTableData);

  const getPageIndex = (index) => {
    const { current, pageSize } = pagination;
    return pageSize * (current - 1) + index + 1;
  };

  const getPushTypeList = (val) => {
    let arr = val?.split(',') || [];
    arr = arr.map((item) => {
      return pushTypeObj[item];
    });
    return arr.join(' / ');
  };

  const handleSearch = () => {
    formRef.value?.validate().then(async () => {
      // 发送网络请求获取数据
      await getTableData(formState, 1);
    });
  };

  const handleAdd = () => {
    openModal(true, {});
  };

  const handleTableChange = (paginationInfo) => {
    const { current, total, pageSize } = paginationInfo;
    pagination.current = current;
    pagination.total = total;
    pagination.pageSize = pageSize;
    getTableData(formState);
  };

  const handleRowDelete = async (record) => {
    loading.value = true;
    await deleteMessageTmpl({ ids: record.id });
    message.success(t('sys.delSuccess'));
    getTableData();
  };

  const handleChangeStatus = async (record) => {
    loading.value = true;
    await putMessageTmplOpened({ key: record.key, opened: 1 });
    message.success(t('sys.operationSuccess'));
    getTableData();
  };

  const clickRow = async (record, isEdit) => {
    // 请求接口获取当前多语言的数据
    const data = record;
    openModal(true, { info: data, isEdit });
  };

  const handleModalOk = async (data, isEdit, closeModal) => {
    if (isEdit) {
      await putMessageTmplById({ id: data.key }, data);
      message.success(t('sys.developer.appCenter.editSuccess'));
    } else {
      await postMessageTmpl(data);
      message.success(t('sys.createSuccess'));
    }
    getTableData();
    closeModal();
  };

  const onPublic = (record) => {
    Modal.confirm({
      title: () => t('sys.message.openTips'),
      content: () => t('sys.message.openDescription'),
      centered: true,
      icon: () =>
        createVNode(
          'span',
          {
            class: 'anticon anticon-exclamation-circle',
          },
          [
            createVNode('i', {
              class: 'iconfont icon-jinggao1',
              style: { position: 'relative', top: '3px', color: '#FF8C4B' },
            }),
          ],
        ),
      onOk() {
        handleChangeStatus(record);
      },
    });
  };
</script>

<style lang="less" scoped>
  .message-template-container {
    padding: 16px;
    .record-tag {
      background: #e8ebf0;
      border-radius: 4px;
      padding: 0 6px;
      font-weight: 400;
      font-size: 14px;
      color: #c3c3c3;
      display: inline-block;

      &-open {
        background: #def8e2;
        color: #309c41;
      }
    }
  }
</style>
<style lang="less">
  .gct-open-confirm {
    width: 240px;
    p {
      font-weight: 400;
      font-size: 14px;
      color: #797a7d;
      line-height: 22px;
      text-align: left;
      font-style: normal;
      text-transform: none;
      margin: 0;
    }
  }
</style>
