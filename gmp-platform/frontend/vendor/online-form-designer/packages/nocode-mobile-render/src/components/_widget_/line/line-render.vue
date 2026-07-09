<template>
  <div class="line-area" :data-component="ComponentTypeEnum.Line">
    <container-item
      :key="widget.id"
      :widget="widget.props"
      :pageFormState="formData"
      :is-in-cell="true"
    />
  </div>
</template>

<script setup lang="ts" name="online-form-line-render">
  import { ComponentTypeEnum, type ILine } from '@gct/nocode-base';
  import ContainerItem from '../container/container-item.vue';

  defineProps<{ widget: ILine; formData: any }>();
</script>
<style scoped>
  .line-area {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    overflow: hidden;
  }
</style>
