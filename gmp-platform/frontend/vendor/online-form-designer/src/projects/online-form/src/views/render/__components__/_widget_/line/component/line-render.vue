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
  import ContainerItem from '/@online-form/views/__widgets__/container/container-item.vue';
  import { ComponentTypeEnum } from '@gct/nocode-base';

  import type { ILine } from '@gct/nocode-base';

  defineProps<{ widget: ILine; formData: Object }>();
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
