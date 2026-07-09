<template>
  <div class="diagonal-area" :data-component="ComponentTypeEnum.Diagonal" :style="widget.style">
    <container-item
      :key="widget.id"
      :widget="widget.props"
      :pageFormState="formData"
      :is-in-cell="true"
    />
  </div>
</template>

<script setup lang="ts" name="online-form-diagonal-render">
  import ContainerItem from '/@online-form/views/__widgets__/container/container-item.vue';
  import { ComponentTypeEnum } from '@gct/nocode-base';

  import type { IDiagonal } from '@gct/nocode-base';

  defineProps<{ widget: IDiagonal; formData: Object }>();
</script>
<style scoped>
  .diagonal-area {
    font-size: 14px;
  }
</style>
