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

<script setup lang="ts" name="onimage-form-image-render">
  import { ComponentTypeEnum, type IImage } from '@gct/nocode-base';
  import ContainerItem from '../container/container-item.vue';

  defineProps<{ widget: IImage; formData: any }>();
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
