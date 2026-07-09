<template>
  <div class="timediff-area" :data-component="ComponentTypeEnum.Timediff">
    <container-item
      :key="widget.id"
      :widget="widget.props"
      :pageFormState="formData"
      :is-in-cell="true"
    />
  </div>
</template>

<script setup lang="ts" name="online-form-timediff-render">
  import { ComponentTypeEnum, type ITimediff } from '@gct/nocode-base';
  import ContainerItem from '../container/container-item.vue';

  defineProps<{ widget: ITimediff; formData: any }>();
</script>
<style scoped></style>
