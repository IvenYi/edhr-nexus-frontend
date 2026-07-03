<template>
  <ConfigProvider :locale="getAntdLocale">
    <modal-inner @register="register" @ok="handleOk"
  /></ConfigProvider>
</template>
<script setup lang="ts">
  import ModalInner from './modal-inner.vue';
  import { useModal } from '/@/components/Modal';
  import { useLocale } from '/@/locales/useLocale';
  import { ConfigProvider } from 'ant-design-vue';
  const { getAntdLocale } = useLocale();
  const [register, { openModal }] = useModal();

  const open = () => {
    openModal(true, {});
  };

  const handleOk = () => {
    console.log('okk');
  };

  defineExpose({
    open,
  });
</script>

<style lang="less"></style>
