<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="t('发布生产')"
    centered
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-form ref="formRef" :model="formState" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
      <a-form-item
        :label="t('sys.app.releaseTag')"
        name="releaseTag"
        :rules="[
          {
            required: true,
          },
        ]"
      >
        <a-select v-model:value="formState.releaseTag">
          <a-select-option v-for="tag in releaseTags" :key="tag" :value="tag" />
        </a-select>
      </a-form-item>
      <a-form-item
        :label="t('sys.app.publishContent')"
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
  import { getCommitLogCanPublishProdReleaseTagList } from '/@/apis/gct-apaas/CommitLogController';
  import { postPublishLogPublishToProd } from '/@/apis/gct-apaas/PublishLogController';
  import type { PublishToProdRequest } from '/@/apis/gct-apaas/model';

  const emit = defineEmits(['ok']);

  const { t } = useI18n();
  const [registerInner, { closeModal, changeOkLoading }] = useModalInner((data) => {
    if (!data) return;

    getCommitLogCanPublishProdReleaseTagList().then((res) => {
      const data = res ?? [];
      releaseTags.value = data;
      if (data[0]) {
        formState.releaseTag = data[0];
      }
    });

    Object.assign(formState, {
      ...data,
    });
  });

  const formRef = ref<FormInstance>();
  const formState: PublishToProdRequest = reactive({
    releaseTag: undefined,
    description: undefined,
  });
  const releaseTags = ref<string[]>([]);

  const handleClose = () => {
    formRef.value?.resetFields();
  };

  const handleOk = async () => {
    changeOkLoading(true);
    try {
      await formRef.value?.validate();
      await postPublishLogPublishToProd(
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
