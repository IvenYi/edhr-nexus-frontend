<template>
  <basic-modal
    v-bind="$attrs"
    @register="register"
    :height="320"
    :title="
      type === 'ADD'
        ? t('sys.setting') + t('sys.platform.signaturePassword')
        : t('sys.changePassword')
    "
    width="650px"
    :closable="false"
    :maskClosable="false"
    :afterClose="handleClose"
    :cancelText="''"
    :keyboard="false"
    @cancel="cancelModal"
    @ok="handleOk"
  >
    <password ref="passwordRef" :type="type" @getPwdInfo="getPwdInfo" />
  </basic-modal>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { BasicModal, useModal } from '/@/components/Modal';
  import password from './password.vue';
  import { getUserLastResetPwd } from '/@/apis/gct-platform/UserController';

  const { t } = useI18n();

  const passwordRef = ref();

  const [register, { openModal, closeModal }] = useModal();
  let modalResolve: (any) => void = () => {};

  const handleOk = () => {
    passwordRef.value?.handleOk();

    modalResolve(passwordRef.value?.passwordModel);
  };
  const typeInfo = ref();

  const type = computed(() => {
    if (typeInfo.value?.needSetSignPass) {
      return 'ADD';
    }
    if (typeInfo.value?.needChangePass && typeInfo.value?.needChangeSignPass) {
      return 'BOTH';
    }
    if (typeInfo.value?.needChangePass) {
      return 'LOGIN';
    }
    if (typeInfo.value?.needChangeSignPass) {
      return 'SIGN';
    }
    return 'none';
  });

  const getPwdInfo = async () => {
    const res = await getUserLastResetPwd();
    if (!res?.needChangePass && !res?.needChangeSignPass && !res?.needSetSignPass) {
      closeModal();
    } else {
      typeInfo.value = res;
    }
  };

  const open = async (userLastPwdInfo) => {
    openModal();
    typeInfo.value = userLastPwdInfo;
    return new Promise((resolve) => {
      modalResolve = resolve;
    });
  };

  const handleClose = () => {
    Object.assign(passwordRef.value?.passwordModel, {
      oldPassword: '',
      newPassword: '',
      confirm: '',
    });
    passwordRef.value?.handleClose();
  };

  const cancelModal = (e) => {
    if (e.keyCode === 27) {
      // 检查是否按下ESC键
      e.stopPropagation(); // 阻止事件冒泡
      e.preventDefault(); // 阻止默认行为
    }
  };

  defineExpose({
    open,
  });
</script>

<style scoped lang="less"></style>
