<template>
  <div class="barcode-area" :data-component="ComponentTypeEnum.Barcode">
    <container-item
      :key="widget.id"
      :widget="widget.props"
      :pageFormState="formData"
      :is-in-cell="true"
    />
  </div>
</template>

<script setup lang="ts" name="online-form-barcode-render">
  import ContainerItem from '/@online-form/views/__widgets__/container/container-item.vue';
  import { ComponentTypeEnum } from '@gct/nocode-base';

  import type { IBarcode } from '@gct/nocode-base';

  defineProps<{ widget: IBarcode; formData: Object }>();
</script>
<style scoped>
  .barcode-area {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    overflow: hidden;
  }
</style>
