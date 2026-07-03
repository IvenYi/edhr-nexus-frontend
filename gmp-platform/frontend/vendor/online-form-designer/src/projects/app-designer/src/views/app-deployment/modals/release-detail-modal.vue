<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="t('发行详情')"
    centered
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    :footer="null"
  >
    <a-form ref="formRef" :model="formState" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
      <a-form-item label="提交标识"> {{ formState.tag }} </a-form-item>
      <a-form-item label="发行内容">
        {{ formState.description }}
      </a-form-item>
    </a-form>
  </basic-modal>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { getCommitLogReleaseInfo } from '/@/apis/gct-apaas/CommitLogController';
  import type { CommitLogResponse } from '/@/apis/gct-apaas/model';

  const { t } = useI18n();
  const [registerInner] = useModalInner((data: { releaseTag: string }) => {
    if (!data) return;

    getCommitLogReleaseInfo({
      releaseTag: data.releaseTag,
    }).then((res) => {
      formState.value = res ?? {};
    });
  });

  const formState = ref<CommitLogResponse>({});

  const handleClose = () => {
    formState.value = {};
  };
</script>

<style lang="less"></style>
