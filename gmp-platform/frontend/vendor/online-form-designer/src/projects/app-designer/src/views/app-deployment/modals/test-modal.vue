<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="t('发布验证')"
    centered
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-form ref="formRef" :model="formState" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
      <a-form-item label="提交标识">
        {{ commitTag }}
      </a-form-item>
      <a-form-item
        label="发布内容"
        name="description"
        :rules="[
          {
            required: true,
            whitespace: true,
          },
        ]"
      >
        <a-textarea v-model:value="formState.description" :rows="3" show-count :maxlength="120" />
      </a-form-item>
    </a-form>
  </basic-modal>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue';
  import { FormInstance, message } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { getCommitLogGetLatestCommit } from '/@/apis/gct-apaas/CommitLogController';
  import { postPublishLogPublishToTest } from '/@/apis/gct-apaas/PublishLogController';

  const emit = defineEmits(['ok']);

  const { t } = useI18n();
  const [registerInner, { closeModal, changeOkLoading }] = useModalInner((data) => {
    if (!data) return;
    Object.assign(formState, {
      ...data,
    });
    getCommitLogGetLatestCommit().then((res) => {
      commitTag.value = res?.tag ?? '';
    });
  });

  const formRef = ref<FormInstance>();
  const formState: { description?: string } = reactive({
    description: undefined,
  });
  const commitTag = ref<string>('');

  const handleClose = () => {
    formRef.value?.resetFields();
  };

  const handleOk = async () => {
    changeOkLoading(true);
    try {
      await formRef.value?.validate();
      await postPublishLogPublishToTest(
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
