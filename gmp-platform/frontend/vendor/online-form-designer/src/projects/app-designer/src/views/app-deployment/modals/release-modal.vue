<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="t('创建发行')"
    centered
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-form ref="formRef" :model="formState" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
      <a-form-item
        :label="t('sys.app.commitTag')"
        name="commitTag"
        :rules="[
          {
            required: true,
          },
        ]"
      >
        <a-select v-model:value="formState.commitTag">
          <a-select-option v-for="tag in commitTags" :key="tag" :value="tag" />
        </a-select>
      </a-form-item>
      <a-form-item
        :label="t('sys.app.releaseContent')"
        name="releaseContent"
        :rules="[
          {
            required: true,
            whitespace: true,
          },
        ]"
      >
        <a-textarea
          v-model:value="formState.releaseContent"
          :rows="5"
          show-count
          :maxlength="120"
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
  import { getCommitLogCanReleaseTagList } from '/@/apis/gct-apaas/CommitLogController';
  import type { CreateReleaseRequest } from '/@/apis/gct-apaas/model';
  import { postPublishLogCreateRelease } from '/@/apis/gct-apaas/PublishLogController';

  const emit = defineEmits(['ok']);

  const { t } = useI18n();
  const [registerInner, { closeModal, changeOkLoading }] = useModalInner((data) => {
    if (!data) return;

    getCommitLogCanReleaseTagList().then((res) => {
      const data = res ?? [];
      commitTags.value = data;
      if (data[0]) {
        formState.commitTag = data[0];
      }
    });

    Object.assign(formState, {
      ...data,
    });
  });

  const formRef = ref<FormInstance>();
  const formState: CreateReleaseRequest = reactive({
    commitTag: undefined,
    releaseContent: undefined,
  });
  const commitTags = ref<string[]>([]);

  const handleClose = () => {
    formRef.value?.resetFields();
  };

  const handleOk = async () => {
    changeOkLoading(true);
    try {
      await formRef.value?.validate();
      await postPublishLogCreateRelease({
        ...formState,
        releaseContent: formState.releaseContent?.trim() ?? '',
      });
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
