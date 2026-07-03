<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="t('合并详情')"
    centered
    width="800px"
    :maskClosable="false"
    :afterClose="handleClose"
    :footer="null"
  >
    <a-form class="merge-form" ref="formRef" :model="formState">
      <div class="merge-form__branches">
        <a-form-item
          :label="isImport ? t('sys.app.branch.source') : t('sys.app.version.source')"
          name="sourceBranchId"
        >
          {{ isImport ? formState.sourceBranchSeq : formState.sourceAppVersion }}
        </a-form-item>

        <merge-arrow />

        <a-form-item
          :label="isImport ? t('sys.app.branch.target') : t('sys.app.version.target')"
          name="targetBranchId"
        >
          {{ isImport ? formState.targetBranchSeq : formState.targetAppVersion }}
        </a-form-item>
      </div>

      <a-form-item :label="t('sys.notes')" name="description">
        {{ formState.description }}
      </a-form-item>
    </a-form>

    <merge-tab :loading="loading" :merge-preview-data="formState" />
  </basic-modal>
</template>

<script setup lang="ts">
  import { ref, inject, ComputedRef } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { getAppMergeInfoByAppId } from '/@/apis/gct-platform/AppController';
  import type { MergeLogResponse } from '/@/apis/gct-platform/model';
  import MergeTab from '../common/merge-tab.vue';
  import MergeArrow from '../common/merge-arrow.vue';

  const isImport: ComputedRef<boolean> | undefined = inject('isImport');

  const { t } = useI18n();
  const [registerInner] = useModalInner((data) => {
    if (!data) return;

    const { appId, id } = data;
    getAppMergeInfoByAppId(
      {
        appId,
      },
      { id },
    ).then((res) => {
      formState.value = res ?? {};
    });
  });

  const formState = ref<MergeLogResponse>({});
  const loading = ref<boolean>(false);

  const handleClose = () => {
    formState.value = {};
  };
</script>

<style lang="less">
  .ant-modal .ant-modal-body .scrollbar:has(.merge-form) {
    padding: 0;
  }
</style>
<style lang="less" scoped>
  .merge-form {
    padding: 20px 100px 0 40px;
    :deep(.ant-form-item-label) {
      width: 120px;
    }
    :deep(.ant-form-item-label:has([for='form_item_targetBranchId'])) {
      width: auto;
    }

    &__branches {
      display: flex;
      justify-content: space-between;
    }
  }
</style>
