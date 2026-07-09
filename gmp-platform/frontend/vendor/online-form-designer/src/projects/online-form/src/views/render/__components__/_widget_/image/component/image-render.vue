<template>
  <div class="image-area" :data-component="ComponentTypeEnum.Image">
    <container-item
      :key="widget.id"
      :widget="widget.props"
      :pageFormState="formData"
      :is-in-cell="true"
    />
  </div>
</template>

<script setup lang="ts" name="online-form-image-render">
  import ContainerItem from '/@online-form/views/__widgets__/container/container-item.vue';
  import { ComponentTypeEnum } from '@gct/nocode-base';

  import type { IImage } from '@gct/nocode-base';

  defineProps<{ widget: IImage; formData: Object }>();
</script>
<style scoped>
  .image-area {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    overflow: hidden;
  }
</style>
