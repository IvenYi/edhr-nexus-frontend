<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :title="isEdit ? t('sys.appDesigner.depolyment') : t('sys.appDesigner.detail')"
    centered
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <template v-if="!isEdit" #footer> </template>
    <div class="title" v-if="isEdit">{{ t('sys.appDesigner.publishContent') }}</div>
    <a-textarea
      :disabled="!isEdit"
      class="--resize-none textarea"
      v-model:value="content"
      show-count
      :maxlength="200"
    />
  </basic-modal>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { postAppReleaseRelease } from '/@/apis/gct-apaas/AppReleaseController';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();
  const emit = defineEmits(['needLoop']);

  const content = ref('');
  const isEdit = ref(true);

  const [registerInner, { closeModal }] = useModalInner((data) => {
    data && onDataReceive(data);
  });

  const onDataReceive = (data) => {
    content.value = data.content;
    isEdit.value = data.isEdit;
  };

  const handleClose = () => {
    isEdit.value = false;
    content.value = '';
    closeModal();
  };

  const handleOk = () => {
    if (isEdit.value) {
      //部署相关
      postAppReleaseRelease({ content: content.value });
    } else {
      // 修改发布内容
    }
    isEdit.value = false;
    closeModal();
    emit('needLoop');
  };
</script>

<style lang="less" scoped>
  .textarea {
    height: 200px;
    margin-top: 18px;
  }
</style>
