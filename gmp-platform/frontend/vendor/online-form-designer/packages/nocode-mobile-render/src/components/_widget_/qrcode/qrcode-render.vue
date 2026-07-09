<template>
  <div class="qrcode-area" :data-component="ComponentTypeEnum.Qrcode">
    <container-item
      :key="widget.id"
      :widget="widget.props"
      :pageFormState="formData"
      :is-in-cell="true"
    />
  </div>
</template>

<script setup lang="ts" name="online-form-barcode-render">
  import { ComponentTypeEnum, type IQrcode } from '@gct/nocode-base';
  import ContainerItem from '../container/container-item.vue';

  defineProps<{ widget: IQrcode; formData: any }>();
</script>
<style scoped></style>
