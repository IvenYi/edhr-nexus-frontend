<template>
  <!-- 新版本的BaseButton -->
  <baseButton :widget="widget" v-bind="widget.props" :loading="loading" @click="onclick" />
</template>

<script setup lang="ts" name="gct-modeling-button">
  import baseButton from '../../__components__/base_button.vue';
  import { ref, inject } from 'vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { Button } from '/@page-designer/types/web';
  const tableEvent = inject<any>('tableEvent', {});
  const props = defineProps<{ widget: Button; formData?: object }>();
  const Event = getPageEvent();
  const loading = ref(false);
  async function onclick() {
    try {
      loading.value = true;
      await Event.runEventByName('beforeClick', props.widget.events, props.formData);
      tableEvent.modelingTraceability &&
        (await tableEvent.modelingTraceability(props.formData, props.widget));
      await Event.runEventByName('afterClick', props.widget.events, props.formData);
    } catch (error) {
      console.log(error);
    }
    loading.value = false;
  }
  defineExpose({});
</script>
<style scoped lang="less"></style>
