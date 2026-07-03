<template>
  <i18n-select-container @register="register" />
</template>
<script setup lang="ts">
  import I18nSelectContainer from './i18n-select-container.vue';
  import { useModal } from '/@/components/Modal';

  const [register, { openModal }] = useModal();

  const open = () => {
    openModal();
  };

  defineExpose({
    open,
  });
</script>

<style lang="less"></style>
