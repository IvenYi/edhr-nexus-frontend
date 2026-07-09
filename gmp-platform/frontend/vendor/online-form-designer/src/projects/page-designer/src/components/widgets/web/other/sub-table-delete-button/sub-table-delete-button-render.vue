<template>
  <baseButton :widget="widget" v-bind="widget.props" :loading="loading" @click="onclick" />
</template>

<script setup lang="ts" name="gct-sub-table-delete-button">
  import baseButton from '../../__components__/base_button.vue';
  import { inject, ref, toRefs } from 'vue';
  import { Button } from '/@page-designer/types/web';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  const Event = getPageEvent();
  const props = defineProps<{ widget: Button; formData?: object }>();
  const tableEvent = inject<any>('tableEvent', {});
  const loading = ref(false);

  async function onclick() {
    loading.value = true;
    try {
      await Event.runEventByName('beforeDelete', props.widget.events, props.formData);
      tableEvent.delete && (await tableEvent.delete(props.formData, props.widget));
      await Event.runEventByName('afterDelete', props.widget.events, props.formData);
    } catch (error) {}
    loading.value = false;
  }
  defineExpose({});
</script>
<style scoped lang="less"></style>
