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

<script setup lang="ts" name="online-form-qrcode-render">
  import ContainerItem from '/@online-form/views/__widgets__/container/container-item.vue';
  import { ComponentTypeEnum } from '@gct/nocode-base';

  import type { IQrcode } from '@gct/nocode-base';

  defineProps<{ widget: IQrcode; formData: Object }>();
</script>
