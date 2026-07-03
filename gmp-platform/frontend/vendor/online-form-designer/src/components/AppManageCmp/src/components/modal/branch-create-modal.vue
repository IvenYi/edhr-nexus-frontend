<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="t('sys.app.branch.create')"
    centered
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-form ref="formRef" :model="formState" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
      <a-form-item label="基线分支">
        {{ sourceBranch.seq }}
      </a-form-item>
      <a-form-item :label="t('sys.app.releaseTag')"> {{ sourceBranch.releaseTag }} </a-form-item>
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
  </basic-modal>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue';
  import { FormInstance, message } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { postAppCreateBranchByAppId } from '/@/apis/gct-platform/AppController';
  import type { CreateBranchRequest, AppBranchResponse } from '/@/apis/gct-platform/model';

  const props = defineProps<{
    sourceBranch: AppBranchResponse;
  }>();

  const emit = defineEmits(['ok']);

  const { t } = useI18n();
  const [registerInner, { closeModal, changeOkLoading }] = useModalInner((data) => {
    if (!data) return;
    Object.assign(formState, {
      ...data,
    });
  });

  const formRef = ref<FormInstance>();
  const formState: CreateBranchRequest = reactive({
    appId: undefined,
    description: undefined,
  });

  const handleClose = () => {
    formRef.value?.resetFields();
  };

  const handleOk = async () => {
    changeOkLoading(true);
    try {
      await formRef.value?.validate();
      if (!props.sourceBranch.releaseTag) {
        message.error(t('sys.app.branchWithoutReleaseTageCanNotCreateBranch'));
        return;
      }
      await postAppCreateBranchByAppId(
        {
          appId: formState.appId!,
        },
        {
          description: formState.description,
        },
      );
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
