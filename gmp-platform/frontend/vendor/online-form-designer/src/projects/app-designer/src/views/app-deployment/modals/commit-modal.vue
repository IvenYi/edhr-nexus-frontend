<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="t('应用提交')"
    centered
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-form ref="formRef" :model="formState" layout="vertical">
      <a-form-item
        label="提交内容"
        name="description"
        :rules="[
          {
            required: true,
            message: t('sys.pleaseInputSth', { sth: t('提交内容') }),
            whitespace: true,
          },
        ]"
      >
        <a-textarea
          v-model:value="formState.description"
          :rows="3"
          show-count
          :maxlength="120"
          :placeholder="t('sys.pleaseInputSth', { sth: t('提交内容') })"
        />
      </a-form-item>
      <a-form-item label="">
        <a-table
          row-key="id"
          :columns="columns"
          :data-source="tableData"
          bordered
          :pagination="false"
          :loading="loading"
          size="middle"
          :scroll="{
            y: '40vh',
          }"
        />
      </a-form-item>
    </a-form>
  </basic-modal>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue';
  import { FormInstance, message } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { TableColumnsType } from 'ant-design-vue';
  import {
    getCommitLogViewDraft,
    postCommitLogCommit,
  } from '/@/apis/gct-apaas/CommitLogController';
  import type { ReadableCommitDetailDTO } from '/@/apis/gct-apaas/model';
  import { useAppDraftState } from '/@/components/AppDraftState/useAppDraftState';

  const emit = defineEmits(['ok']);

  const { t } = useI18n();
  const { getDraft } = useAppDraftState();
  const [registerInner, { closeModal, changeOkLoading }] = useModalInner((data) => {
    if (!data) return;
    Object.assign(formState, {
      ...data,
    });
    getTableData();
  });

  const formRef = ref<FormInstance>();
  const formState: { description?: string } = reactive({
    description: undefined,
  });

  const loading = ref<boolean>(false);
  const tableData = ref<ReadableCommitDetailDTO[]>([]);

  const columns: TableColumnsType = [
    {
      title: t('sys.operation'),
      dataIndex: 'opeDesc',
      key: 'opeDesc',
    },
    {
      title: t('操作人'),
      dataIndex: 'operator',
      key: 'operator',
      ellipsis: true,
      width: 120,
    },
    {
      title: t('操作时间'),
      dataIndex: 'opeTime',
      key: 'opeTime',
      width: 170,
    },
  ];

  const getTableData = async () => {
    const res = await getCommitLogViewDraft();
    tableData.value = res ?? [];
  };

  const handleClose = () => {
    formRef.value?.resetFields();
    tableData.value = [];
  };

  const handleOk = async () => {
    changeOkLoading(true);
    try {
      await formRef.value?.validate();
      await postCommitLogCommit(
        {
          ...formState,
          description: formState.description?.trim() ?? '',
        },
        {
          transferToConfig: {
            timeout: 5 * 60 * 1000,
          },
        },
      );
      // commit后更新草稿状态
      getDraft();
      emit('ok');
      message.success(t('sys.operationSuccess'));
      closeModal();
    } catch (err) {
      console.warn(err);
    } finally {
      changeOkLoading(false);
    }
  };
</script>

<style lang="less"></style>
