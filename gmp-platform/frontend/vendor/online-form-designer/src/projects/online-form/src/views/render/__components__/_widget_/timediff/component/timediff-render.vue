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
  import ContainerItem from '/@online-form/views/__widgets__/container/container-item.vue';
  import { ComponentTypeEnum } from '@gct/nocode-base';

  import type { ITimediff } from '@gct/nocode-base';

  defineProps<{ widget: ITimediff; formData: Object }>();
</script>
