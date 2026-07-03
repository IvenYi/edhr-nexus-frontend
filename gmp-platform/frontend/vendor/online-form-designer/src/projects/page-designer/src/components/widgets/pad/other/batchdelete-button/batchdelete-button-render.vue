<template>
  <vantButton :widget="widget" v-bind="widget.props" :loading="loading" @click="onclick" />
</template>

<script setup lang="ts" name="gct-batchdelete-button">
  import vantButton from '../../__components__/vantButton.vue';
  import { ref, reactive, inject } from 'vue';
  import { Button } from '/@page-designer/types/web';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  const Event = getPageEvent();
  const props = defineProps<{ widget: Button }>();
  const tableEvent = inject<any>('tableEvent', {});

  const loading = ref(false);

  async function onclick() {
    try {
      loading.value = true;
      await Event.runEventByName('beforeDelete', props.widget.events, props.formData);
      tableEvent.deleteByChecked && (await tableEvent.deleteByChecked());
      await Event.runEventByName('afterDelete', props.widget.events, props.formData);
    } catch (error) {
      console.error(error);
    }
    loading.value = false;
  }

  defineExpose({});
</script>
<style lang="less"></style>
