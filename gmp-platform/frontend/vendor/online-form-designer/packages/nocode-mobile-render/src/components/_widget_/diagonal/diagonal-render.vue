<template>
  <div class="diagonal-area" :data-component="ComponentTypeEnum.Diagonal">
    <container-item
      :key="widget.id"
      :widget="widget.props"
      :pageFormState="formData"
      :is-in-cell="true"
    />
  </div>
</template>

<script setup lang="ts" name="online-form-diagonal-render">
  import { ComponentTypeEnum, type IBarcode } from '@gct/nocode-base';
  import ContainerItem from '../container/container-item.vue';

  defineProps<{ widget: IBarcode; formData: any }>();
</script>
<style scoped>
  .diagonal-area {
    font-size: 14px;
  }
</style>
