<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :title="t('sys.license.confirmUnbind')"
    centered
    width="700px"
    :minHeight="100"
    :maskClosable="false"
    @ok="handleOk"
  >
    {{ t('sys.license.unbindMessage') }}
  </basic-modal>
</template>

<script setup lang="ts">
  import { reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from 'vue-i18n';

  const emit = defineEmits(['unbind']);
  const { t } = useI18n();

  const formState = reactive({
    id: '',
  });
  //Modal
  const [registerInner, { closeModal }] = useModalInner((data) => {
    if (data) {
      formState.id = data.id;
    }
  });

  const handleOk = () => {
    emit('unbind', formState.id);
    closeModal();
  };
</script>

<style scoped></style>
