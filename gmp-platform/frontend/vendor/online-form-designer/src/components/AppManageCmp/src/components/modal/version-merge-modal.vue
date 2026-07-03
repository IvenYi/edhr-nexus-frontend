<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="isImport ? t('sys.app.branch.merge') : t('sys.app.version.merge')"
    centered
    width="800px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-form class="merge-form" ref="formRef" :model="formState">
      <div class="merge-form__branches">
        <a-form-item
          :label="isImport ? t('sys.app.sourceBranch') : t('sys.app.sourceVersion')"
          name="sourceBranchId"
          :rules="[
            {
              required: true,
              trigger: 'change',
            },
          ]"
        >
          <a-select class="important-w-160px" v-model:value="formState.sourceBranchId" allow-clear>
            <a-select-option v-for="b in sourceBarnches" :key="b.id" :value="b.id">
              {{ b._display_text_ }}</a-select-option
            >
          </a-select>
        </a-form-item>

        <merge-arrow />

        <a-form-item
          :label="isImport ? t('sys.app.targetBranch') : t('sys.app.targetVersion')"
          name="targetBranchId"
          :rules="[
            {
              required: true,
              trigger: 'change',
            },
          ]"
        >
          <a-select class="important-w-160px" v-model:value="formState.targetBranchId" allow-clear>
            <a-select-option v-for="b in targetBranches" :key="b.id" :value="b.id">
              {{ b._display_text_ }}</a-select-option
            >
          </a-select>
        </a-form-item>
      </div>

      <a-form-item
        :label="t('sys.notes')"
        name="description"
        :rules="[
          {
            required: true,
            whitespace: true,
          },
        ]"
      >
        <a-textarea v-model:value="formState.description" :rows="5" show-count :maxlength="120" />
      </a-form-item>
    </a-form>

    <merge-tab :loading="loading" :merge-preview-data="mergePreviewData" resolve />
  </basic-modal>
</template>

<script setup lang="ts">
  import { reactive, ref, computed, watch, inject, ComputedRef } from 'vue';
  import { FormInstance, message } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import {
    getAppMergePreviewByAppId,
    postAppMergeByAppId,
  } from '/@/apis/gct-platform/AppController';
  import type {
    MergeRequest,
    AppBranchResponse,
    MergePreviewResponse,
  } from '/@/apis/gct-platform/model';
  import MergeTab from '../common/merge-tab.vue';
  import MergeArrow from '../common/merge-arrow.vue';

  const props = defineProps<{
    branches: AppBranchResponse[];
  }>();

  const isImport: ComputedRef<boolean> | undefined = inject('isImport');

  const { t } = useI18n();
  const [registerInner, { closeModal, changeOkLoading }] = useModalInner((data) => {
    if (!data) return;
    Object.assign(formState, {
      ...data,
    });
  });

  const formRef = ref<FormInstance>();
  const formState: MergeRequest = reactive({
    appId: undefined,
    sourceBranchId: undefined,
    targetBranchId: undefined,
    description: undefined,
  });
  const mergePreviewData = ref<MergePreviewResponse>({});
  const loading = ref<boolean>(false);

  /**
   * 带排序号的分支列表
   */
  const branchesWithSortNum = computed(() => {
    return props.branches.map((b) => {
      return {
        ...b,
        _display_text_: isImport?.value ? b.seq : b.appVersion,
        _sort_num_: isImport?.value
          ? b.seq
          : b.appVersion
              ?.split('.')
              .map((v) => v.padStart(3, '0'))
              .join(''),
      };
    });
  });

  // todo 源版本必须带release

  const sourceBarnch = computed(() => {
    if (!formState.sourceBranchId) return {};
    return branchesWithSortNum.value.find((b) => b.id === formState.sourceBranchId);
  });
  const targetBranch = computed(() => {
    if (!formState.targetBranchId) return {};
    return branchesWithSortNum.value.find((b) => b.id === formState.targetBranchId);
  });

  /**
   * 源版本
   * 1.小于目标版本
   * 2.带release
   */
  const sourceBarnches = computed(() => {
    if (!formState.targetBranchId) return branchesWithSortNum.value.filter((b) => b.releaseTag);
    return branchesWithSortNum.value.filter(
      // @ts-ignore
      (b) => b._sort_num_ < targetBranch.value._sort_num_ && b.releaseTag,
    );
  });

  /**
   * 目标版本
   * 1.大于目标版本
   * 2.不能是草稿（后端判断）
   */
  const targetBranches = computed(() => {
    if (!formState.sourceBranchId) return branchesWithSortNum.value;
    return branchesWithSortNum.value.filter(
      // @ts-ignore
      (b) => b._sort_num_ > sourceBarnch.value._sort_num_,
    );
  });

  // 监听源分支、目录分支变化
  watch([() => formState.sourceBranchId, () => formState.targetBranchId], async ([sid, tid]) => {
    if (sid && tid) {
      loading.value = true;
      const res = await getAppMergePreviewByAppId(
        {
          appId: formState.appId!,
        },
        {
          sourceBranchId: formState.sourceBranchId!,
          targetBranchId: formState.targetBranchId!,
        },
      ).finally(() => {
        loading.value = false;
      });
      console.log(res);
      if (formState.sourceBranchId === sid && formState.targetBranchId === tid) {
        // 仅当数据一致的时候更新预览数据
        mergePreviewData.value = res ?? {};
      }
    } else {
      mergePreviewData.value = {};
    }
  });

  const handleClose = () => {
    formRef.value?.resetFields();
  };

  const handleOk = async () => {
    changeOkLoading(true);
    try {
      await formRef.value?.validate();
      if (mergePreviewData.value.conflictDetails?.find((item) => !item.choice)) {
        message.error(t('sys.app.mergeErrorWidthUnresolved'));
        return;
      }
      await postAppMergeByAppId(
        {
          appId: formState.appId!,
        },
        {
          ...formState,
          mergeConflictList: mergePreviewData.value.conflictDetails,
        },
      );
      // emit('ok');
      message.success(t('sys.operationSuccess'));
      closeModal();
    } catch (err) {
      console.warn(err);
    } finally {
      changeOkLoading(false);
    }
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
