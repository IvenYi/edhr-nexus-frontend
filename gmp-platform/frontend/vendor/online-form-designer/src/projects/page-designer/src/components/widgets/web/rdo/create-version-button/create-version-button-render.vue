<template>
  <!-- 新版本的BaseButton -->
  <baseButton :widget="widget" v-bind="widget.props" @click="sumbit" />
</template>

<script setup lang="ts" name="gct-create-version-button">
  import basicButton from '../../__components__/basic_button.vue';
  import baseButton from '../../__components__/base_button.vue';
  import { ref, toRefs, onBeforeMount, onMounted, watchEffect, inject } from 'vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { Button } from '/@page-designer/types/web';

  const props = defineProps<{ widget: Button; formData?: object }>();
  const tableEvent = inject<any>('tableEvent', {});
  const Event = getPageEvent();

  async function sumbit() {
    try {
      await Event.runEventByName('beforeCreate', props.widget.events, props.formData);
      tableEvent.createVersion && (await tableEvent.createVersion(props.formData, props.widget));
      await Event.runEventByName('afterCreate', props.widget.events, props.formData);
    } catch (error) {}
  }
  defineExpose({});
</script>
<style scoped lang="less"></style>
