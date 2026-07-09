<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="300"
    :title="t('查看失败原因')"
    centered
    width="640px"
    :maskClosable="false"
    :showOkBtn="false"
    :cancelText="t('sys.closeText')"
  >
    <div class="flex fail-area">
      <ExclamationCircleFilled style="color: #f54547; font-size: 32px" />
      <div class="mt-16px">【{{reason?.id}}】迁移失败</div>
      <div class="mt-32px w520px">
        <div class="flex error mb-16px">
          <span>{{ t('报错详情') }}</span>
          <a @click="copy">{{ t('复制详情') }}</a>
        </div>
        <a-alert :message="reason?.reason" type="error" class="mt-16px" />
      </div>
    </div>
  </basic-modal>
</template>
<script setup lang="ts">
  import { ref, unref } from 'vue';
  import { getDatasourceMoveDataList } from '/@/apis/gct-platform/DatasourceMoveDataController';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { DatasourceMoveDataResponse } from '/@/apis/gct-platform/model';
  import { useCopyToClipboard } from '/@/hooks/web/useCopyToClipboard';
  import { useMessage } from '/@/hooks/web/useMessage';

  const { t } = useI18n();

  const id = ref();

  const reason = ref<DatasourceMoveDataResponse>();

  const { createMessage } = useMessage();


  const [registerInner, { closeModal }] = useModalInner(async (data) => {
    if (!data) return;
    id.value = data.id;
    getDatasourceMoveDataList({ id: data.id }).then((res) => {
      reason.value = res ? res[0] : {};
    });
  });

  const copy = () => {
    const { isSuccessRef } = useCopyToClipboard(reason.reason);
    unref(isSuccessRef) && createMessage.success(t('sys.pageDesigner.copySuccess'));
  };
  
</script>
<style lang="less" scoped>
  .fail-area {
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-top: 60px;
  }
  .error {
    justify-content: space-between;
  }
  :deep(.ant-alert-error) {
    border-color: #f54547 !important;
  }
</style>
